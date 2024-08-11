import { Control, Controller } from "react-hook-form";

import { FormControl, Input, SecretInput, Select, SelectItem } from "@app/components/v2";
import { CardProvider, CredentialType } from "@app/hooks/api/credentials";

import { UserCredentialsFormData } from "./schema";

type Props = {
  credentialType: CredentialType;
  control: Control<UserCredentialsFormData>;
};

export function CredentialDataSharedFormFields({ credentialType, control }: Props) {
  return (
    <>
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
      {credentialType === CredentialType.CREDIT_CARD ? (
        <>
          <Controller
            control={control}
            name="data.holderName"
            render={({ field: { onChange, ...field }, fieldState: { error } }) => (
              <FormControl label="Holder name" isError={Boolean(error)} errorText={error?.message}>
                <Input {...field} type="text" />
              </FormControl>
            )}
          />
          <Controller
            control={control}
            name="data.provider"
            render={({ field: { onChange, ...field }, fieldState: { error } }) => (
              <FormControl label="Type" errorText={error?.message} isError={Boolean(error)}>
                <Select
                  defaultValue={field.value}
                  {...field}
                  onValueChange={(e) => onChange(e)}
                  className="w-full"
                >
                  {Object.values(CardProvider).map((name) => (
                    <SelectItem value={name} key={name}>
                      {name}
                    </SelectItem>
                  ))}
                </Select>
              </FormControl>
            )}
          />
          <Controller
            control={control}
            name="data.cardNumber"
            render={({ field, fieldState: { error } }) => (
              <FormControl
                label="Number"
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
          <Controller
            control={control}
            name="data.verificationNumber"
            render={({ field, fieldState: { error } }) => (
              <FormControl
                label="Verification number"
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
    </>
  );
}
