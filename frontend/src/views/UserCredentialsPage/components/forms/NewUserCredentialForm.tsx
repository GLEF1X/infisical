import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { createNotification } from "@app/components/notifications";
import { Button, FormControl, Input, SecretInput, Select, SelectItem } from "@app/components/v2";
import { CredentialType, useCreateUserCredential } from "@app/hooks/api/credentials";

import { type UserCredentialsFormData, formSchema } from "./schema";

type Props = {
  onSubmit?: () => void;
};

export function NewUserCredentialForm({ onSubmit }: Props) {
  const createCredential = useCreateUserCredential();

  const {
    control,
    watch,
    handleSubmit,
    formState: { isSubmitting }
  } = useForm<UserCredentialsFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: CredentialType.WEB_LOGIN
    }
  });
  const credentialType = watch("type");

  const onFormSubmit = async (data: UserCredentialsFormData) => {
    try {
      await createCredential.mutateAsync(data);
      onSubmit?.();
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
          <FormControl label="Credential type" errorText={error?.message} isError={Boolean(error)}>
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
