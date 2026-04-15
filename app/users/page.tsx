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

export default async function UsersPage({
  searchParams,
}: {
  searchParams?: Promise<{ page?: string }>;
}) {
  const { userBreakdown, stats, error } = await getDashboardData();
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const page = getPageNumber(resolvedSearchParams?.page);
  const paginated = paginateItems(userBreakdown, page, PAGE_SIZE);

  return (
    <AdminShell
      title="Users by mobile number"
      description="See how many LR records each mobile number has created, plus freight and payment summaries."
      section="users"
    >
      <section className="grid gap-4 md:grid-cols-3">
        <StatCard label="Unique mobile users" value={stats.uniqueMobileUsers.toString()} accent="sky" />
        <StatCard label="Unique auth users" value={stats.uniqueUsers.toString()} accent="amber" />
        <StatCard label="Users missing mobile" value={stats.usersWithMissingPhone.toString()} accent="emerald" />
      </section>

      <SetupError error={error} />

      <SurfaceCard
        title="All users"
        subtitle="Paginated mobile-wise user records with LR counts and financial totals."
      >
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-5 py-3 font-medium">Mobile</th>
                <th className="px-5 py-3 font-medium">LR count</th>
                <th className="px-5 py-3 font-medium">Freight</th>
                <th className="px-5 py-3 font-medium">Pending</th>
                <th className="px-5 py-3 font-medium">Latest LR</th>
                <th className="px-5 py-3 font-medium">Last activity</th>
              </tr>
            </thead>
            <tbody>
              {paginated.items.map((user) => (
                <tr key={user.key} className="border-t border-slate-100 align-top">
                  <td className="px-5 py-4">
                    <Link
                      href={`/users/${encodeURIComponent(user.key)}`}
                      className="font-medium text-slate-900 hover:text-sky-700"
                    >
                      {user.phoneNumber}
                    </Link>
                    <p className="mt-1 text-xs text-slate-500">
                      {user.userIds[0] || "No auth user id"}
                    </p>
                  </td>
                  <td className="px-5 py-4 font-medium text-slate-900">{user.lrCount}</td>
                  <td className="px-5 py-4 text-slate-600">
                    {currency.format(user.totalFreight)}
                  </td>
                  <td className="px-5 py-4 text-slate-600">
                    {currency.format(user.totalPending)}
                  </td>
                  <td className="px-5 py-4 text-slate-600">
                    {user.latestLrNumber || "No LR number"}
                  </td>
                  <td className="px-5 py-4 text-slate-500">
                    {formatDate(user.latestCreatedAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination
          basePath="/users"
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
