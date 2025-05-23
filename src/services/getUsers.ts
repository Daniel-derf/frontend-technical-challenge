import { User } from "../@type/user";

const baseUrl = process.env.NEXT_PUBLIC_API_URL;

export async function getUsers({ page = 1, limit = 10 }: { page?: number; limit?: number }): Promise<User[]> {
  const res = await fetch(`${baseUrl}/users?page=${page}&limit=${limit}`);

  if (!res.ok) {
    throw new Error("Failed to fetch users");
  }

  const output: { data: User[] } = await res.json();

  const users = output.data;

  console.log("users: ", users);

  return users;
}
