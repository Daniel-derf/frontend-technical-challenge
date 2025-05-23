import { getUsers } from "../../services/user";
import ListUsers from "../../components/ListUsers";

export default async function Inicio() {
  const users = await getUsers({ page: 1, limit: 10 });

  return (
    <div>
      <h1>Usuários disponíveis:</h1>
      <ListUsers initialData={users} />
    </div>
  );
}
