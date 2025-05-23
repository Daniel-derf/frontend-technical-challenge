import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getUsers } from "../services/user";

export const useGetUsers = (params, initialData) => {
  const queryClient = useQueryClient();

  return useQuery<User[]>({
    queryKey: ["users"],
    queryFn: getUsers,
  });
};
