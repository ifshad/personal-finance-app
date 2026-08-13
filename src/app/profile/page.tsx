import { redirect } from "next/navigation";
import { getServerAuthUser } from "@/server/auth/session";
import { getCurrentUser } from "@/server/services/auth.service";
import { ProfileForm } from "@/components/auth/profile-form";
import { LogoutButton } from "@/components/auth/logout-button";

export default async function ProfilePage() {
  const auth = await getServerAuthUser();
  if (!auth) {
    redirect("/login");
  }

  const user = await getCurrentUser(auth.userId);

  return (
    <div className="mx-auto w-full max-w-md space-y-6 p-4 pb-24">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Your profile</h1>
        <p className="text-sm text-muted-foreground">{user.email}</p>
      </div>
      <ProfileForm user={user} />
      <LogoutButton />
    </div>
  );
}
