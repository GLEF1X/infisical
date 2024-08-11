import { randomSecureBytes } from "@app/lib/crypto";

import { TKmsServiceFactory } from "../kms/kms-service";
import { TCredentialKeysDALFactory } from "./credential-keys-dal";
import { TCreateCredentialKeyDTO } from "./credential-keys-types";

type TCredentialKeysServiceFactoryDep = {
  kmsService: Pick<TKmsServiceFactory, "generateKmsKey" | "encryptWithKmsKey">;
  credentialKeysDAL: TCredentialKeysDALFactory;
};

export type TCredentialKeysServiceFactoryFactory = ReturnType<typeof credentialKeysServiceFactory>;

export const credentialKeysServiceFactory = ({ kmsService, credentialKeysDAL }: TCredentialKeysServiceFactoryDep) => {
  const dataKey = randomSecureBytes();

  const createCredentialKey = async ({ orgId, userId }: TCreateCredentialKeyDTO) => {
    return credentialKeysDAL.transaction(async (tx) => {
      const kmsKey = await kmsService.generateKmsKey({
        isReserved: true,
        orgId,
        tx
      });

      const kmsEncryptor = await kmsService.encryptWithKmsKey(
        {
          kmsId: kmsKey.id
        },
        tx
      );
      const { cipherTextBlob } = await kmsEncryptor({
        plainText: dataKey
      });

      const credentialKey = await credentialKeysDAL.create(
        {
          userId,
          orgId,
          kmsSecretManagerKeyId: kmsKey.id,
          kmsSecretManagerEncryptedDataKey: cipherTextBlob
        },
        tx
      );

      return credentialKey;
    });
  };

  return {
    createCredentialKey
  };
};
