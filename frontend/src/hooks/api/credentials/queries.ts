import { useQuery } from "@tanstack/react-query";

import { apiRequest } from "@app/config/request";

import { TUserCredential } from "./types";

export const userCredentialsKeys = {
  allUserCredentials: () => ["userCredentials"] as const
}

// TODO: add pagination
export const useGetUserCredentials = () => useQuery({
  queryKey: userCredentialsKeys.allUserCredentials(),
  queryFn: async () => {
    const { data } = await apiRequest.get<Array<TUserCredential>>("/api/v3/credentials/raw")
    return data
  }
})