import { Profile } from "../@type/profile";

const baseUrl = process.env.NEXT_PUBLIC_API_URL;

export async function getProfiles(): Promise<Profile[]> {
  const res = await fetch(`${baseUrl}/users/profiles`);

  if (!res.ok) {
    throw new Error("Failed to fetch profiles");
  }

  const profiles: Profile[] = await res.json();

  console.log("profiles: ", profiles);

  return profiles;
}
