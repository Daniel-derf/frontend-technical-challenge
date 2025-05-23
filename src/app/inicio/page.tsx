import { getUsers } from "../../services/getUsers";
import ListUsers from "../../components/ListUsers";

export default async function Inicio() {
  const { data: users } = await getUsers({ page: 1, limit: 10 });

  console.log("users: ", users);

  return (
    <div>
      <h1>Usuários disponíveis:</h1>
      <ListUsers initialData={users} />
    </div>
  );
}
