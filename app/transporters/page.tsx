import Link from "next/link";
import {
  AdminShell,
  Pagination,
  SetupError,
  StatCard,
  SurfaceCard,
  currency,
  formatDate,
  getPageNumber,
  paginateItems,
} from "../_components/admin-ui";
import { getDashboardData } from "../../lib/lr-data";

const PAGE_SIZE = 12;

export default async function TransportersPage({
  searchParams,
}: {
  searchParams?: Promise<{ page?: string }>;
}) {
  const { transporterBreakdown, stats, error } = await getDashboardData();
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const page = getPageNumber(resolvedSearchParams?.page);
  const paginated = paginateItems(transporterBreakdown, page, PAGE_SIZE);

  return (
    <AdminShell
      title="Transporter analytics"
      description="See each transporter, how many LRs they appear in, and the users and freight linked to them."
      section="transporters"
    >
      <section className="grid gap-4 md:grid-cols-4">
        <StatCard label="Transporters" value={transporterBreakdown.length.toString()} accent="sky" />
        <StatCard label="Total LRs" value={stats.totalRecords.toString()} accent="amber" />
        <StatCard label="Total freight" value={currency.format(stats.totalFreight)} accent="emerald" />
        <StatCard label="Pending" value={currency.format(stats.totalPending)} accent="sky" />
      </section>

      <SetupError error={error} />

      <SurfaceCard
        title="All transporters"
        subtitle="Paginated transporter-level analytics with LR totals and linked-user counts."
      >
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-5 py-3 font-medium">Transporter</th>
                <th className="px-5 py-3 font-medium">LR count</th>
                <th className="px-5 py-3 font-medium">Users</th>
                <th className="px-5 py-3 font-medium">Freight</th>
                <th className="px-5 py-3 font-medium">Latest LR</th>
                <th className="px-5 py-3 font-medium">Last activity</th>
              </tr>
            </thead>
            <tbody>
              {paginated.items.map((transporter) => (
                <tr key={transporter.key} className="border-t border-slate-100 align-top">
                  <td className="px-5 py-4">
                    <Link
                      href={`/transporters/${encodeURIComponent(transporter.key)}`}
                      className="font-medium text-slate-900 hover:text-sky-700"
                    >
                      {transporter.transporterName}
                    </Link>
                  </td>
                  <td className="px-5 py-4 font-medium text-slate-900">
                    {transporter.lrCount}
                  </td>
                  <td className="px-5 py-4 text-slate-600">
                    {transporter.phoneNumbers.length}
                  </td>
                  <td className="px-5 py-4 text-slate-600">
                    {currency.format(transporter.totalFreight)}
                  </td>
                  <td className="px-5 py-4 text-slate-600">
                    {transporter.latestLrNumber || "No LR number"}
                  </td>
                  <td className="px-5 py-4 text-slate-500">
                    {formatDate(transporter.latestCreatedAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination
          basePath="/transporters"
          page={paginated.page}
          totalPages={paginated.totalPages}
          totalItems={paginated.totalItems}
          startIndex={paginated.startIndex}
          endIndex={paginated.endIndex}
        />
      </SurfaceCard>
    </AdminShell>
  );
}
