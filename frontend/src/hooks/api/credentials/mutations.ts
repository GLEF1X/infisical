import { useMutation, useQueryClient } from "@tanstack/react-query";

import { apiRequest } from "@app/config/request";

import { userCredentialsKeys } from "./queries";
import type { TCreateUserCredential, TUpdateUserCredential, TUserCredential } from "./types";

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
      const { data } = await apiRequest.patch<TUserCredential>("/api/v3/credentials/", inputData);
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries(userCredentialsKeys.allUserCredentials())
  });
}