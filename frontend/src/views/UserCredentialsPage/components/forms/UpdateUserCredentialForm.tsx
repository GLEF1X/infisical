
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { createNotification } from "@app/components/notifications";
import { Button, FormControl, Input } from "@app/components/v2";
import { TUpdateUserCredential, TUserCredential, useUpdateUserCredential } from "@app/hooks/api/credentials";

import { CredentialDataSharedFormFields } from "./CredentialDataSharedFormFields";
import { formSchema, UserCredentialsFormData } from "./schema";

type UpdateCredentialProps = {
  credential: TUserCredential;
}

export const UpdateUserCredentialsForm = ({credential}: UpdateCredentialProps) => {
  const updateUserCredential = useUpdateUserCredential()
  const {
    control,
    reset,
    handleSubmit,
    formState: { isSubmitting, isDirty, isSubmitted }
  } = useForm<UserCredentialsFormData>({
    resolver: zodResolver(formSchema),
    values: credential,
  });

  useEffect(() => {
    // NOTE: here we're making sure that the form is reset and isDirty set to false
    // This helps us to disable update button after a succesful submission.
    // More on this https://github.com/react-hook-form/react-hook-form/issues/3097
    if (isSubmitted) {
      reset({}, { keepValues: true });
    }
  }, [isSubmitted, reset]);

  const onFormSubmit = async (formData: UserCredentialsFormData) => {
    try {
      await updateUserCredential.mutateAsync({
        credentialId: credential.id,
        data: formData.data,
        type: credential.type,
        label: formData.label
      } as TUpdateUserCredential)
      createNotification({
        text: "Successfully updated credential",
        type: "success"
      });
    } catch(error) {
      console.error(error);
      createNotification({
        text: "Failed to update credential",
        type: "error"
      });
    }
  }

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
      <CredentialDataSharedFormFields control={control} credentialType={credential.type}/>
      <Button
        size="sm"
        type="submit"
        isLoading={isSubmitting}
        isDisabled={!isDirty || isSubmitting}
      >
        Update
      </Button>
    </form>
  )
}