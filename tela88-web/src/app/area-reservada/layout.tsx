import AreaReservadaShell from "@/components/admin/AreaReservadaShell";
import { getAuthenticatedAdmin } from "@/lib/auth";

export default async function AreaReservadaLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const initialUser = await getAuthenticatedAdmin();
  return <AreaReservadaShell initialUser={initialUser}>{children}</AreaReservadaShell>;
}
