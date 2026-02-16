import { redirect } from "next/navigation";

export default async function AuditPage({
  params,
}: {
  params: Promise<{ locale: string; auditId: string }>;
}) {
  const { locale, auditId } = await params;
  redirect(`/${locale}/audit/${auditId}/dashboard`);
}
