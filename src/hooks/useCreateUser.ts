import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getUsers } from "../services/getUsers";

export const useCreateUser = (params: any, initialData?: any) => {
  const queryClient = useQueryClient();

  return useQuery<User[]>({
    queryKey: ["users"],
    queryFn: getUsers,
  });
};
