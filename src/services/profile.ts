import { Profile } from "../@type/profile";

const baseUrl = process.env.NEXT_PUBLIC_API_URL;

export async function getProfiles(): Promise<Profile[]> {
  const res = await fetch(`${baseUrl}/profiles`);

  if (!res.ok) {
    throw new Error("Failed to fetch profiles");
  }

  const output: { data: Profile[] } = await res.json();

  const users = output.data;

  return users;
}
