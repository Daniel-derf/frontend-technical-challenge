import { User } from "../../@type/user";
import ListUsers from "../../components/ListUsers";

export default async function Inicio() {
  const users: User[] = await getUsers();

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <h1>Usuários disponíveis:</h1>
      <ListUsers initialData={users} />
    </div>
  );
}

async function getUsers() {
  const res = await fetch("/api/users");
  if (!res.ok) {
    throw new Error("Failed to fetch users");
  }
  return res.json();
}
