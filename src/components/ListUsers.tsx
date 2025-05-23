"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { User } from "../@type/user";
import { useState } from "react";
import { createUser, deleteUser, getUsers, updateUser, switchUserStatus, getUsersByProfiles } from "../services/user";
import { getProfiles } from "../services/profile";
import { Profile } from "../@type/profile";

export default function ListUsers({ initialData }: { initialData: User[] }) {
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const limit = 5;

  const [selectedFilter, setSelectedFilter] = useState<string>("todos");

  const profilesQuery = useQuery<Profile[]>({
    queryKey: ["profiles"],
    queryFn: getProfiles,
  });

  const profiles = profilesQuery.data;

  const usersQuery = useQuery<User[]>({
    queryKey: ["users", selectedFilter, page, limit],
    queryFn: () => getUsers({ page, limit }),
    initialData,
    refetchOnMount: "always",
    enabled: selectedFilter === "todos",
  });

  const filteredUsersQuery = useQuery<User[]>({
    queryKey: ["usersByProfiles", selectedFilter, page, limit],
    queryFn: () => {
      if (!profiles) return Promise.resolve([]);
      const selectedProfile = profiles.find((p) => p.name.toLowerCase() === selectedFilter);
      if (!selectedProfile) return Promise.resolve([]);
      return getUsersByProfiles([selectedProfile.id], page, limit);
    },
    enabled: selectedFilter !== "todos" && !!profiles,
  });

  const createMutation = useMutation({
    mutationFn: createUser,
    onSettled: () => {
      queryClient.invalidateQueries();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ userData, userId }: { userData: Partial<User>; userId: string }) => updateUser(userData, userId),
    onSettled: () => {
      queryClient.invalidateQueries();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSettled: () => {
      queryClient.invalidateQueries();
    },
  });

  const switchStatusMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => switchUserStatus(id, isActive),
    onSettled: () => {
      queryClient.invalidateQueries();
    },
  });

  const [newUser, setNewUser] = useState<Omit<User, "id">>({
    firstName: "",
    lastName: "",
    email: "",
    profileId: "",
    isActive: true,
  });

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editUserData, setEditUserData] = useState<User | null>(null);

  const users = selectedFilter === "todos" ? usersQuery.data : filteredUsersQuery.data;

  const isLoading =
    (filteredUsersQuery.isLoading && selectedFilter !== "todos") || usersQuery.isLoading || profilesQuery.isLoading;

  const isError =
    (filteredUsersQuery.error instanceof Error && selectedFilter !== "todos") ||
    usersQuery.error instanceof Error ||
    profilesQuery.error instanceof Error;

  if (isLoading) {
    return <div className="text-center py-8 text-lg text-gray-800">Carregando...</div>;
  }

  if (isError) {
    return <div className="text-red-600 text-center py-8">Erro ao carregar dados.</div>;
  }

  const handleNextPage = () => setPage((prev) => prev + 1);
  const handlePrevPage = () => setPage((prev) => Math.max(prev - 1, 1));

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-900">Usuários</h2>

      <div className="mb-6">
        <label className="block mb-2 font-semibold text-gray-900">Filtrar por perfil:</label>
        <select
          className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 text-gray-900"
          value={selectedFilter}
          onChange={(e) => {
            setSelectedFilter(e.target.value);
            setPage(1); // resetar para a primeira página ao mudar filtro
          }}
        >
          <option value="todos">Todos</option>
          <option value="admin">Admin</option>
          <option value="user">User</option>
        </select>
      </div>

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
                onClick={() => {
                  setEditUserData(user);
                  setIsEditModalOpen(true);
                }}
              >
                Editar
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

      <div className="flex justify-between mb-6">
        <button
          className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded transition"
          onClick={handlePrevPage}
          disabled={page === 1}
        >
          Anterior
        </button>
        <span className="self-center">Página {page}</span>
        <button
          className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded transition"
          onClick={handleNextPage}
          disabled={(users?.length ?? 0) < limit}
        >
          Próximo
        </button>
      </div>

      {isEditModalOpen && editUserData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-96 space-y-4">
            <h2 className="text-xl font-bold text-gray-900">Editar Usuário</h2>

            <input
              type="text"
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 text-gray-900"
              value={editUserData.firstName}
              onChange={(e) => setEditUserData({ ...editUserData, firstName: e.target.value })}
            />
            <input
              type="text"
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 text-gray-900"
              value={editUserData.lastName}
              onChange={(e) => setEditUserData({ ...editUserData, lastName: e.target.value })}
            />
            <input
              type="email"
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 text-gray-900"
              value={editUserData.email}
              onChange={(e) => setEditUserData({ ...editUserData, email: e.target.value })}
            />

            <select
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 text-gray-900"
              value={editUserData.profileId}
              onChange={(e) => setEditUserData({ ...editUserData, profileId: e.target.value })}
            >
              <option value="">Selecione um perfil</option>
              {profiles?.map((profile) => (
                <option key={profile.id} value={profile.id}>
                  {profile.name}
                </option>
              ))}
            </select>

            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded transition cursor-pointer"
                onClick={() => setIsEditModalOpen(false)}
              >
                Cancelar
              </button>
              <button
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition cursor-pointer"
                onClick={() => {
                  if (editUserData) {
                    const { id, firstName, lastName, email, profileId } = editUserData;
                    updateMutation.mutate({ userData: { firstName, lastName, email, profileId }, userId: id });
                    setIsEditModalOpen(false);
                  }
                }}
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}

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
