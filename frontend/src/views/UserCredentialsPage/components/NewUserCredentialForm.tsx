/* eslint-disable import/no-extraneous-dependencies */
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import isCreditCard from "validator/lib/isCreditCard";
import isDate from "validator/lib/isDate";
import isPostalCode from "validator/lib/isPostalCode";
import { z } from "zod";

import { createNotification } from "@app/components/notifications";
import { Button, FormControl, Input, SecretInput, Select, SelectItem } from "@app/components/v2";
import { CardProvider, CredentialType, useCreateUserCredential } from "@app/hooks/api/credentials";
import { UsePopUpState } from "@app/hooks/usePopUp";

export const creditCardDataSchema = z
  .object({
    holderName: z
      .string()
      .trim()
      .min(1)
      .max(255)
      .regex(/^[\d\s-]*$/)
      .optional(),
    provider: z.nativeEnum(CardProvider).optional(),
    cardNumber: z.string().trim().optional(),
    verificationNumber: z.number().optional(),
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
      .trim()
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
  username: z.string().trim().min(1).optional(),
  password: z.string().trim().min(1).optional()
});

export const secureNoteSchema = z.object({
  content: z.string().trim().min(1).optional()
});

export const schema = z.discriminatedUnion("type", [
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
export type FormData = z.infer<typeof schema>;

type Props = {
  handlePopUpClose: (popUpName: keyof UsePopUpState<["createUserCredential"]>) => void;
};

export function NewUserCredentialForm({ handlePopUpClose }: Props) {
  const createCredential = useCreateUserCredential();

  const {
    control,
    reset,
    watch,
    handleSubmit,
    formState: { isSubmitting }
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      type: CredentialType.WEB_LOGIN
    }
  });

  const credentialType = watch("type");

  const onFormSubmit = async (data: FormData) => {
    try {
      await createCredential.mutateAsync(data);
      handlePopUpClose("createUserCredential");
    } catch (error) {
      console.error(error);
      createNotification({
        text: "Failed to create a credential",
        type: "error"
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)}>
      <Controller
        control={control}
        name="label"
        render={({ field, fieldState: { error } }) => (
          <FormControl label="Name (Optional)" isError={Boolean(error)} errorText={error?.message}>
            <Input {...field} type="text" />
          </FormControl>
        )}
      />
      <Controller
        control={control}
        name="type"
        defaultValue={CredentialType.WEB_LOGIN}
        render={({ field: { onChange, ...field }, fieldState: { error } }) => (
          <FormControl label="Expires In" errorText={error?.message} isError={Boolean(error)}>
            <Select
              defaultValue={field.value}
              {...field}
              onValueChange={(e) => onChange(e)}
              className="w-full"
            >
              {Object.values(CredentialType).map((name) => (
                <SelectItem value={name} key={name}>
                  {name}
                </SelectItem>
              ))}
            </Select>
          </FormControl>
        )}
      />
      {credentialType === CredentialType.WEB_LOGIN ? (
        <>
          <Controller
            control={control}
            name="data.username"
            render={({ field, fieldState: { error } }) => (
              <FormControl label="Username" isError={Boolean(error)} errorText={error?.message}>
                <Input {...field} type="text" />
              </FormControl>
            )}
          />
          <Controller
            control={control}
            name="data.password"
            render={({ field, fieldState: { error } }) => (
              <FormControl
                label="Password"
                isError={Boolean(error)}
                errorText={error?.message}
                className="mb-2"
              >
                <SecretInput
                  {...field}
                  containerClassName="text-bunker-300 hover:border-primary-400/50 border border-mineshaft-600 bg-mineshaft-900 px-2 py-1.5"
                />
              </FormControl>
            )}
          />
        </>
      ) : null}
      {credentialType === CredentialType.SECURE_NOTE ? (
        <Controller
          control={control}
          name="data.content"
          render={({ field, fieldState: { error } }) => (
            <FormControl
              label="Secure note"
              isError={Boolean(error)}
              errorText={error?.message}
              className="mb-2"
            >
              <textarea
                placeholder="Add any notes about this item here"
                {...field}
                className="h-40 min-h-[70px] w-full rounded-md border border-mineshaft-600 bg-mineshaft-900 py-1.5 px-2 text-bunker-300 outline-none transition-all placeholder:text-mineshaft-400 hover:border-primary-400/30 focus:border-primary-400/50 group-hover:mr-2"
              />
            </FormControl>
          )}
        />
      ) : null}
      <Button
        className="mt-4"
        size="sm"
        type="submit"
        isLoading={isSubmitting}
        isDisabled={isSubmitting}
      >
        Create credential
      </Button>
    </form>
  );
}
