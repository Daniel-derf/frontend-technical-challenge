const baseUrl = process.env.NEXT_PUBLIC_API_URL;

export async function getUsers({ page, limit }: { page: number; limit: number }) {
  const res = await fetch(`${baseUrl}/users?page=${page}&limit=${limit}`);

  if (!res.ok) {
    throw new Error("Failed to fetch users");
  }

  return res.json();
}
