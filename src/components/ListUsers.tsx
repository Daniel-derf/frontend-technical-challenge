import { User } from "../@type/user";

export default function ListUsers(props: { initialData?: User[] }) {
  const users = props.initialData;

  return (
    <>
      {users?.map((user) => {
        return (
          <div key={user.id}>
            <h1>
              {user.firstName} {user.lastName}
            </h1>
          </div>
        );
      })}
    </>
  );
}
