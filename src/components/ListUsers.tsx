import { User } from "../@type/user";

export default function ListUsers(props: { initialData?: User[] }) {
  const users = props.initialData;

  return (
    <>
      {users?.map((user) => {
        <div>
          <h1>
            {user.firstName} {user.lastName}
          </h1>
        </div>;
      })}
    </>
  );
}
