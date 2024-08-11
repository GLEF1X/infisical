import { CredentialType, TCredentials } from "@app/db/schemas";
import { CardProvider } from "@app/lib/types";

export type CreditCard = {
  cardNumber?: string;
  holderName?: string;
  provider?: CardProvider;
  verificationNumber?: number;
  expireAt?: string;
  postalCode?: string;
};

export type SecureNote = {
  content?: string;
};

export type WebLogin = {
  username?: string;
  password?: string;
};

export type CredentialData =
  | {
      type: CredentialType.CREDIT_CARD;
      data: CreditCard;
    }
  | {
      type: CredentialType.SECURE_NOTE;
      data: SecureNote;
    }
  | {
      type: CredentialType.WEB_LOGIN;
      data: WebLogin;
    };

export type TCreateCredentialDTO = {
  orgId: string;
  userId: string;
  label?: string;
} & CredentialData;

export type TCredentialOut = Omit<TCredentials, "type" | "encryptedData"> & CredentialData;

export type TUpdateCredentialDTO = {
  credentialId: string;
  label?: string;
} & CredentialData;

export type TGetSecretsDTO = {
  userId: string;
  orgId: string;
};
