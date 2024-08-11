export type GetUserCredentialsDTO = {}

export enum CardProvider {
  AMEX = "amex",
  DINERS_CLUB = "dinersclub",
  DISCOVER = "discover",
  JCB = "jcb",
  MASTERCARD = "mastercard",
  UNIONPAY = "unionpay",
  VISA = "visa"
}

export enum CredentialType {
  WEB_LOGIN = "web-login",
  CREDIT_CARD = "credit-card",
  SECURE_NOTE = "secure-note"
}

export type CreditCard = {
  cardNumber?: string;
  holderName?: string;
  provider?: CardProvider;
  verificationNumber?: string;
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

export type TUserCredential = {
  id: string;
  type: CredentialType;
  userId: string;
  orgId: string;
  createdAt: Date;
  updatedAt: Date;
  label?: string;
} & CredentialData;

export type TCreateUserCredential = CredentialData & {
  label?: string;
}

export type TDeleteUserCredential = {
  credentialId: string;
}

export type TUpdateUserCredential = {
  credentialId: string;
  label?: string;
} & CredentialData;