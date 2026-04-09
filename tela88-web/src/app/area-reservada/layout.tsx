import AreaReservadaShell from "@/components/admin/AreaReservadaShell";

export default function AreaReservadaLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <AreaReservadaShell>{children}</AreaReservadaShell>;
}
