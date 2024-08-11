import { useMutation, useQueryClient } from "@tanstack/react-query";

import { apiRequest } from "@app/config/request";

import { userCredentialsKeys } from "./queries";
import type { TCreateUserCredential, TDeleteUserCredential, TUpdateUserCredential, TUserCredential } from "./types";

export const useCreateUserCredential = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (inputData: TCreateUserCredential) => {
      const { data } = await apiRequest.post<TUserCredential>("/api/v3/credentials/raw", inputData);
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries(userCredentialsKeys.allUserCredentials())
  });
};

export const useUpdateUserCredential = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (inputData: TUpdateUserCredential) => {
      // TODO: remove credentialId from body
      const { data } = await apiRequest.patch<TUserCredential>(`/api/v3/credentials/raw/${inputData.credentialId}`, inputData);
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries(userCredentialsKeys.allUserCredentials())
  });
}

export const useDeleteUserCredential = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (inputData: TDeleteUserCredential) => {
      // TODO: remove credentialId from body
      const { data } = await apiRequest.delete<TUserCredential>(`/api/v3/credentials/raw/${inputData.credentialId}`);
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries(userCredentialsKeys.allUserCredentials())
  });
}