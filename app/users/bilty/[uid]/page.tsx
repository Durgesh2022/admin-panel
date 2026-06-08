import Link from "next/link";
import { notFound } from "next/navigation";
import {
  AdminShell,
  DetailRow,
  SetupError,
  SurfaceCard,
  formatDate,
} from "../../../_components/admin-ui";
import { getBiltyUserByUid } from "../../../../lib/lr-data";

export default async function BiltyUserDetailPage({ params }: { params: Promise<{ uid: string }> }) {
  const { uid } = await params;
  const decodedUid = decodeURIComponent(uid);
  const { user, error } = await getBiltyUserByUid(decodedUid);

  if (!user) {
    notFound();
  }

  return (
    <AdminShell
      title={`Bilty user: ${user?.id || decodedUid}`}
      description="Detailed biltyUser document from the LR app."
      section="users"
    >
      <SetupError error={error} />

      <section className="grid gap-6 xl:grid-cols-[1fr_1.7fr]">
        <SurfaceCard title="User summary">
          <div className="grid gap-4 p-5 text-sm sm:p-6">
            <DetailRow label="UID" value={user?.id} />
            <DetailRow label="Phone" value={(user?.phoneNumber as string) || "—"} />
            <DetailRow label="Name / Owner" value={(user?.name as string) || (user?.ownerName as string) || "—"} />
            <DetailRow label="Email" value={(user?.email as string) || "—"} />
            <DetailRow label="Transporter" value={(user?.transporterName as string) || "—"} />
            <DetailRow label="Transporter address" value={(user?.transporterAddress as string) || "—"} />
            <DetailRow label="Company GSTIN" value={(user?.companyGstin as string) || "—"} />
            <DetailRow label="Platform" value={(user?.platform as string) || "—"} />
            <DetailRow label="Created" value={formatDate(user?.createdAt as unknown as Date)} />
            <DetailRow label="Updated" value={formatDate(user?.updatedAt as unknown as Date)} />
          </div>
        </SurfaceCard>

        <SurfaceCard title="Raw document">
          <pre className="whitespace-pre-wrap break-words p-5 text-xs sm:p-6">{JSON.stringify(user, null, 2)}</pre>
        </SurfaceCard>
      </section>
    </AdminShell>
  );
}
