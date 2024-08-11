import { BadRequestError } from "@app/lib/errors";
import { omit, shake } from "@app/lib/fn";

import { TKmsServiceFactory } from "../kms/kms-service";
import { KmsDataKey } from "../kms/kms-types";
import type { TCredentialDALFactory } from "./credential-dal";
import type {
  CredentialData,
  TCreateCredentialDTO,
  TCredentialOut,
  TGetSecretsDTO,
  TUpdateCredentialDTO
} from "./credential-types";

type TCredentialServiceFactoryDep = {
  credentialDAL: TCredentialDALFactory;
  kmsService: Pick<TKmsServiceFactory, "createCipherPairWithDataKey">;
};

export type TCredentialServiceFactory = ReturnType<typeof credentialServiceFactory>;

export const credentialServiceFactory = ({ credentialDAL, kmsService }: TCredentialServiceFactoryDep) => {
  const createCredential = async ({ orgId, type, userId, label, data }: TCreateCredentialDTO) => {
    const { encryptor: credentialManagerEncryptor } = await kmsService.createCipherPairWithDataKey({
      type: KmsDataKey.CredentialManager,
      orgId,
      userId
    });

    const credential = await credentialDAL.create({
      label,
      encryptedData: credentialManagerEncryptor({ plainText: Buffer.from(JSON.stringify(shake(data))) }).cipherTextBlob,
      userId,
      type,
      orgId
    });

    return { ...omit(credential, ["encryptedData"]), data } as TCredentialOut;
  };

  const updateCredential = async ({ data: update, type, credentialId, label }: TUpdateCredentialDTO) => {
    const credential = await credentialDAL.findOne({ id: credentialId });
    if (!credential) throw new BadRequestError({ message: "Credential not found" });
    if (credential.type !== type) throw new BadRequestError({ message: "credential type mismatch" });

    const { decryptor: credentialManagerDecryptor, encryptor: credentialManagerEncryptor } =
      await kmsService.createCipherPairWithDataKey({
        type: KmsDataKey.CredentialManager,
        orgId: credential.orgId,
        userId: credential.userId
      });
    const decryptedData = JSON.parse(
      credentialManagerDecryptor({ cipherTextBlob: credential.encryptedData }).toString()
    ) as CredentialData["data"];
    const updatedData = { ...decryptedData, ...update };

    const updatedCredential = await credentialDAL.updateById(credentialId, {
      label,
      encryptedData: credentialManagerEncryptor({ plainText: Buffer.from(JSON.stringify(shake(updatedData))) })
        .cipherTextBlob
    });

    return {
      ...omit(updatedCredential, ["encryptedData"]),
      data: decryptedData
    } as TCredentialOut;
  };

  const getCredentials = async ({ userId, orgId }: TGetSecretsDTO) => {
    const credentials = await credentialDAL.getAllSecretsInReverseChronologicalOrder(orgId, userId);
    const { decryptor: credentialManagerDecryptor } = await kmsService.createCipherPairWithDataKey({
      type: KmsDataKey.CredentialManager,
      orgId,
      userId
    });
    return credentials.map((credential) => {
      const { encryptedData, ...rest } = credential;
      return {
        ...rest,
        data: JSON.parse(
          credentialManagerDecryptor({ cipherTextBlob: encryptedData }).toString()
        ) as CredentialData["data"]
      } as TCredentialOut;
    });
  };

  return {
    createCredential,
    updateCredential,
    getCredentials
  };
};
