"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { User } from "../@type/user";
import { useState } from "react";
import { getUsers } from "../services/getUsers";

async function createUser(user: Omit<User, "id">): Promise<User> {
  const res = await fetch("/api/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(user),
  });
  if (!res.ok) {
    throw new Error("Erro ao criar usuário");
  }
  return res.json();
}

async function updateUser(user: User): Promise<User> {
  const res = await fetch(`/api/users/${user.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(user),
  });
  if (!res.ok) {
    throw new Error("Erro ao atualizar usuário");
  }
  return res.json();
}

async function deleteUser(id: string): Promise<void> {
  const res = await fetch(`/api/users/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    throw new Error("Erro ao deletar usuário");
  }
}

export default function ListUsers({ initialData }: { initialData: User[] }) {
  const queryClient = useQueryClient();

  const page = 1;
  const limit = 10;

  const usersQuery = useQuery<User[]>({
    queryKey: ["users", page, limit],
    queryFn: () => getUsers({ page, limit }),
    initialData,
  });

  const createMutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  const [newUser, setNewUser] = useState<Omit<User, "id">>({
    firstName: "",
    lastName: "",
    email: "",
    isActive: false,
    profileId: "",
  });

  const users = usersQuery.data;

  if (usersQuery.isLoading) return <div className="text-center py-8 text-lg">Carregando...</div>;
  if (usersQuery.error instanceof Error)
    return <div className="text-red-600 text-center py-8">Erro: {usersQuery.error.message}</div>;

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center text-blue-700">Usuários</h2>
      <div className="space-y-4 mb-8">
        {users?.map((user) => (
          <div
            key={user.id}
            className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-4 shadow-sm"
          >
            <div>
              <h3 className="text-lg font-semibold text-blue-900">
                {user.firstName} {user.lastName}
              </h3>
              <p className="text-sm text-blue-700">{user.email}</p>
            </div>
            <div className="flex gap-2">
              <button
                className="px-3 py-1 bg-yellow-400 hover:bg-yellow-500 text-white rounded transition"
                onClick={() => updateMutation.mutate({ ...user, firstName: user.firstName + "!" })}
              >
                Atualizar
              </button>
              <button
                className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded transition"
                onClick={() => deleteMutation.mutate(user.id)}
              >
                Deletar
              </button>
            </div>
          </div>
        ))}
      </div>

      <h2 className="text-xl font-bold mb-4 text-blue-700">Criar novo usuário</h2>
      <div className="flex flex-col gap-3">
        <input
          type="text"
          placeholder="Primeiro nome"
          className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
          value={newUser.firstName}
          onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })}
        />
        <input
          type="text"
          placeholder="Sobrenome"
          className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
          value={newUser.lastName}
          onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })}
        />
        <input
          type="email"
          placeholder="E-mail"
          className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
          value={newUser.email}
          onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
        />
        <button
          className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded transition"
          onClick={() => createMutation.mutate(newUser)}
        >
          Criar
        </button>
      </div>
    </div>
  );
}
