import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { createNotification } from "@app/components/notifications";
import { Button, FormControl, Input, Select, SelectItem } from "@app/components/v2";
import { CredentialType, useCreateUserCredential } from "@app/hooks/api/credentials";

import { CredentialDataSharedFormFields } from "./CredentialDataSharedFormFields";
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
    formState: { isSubmitting },
    getFieldState,
    setValue
  } = useForm<UserCredentialsFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: CredentialType.WEB_LOGIN,
    }
  });
  const credentialType = watch("type");

  useEffect(() => {
    const isLabelFieldDirty = getFieldState("label").isDirty
    if (isLabelFieldDirty) return
    switch (credentialType) {
      case CredentialType.WEB_LOGIN: {
        setValue("label", "Login")    
        break;
      }
      case CredentialType.CREDIT_CARD: {
        setValue("label", "Credit Card")
        break;
      }
      case CredentialType.SECURE_NOTE: {
        setValue("label", "Secure note")
        break;
      }
      default:
    }
  }, [credentialType])

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
      <CredentialDataSharedFormFields control={control} credentialType={credentialType}/>
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
