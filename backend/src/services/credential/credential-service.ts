import { BadRequestError } from "@app/lib/errors";
import { omit, shake } from "@app/lib/fn";

import { TKmsServiceFactory } from "../kms/kms-service";
import { KmsDataKey } from "../kms/kms-types";
import type { TCredentialDALFactory } from "./credential-dal";
import type {
  CredentialData,
  TCreateCredentialDTO,
  TCredentialOut,
  TDeleteCredentialDTO,
  TGetCredentialsDTO,
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
      encryptedLabel: label ? credentialManagerEncryptor({ plainText: Buffer.from(label) }).cipherTextBlob : null,
      encryptedData: credentialManagerEncryptor({ plainText: Buffer.from(JSON.stringify(shake(data))) }).cipherTextBlob,
      userId,
      type,
      orgId
    });

    return { ...omit(credential, ["encryptedData", "encryptedLabel"]), data, label } as TCredentialOut;
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
    const credentialDataToUpdate = {
      encryptedData: credentialManagerEncryptor({ plainText: Buffer.from(JSON.stringify(shake(updatedData))) })
        .cipherTextBlob
    };

    // If label is actually presented in request as null or as a value
    if (label !== undefined) {
      const encryptedLabel = label
        ? credentialManagerEncryptor({ plainText: Buffer.from(label) }).cipherTextBlob
        : null;
      // @ts-expect-error TODO: fix this type error by assing credentialDataToUpdate update payload type
      credentialDataToUpdate.encryptedLabel = encryptedLabel;
    }

    const updatedCredential = await credentialDAL.updateById(credentialId, credentialDataToUpdate);

    return {
      ...omit(updatedCredential, ["encryptedData", "encryptedLabel"]),
      data: decryptedData,
      label
    } as TCredentialOut;
  };

  const getCredentials = async ({ userId, orgId }: TGetCredentialsDTO) => {
    const credentials = await credentialDAL.getAllSecretsInReverseChronologicalOrder(orgId, userId);
    const { decryptor: credentialManagerDecryptor } = await kmsService.createCipherPairWithDataKey({
      type: KmsDataKey.CredentialManager,
      orgId,
      userId
    });
    return credentials.map((credential) => {
      const { encryptedData, encryptedLabel, ...rest } = credential;

      return {
        ...rest,
        data: JSON.parse(
          credentialManagerDecryptor({ cipherTextBlob: encryptedData }).toString()
        ) as CredentialData["data"],
        label: encryptedLabel ? credentialManagerDecryptor({ cipherTextBlob: encryptedLabel }).toString() : null
      } as TCredentialOut;
    });
  };

  const deleteCredential = async ({ credentialId }: TDeleteCredentialDTO) => {
    await credentialDAL.deleteById(credentialId);
  };

  return {
    createCredential,
    updateCredential,
    getCredentials,
    deleteCredential
  };
};
