import isCreditCard from "validator/lib/isCreditCard";
import isDate from "validator/lib/isDate";
import isPostalCode from "validator/lib/isPostalCode";
import { z } from "zod";

import { CardProvider, CredentialType } from "@app/hooks/api/credentials";

export const creditCardDataSchema = z
  .object({
    holderName: z
      .string()
      .min(1)
      .max(255)
      .regex(/^[\d\s-]*$/)
      .optional(),
    provider: z.nativeEnum(CardProvider).optional(),
    cardNumber: z.string().optional(),
    verificationNumber: z.string().optional(),
    // TODO: upgrade to zod 3.23 to get string date validation out of the box
    expireAt: z
      .string()
      .optional()
      .refine((expireAt) => {
        if (!expireAt) return true;

        // TODO: Check date is the first of the month
        return isDate(expireAt, {
          format: "MM-DD-YYY"
        });
      }),
    postalCode: z
      .string()
      .refine((postalCode) => {
        // FIXME: add i18n locale
        return isPostalCode(postalCode, "US");
      })
      .optional()
  })
  .refine(
    (data) => {
      if (!data.cardNumber) {
        return true;
      }

      return isCreditCard(data.cardNumber, {
        provider: data.provider
      });
    },
    {
      message: "Must be a valid credit card number",
      path: ["cardNumber"]
    }
  );

export const loginDataSchema = z.object({
  username: z.string().min(1).optional(),
  password: z.string().min(1).optional()
});

export const secureNoteSchema = z.object({
  content: z.string().min(1).optional()
});

export const formSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal(CredentialType.CREDIT_CARD),
    data: creditCardDataSchema,
    label: z.string().optional()
  }),
  z.object({
    type: z.literal(CredentialType.SECURE_NOTE),
    data: secureNoteSchema,
    label: z.string().optional()
  }),
  z.object({
    type: z.literal(CredentialType.WEB_LOGIN),
    data: loginDataSchema,
    label: z.string().optional()
  })
]);
export type UserCredentialsFormData = z.infer<typeof formSchema>;