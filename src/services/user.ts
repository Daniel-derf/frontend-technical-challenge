import { User } from "../@type/user";

const baseUrl = process.env.NEXT_PUBLIC_API_URL;

export async function getUsers({ page = 1, limit = 10 }: { page?: number; limit?: number }): Promise<User[]> {
  const res = await fetch(`${baseUrl}/users?page=${page}&limit=${limit}`);

  if (!res.ok) {
    throw new Error("Failed to fetch users");
  }

  const output: { data: User[] } = await res.json();

  const users = output.data;

  return users;
}

export async function createUser(user: Omit<User, "id">): Promise<User> {
  console.log("body: ", JSON.stringify(user));

  const res = await fetch(`${baseUrl}/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(user),
  });

  console.log("res: ", res);

  if (!res.ok) {
    throw new Error("Erro ao criar usuário");
  }

  return res.json();
}

export async function updateUser(user: User): Promise<User> {
  const res = await fetch(`${baseUrl}/users/${user.id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(user),
  });

  if (!res.ok) {
    throw new Error("Erro ao atualizar usuário");
  }

  const output = await res.json();
  return output.user;
}

export async function deleteUser(id: string): Promise<void> {
  const res = await fetch(`${baseUrl}/users/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    throw new Error("Erro ao deletar usuário");
  }
}

export async function switchUserStatus(id: string, isActive: boolean): Promise<void> {
  const res = await fetch(`${baseUrl}/users/${id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ isActive }),
  });

  if (!res.ok) {
    throw new Error("Erro ao alterar status do usuário");
  }
}

export async function getUserById(id: string): Promise<User> {
  const res = await fetch(`${baseUrl}/users/${id}`);

  if (!res.ok) {
    throw new Error("Usuário não encontrado");
  }

  return res.json();
}

export async function getUsersByProfiles(profiles: string[], page = 1, limit = 10): Promise<User[]> {
  const profilesParam = profiles.join(",");
  const res = await fetch(`${baseUrl}/users/filter/by-profiles?profiles=${profilesParam}&page=${page}&limit=${limit}`);

  if (!res.ok) {
    throw new Error("Erro ao filtrar usuários por perfis");
  }

  const output: { data: User[] } = await res.json();
  return output.data;
}
