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
import { getUserDashboard } from "../../../lib/lr-data";

const PAGE_SIZE = 10;

export default async function UserDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ userKey: string }>;
  searchParams?: Promise<{ page?: string }>;
}) {
  const { userKey } = await params;
  const decodedKey = decodeURIComponent(userKey);
  const { user, lrs, error } = await getUserDashboard(decodedKey);
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const page = getPageNumber(resolvedSearchParams?.page);
  const paginated = paginateItems(lrs, page, PAGE_SIZE);

  if (!user) {
    notFound();
  }

  return (
    <AdminShell
      title={`User: ${user.phoneNumber}`}
      description="A dedicated page for one mobile number, including LR counts and record-level details."
      section="users"
    >
      <section className="grid gap-4 md:grid-cols-4">
        <StatCard label="Total LRs" value={user.lrCount.toString()} accent="sky" />
        <StatCard label="Total freight" value={currency.format(user.totalFreight)} accent="emerald" />
        <StatCard label="Total paid" value={currency.format(user.totalPaid)} accent="amber" />
        <StatCard label="Pending" value={currency.format(user.totalPending)} accent="sky" />
      </section>

      <SetupError error={error} />

      <section className="grid gap-6 xl:grid-cols-[1fr_1.7fr]">
        <SurfaceCard title="User summary">
          <div className="grid gap-4 p-5 text-sm sm:p-6">
            <DetailRow label="Mobile" value={user.phoneNumber} />
            <DetailRow label="User IDs" value={user.userIds.join(", ") || "None"} />
            <DetailRow label="Packages" value={String(user.totalPackages)} />
            <DetailRow label="Latest LR" value={user.latestLrNumber || "None"} />
            <DetailRow label="Last created" value={formatDate(user.latestCreatedAt)} />
            <DetailRow label="Last updated" value={formatDate(user.latestUpdatedAt)} />
          </div>
        </SurfaceCard>

        <SurfaceCard
          title="User LRs"
          actions={
            <Link href="/users" className="text-sm font-medium text-sky-700">
              Back to users
            </Link>
          }
        >
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-medium">LR</th>
                  <th className="px-5 py-3 font-medium">Transporter</th>
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
                      {lr.transporterName || "No transporter"}
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
            basePath={`/users/${encodeURIComponent(user.key)}`}
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
