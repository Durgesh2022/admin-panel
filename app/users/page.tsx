import Link from "next/link";
import { getBiltyUserListPageData, getDashboardData } from "../../lib/lr-data";
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
  const bpage = getPageNumber((resolvedSearchParams as any)?.bpage);
  const bilty = await getBiltyUserListPageData(bpage, PAGE_SIZE);

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

      {/* Removed the previous "All users" SurfaceCard per request */}

      <SurfaceCard title="Bilty users (from LR app)" subtitle="Documents from the biltyUser collection in the LR app.">
        <SetupError error={bilty.error} />
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-5 py-3 font-medium">UID</th>
                <th className="px-5 py-3 font-medium">Mobile</th>
                <th className="px-5 py-3 font-medium">Name / Owner</th>
                <th className="px-5 py-3 font-medium">Email</th>
                <th className="px-5 py-3 font-medium">Created</th>
              </tr>
            </thead>
            <tbody>
              {bilty.users.map((user) => (
                <tr key={user.id} className="border-t border-slate-100 align-top">
                  <td className="px-5 py-4 font-medium text-slate-900">
                    <Link
                      href={`/users/bilty/${encodeURIComponent(user.id)}`}
                      className="font-medium text-slate-900 hover:text-sky-700"
                    >
                      {user.id}
                    </Link>
                  </td>
                  <td className="px-5 py-4 text-slate-600">{user.phoneNumber || '—'}</td>
                  <td className="px-5 py-4 text-slate-600">{(user.name as string) || (user.ownerName as string) || '—'}</td>
                  <td className="px-5 py-4 text-slate-600">{(user.email as string) || '—'}</td>
                  <td className="px-5 py-4 text-slate-500">{formatDate(user.createdAt as unknown as Date)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination
          basePath="/users"
          page={bilty.pagination.page}
          totalPages={bilty.pagination.totalPages}
          totalItems={bilty.pagination.totalItems}
          startIndex={bilty.pagination.startIndex}
          endIndex={bilty.pagination.endIndex}
        />
      </SurfaceCard>
    </AdminShell>
  );
}
