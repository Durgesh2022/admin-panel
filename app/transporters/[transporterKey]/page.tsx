import Link from "next/link";
import { notFound } from "next/navigation";
import {
  AdminShell,
  DetailRow,
  Pagination,
  SetupError,
  StatCard,
  SurfaceCard,
  currency,
  formatDate,
  getPageNumber,
  paginateItems,
} from "../../_components/admin-ui";
import { getTransporterDashboard, getUserKeyForRecord } from "../../../lib/lr-data";

const PAGE_SIZE = 10;

export default async function TransporterDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ transporterKey: string }>;
  searchParams?: Promise<{ page?: string }>;
}) {
  const { transporterKey } = await params;
  const decodedKey = decodeURIComponent(transporterKey);
  const { transporter, lrs, error } = await getTransporterDashboard(decodedKey);
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const page = getPageNumber(resolvedSearchParams?.page);
  const paginated = paginateItems(lrs, page, PAGE_SIZE);

  if (!transporter) {
    notFound();
  }

  return (
    <AdminShell
      title={`Transporter: ${transporter.transporterName}`}
      description="A dedicated page for one transporter, with linked users and LR records."
      section="transporters"
    >
      <section className="grid gap-4 md:grid-cols-4">
        <StatCard label="Total LRs" value={transporter.lrCount.toString()} accent="sky" />
        <StatCard label="Linked users" value={transporter.phoneNumbers.length.toString()} accent="amber" />
        <StatCard label="Total freight" value={currency.format(transporter.totalFreight)} accent="emerald" />
        <StatCard label="Pending" value={currency.format(transporter.totalPending)} accent="sky" />
      </section>

      <SetupError error={error} />

      <section className="grid gap-6 xl:grid-cols-[1fr_1.7fr]">
        <SurfaceCard title="Transporter summary">
          <div className="grid gap-4 p-5 text-sm sm:p-6">
            <DetailRow label="Transporter" value={transporter.transporterName} />
            <DetailRow label="Phones" value={transporter.phoneNumbers.join(", ") || "None"} />
            <DetailRow label="User IDs" value={transporter.userIds.join(", ") || "None"} />
            <DetailRow label="Packages" value={String(transporter.totalPackages)} />
            <DetailRow label="Latest LR" value={transporter.latestLrNumber || "None"} />
            <DetailRow label="Last created" value={formatDate(transporter.latestCreatedAt)} />
          </div>
        </SurfaceCard>

        <SurfaceCard
          title="Transporter LRs"
          actions={
            <Link href="/transporters" className="text-sm font-medium text-sky-700">
              Back to transporters
            </Link>
          }
        >
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-medium">LR</th>
                  <th className="px-5 py-3 font-medium">Mobile</th>
                  <th className="px-5 py-3 font-medium">Route</th>
                  <th className="px-5 py-3 font-medium">Freight</th>
                  <th className="px-5 py-3 font-medium">Created</th>
                </tr>
              </thead>
              <tbody>
                {paginated.items.map((lr) => (
                  <tr key={lr.id} className="border-t border-slate-100 align-top">
                    <td className="px-5 py-4">
                      <Link
                        href={`/lrs/${encodeURIComponent(lr.id)}`}
                        className="font-medium text-slate-900 hover:text-sky-700"
                      >
                        {lr.lrNumber || lr.id}
                      </Link>
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      <Link
                        href={`/users/${encodeURIComponent(getUserKeyForRecord(lr))}`}
                        className="hover:text-sky-700"
                      >
                        {lr.phoneNumber || lr.userId || "No user"}
                      </Link>
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {lr.fromLocation || "Unknown"} to {lr.toLocation || "Unknown"}
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {currency.format(lr.totalFreight ?? 0)}
                    </td>
                    <td className="px-5 py-4 text-slate-500">{formatDate(lr.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination
            basePath={`/transporters/${encodeURIComponent(transporter.key)}`}
            page={paginated.page}
            totalPages={paginated.totalPages}
            totalItems={paginated.totalItems}
            startIndex={paginated.startIndex}
            endIndex={paginated.endIndex}
          />
        </SurfaceCard>
      </section>
    </AdminShell>
  );
}
