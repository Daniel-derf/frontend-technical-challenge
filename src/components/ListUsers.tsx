"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { User } from "../@type/user";
import { useState } from "react";
import { createUser, deleteUser, getUsers, updateUser, switchUserStatus } from "../services/user";
import { getProfiles } from "../services/profile";
import { Profile } from "../@type/profile";

export default function ListUsers({ initialData }: { initialData: User[] }) {
  const queryClient = useQueryClient();

  const page = 1;
  const limit = 999;

  const usersQuery = useQuery<User[]>({
    queryKey: ["users", page, limit],
    queryFn: () => getUsers({ page, limit }),
    initialData,
    refetchOnMount: "always",
  });

  const profilesQuery = useQuery<Profile[]>({
    queryKey: ["profiles"],
    queryFn: getProfiles,
  });

  const createMutation = useMutation({
    mutationFn: createUser,
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["users"], exact: false });
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateUser,
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["users"], exact: false });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["users"], exact: false });
    },
  });

  const switchStatusMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => switchUserStatus(id, isActive),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["users"], exact: false });
    },
  });

  const [newUser, setNewUser] = useState<Omit<User, "id">>({
    firstName: "",
    lastName: "",
    email: "",
    profileId: "",
    isActive: true,
  });

  const users = usersQuery.data;
  const profiles = profilesQuery.data;

  if (usersQuery.isLoading || profilesQuery.isLoading)
    return <div className="text-center py-8 text-lg text-gray-800">Carregando...</div>;

  if (usersQuery.error instanceof Error || profilesQuery.error instanceof Error)
    return <div className="text-red-600 text-center py-8">Erro ao carregar dados.</div>;

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-900">Usuários</h2>

      <div className="space-y-4 mb-8">
        {users?.map((user) => (
          <div
            key={user.id}
            className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-4 shadow-sm"
          >
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {user.firstName} {user.lastName}
              </h3>
              <p className="text-sm text-gray-800">{user.email}</p>
              <p className="text-xs text-gray-700">Perfil: {user.profileId}</p>
              <p className="text-xs text-gray-800">
                Status:{" "}
                <span className={user.isActive ? "text-green-700" : "text-red-700"}>
                  {user.isActive ? "Ativo" : "Inativo"}
                </span>
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <button
                className="px-3 py-1 bg-yellow-400 hover:bg-yellow-500 text-white rounded transition cursor-pointer"
                onClick={() => updateMutation.mutate({ ...user, firstName: user.firstName + "!" })}
              >
                Atualizar
              </button>

              <button
                className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded transition cursor-pointer"
                onClick={() => deleteMutation.mutate(user.id)}
              >
                Deletar
              </button>

              <button
                className={`px-3 py-1 ${
                  user.isActive ? "bg-gray-500" : "bg-green-500"
                } hover:opacity-80 text-white rounded transition cursor-pointer`}
                onClick={() => switchStatusMutation.mutate({ id: user.id, isActive: !user.isActive })}
              >
                {user.isActive ? "Desativar" : "Ativar"}
              </button>
            </div>
          </div>
        ))}
      </div>

      <h2 className="text-xl font-bold mb-4 text-gray-900">Criar novo usuário</h2>
      <div className="flex flex-col gap-3">
        <input
          type="text"
          placeholder="Primeiro nome"
          className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 text-gray-900"
          value={newUser.firstName}
          onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })}
        />
        <input
          type="text"
          placeholder="Sobrenome"
          className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 text-gray-900"
          value={newUser.lastName}
          onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })}
        />
        <input
          type="email"
          placeholder="E-mail"
          className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 text-gray-900"
          value={newUser.email}
          onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
        />

        <select
          className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 text-gray-900"
          value={newUser.profileId}
          onChange={(e) => setNewUser({ ...newUser, profileId: e.target.value })}
        >
          <option value="">Selecione um perfil</option>
          {profiles?.map((profile) => (
            <option key={profile.id} value={profile.id}>
              {profile.name}
            </option>
          ))}
        </select>

        <button
          className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded transition cursor-pointer"
          onClick={() => createMutation.mutate(newUser)}
        >
          Criar
        </button>
      </div>
    </div>
  );
}
