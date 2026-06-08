import { getTripListPageData } from "../../lib/lr-data";
import {
    AdminShell,
    Pagination,
    SetupError, StatCard, SurfaceCard, formatDate, getPageNumber
} from "../_components/admin-ui";

const PAGE_SIZE = 15;

export default async function TripsPage({
  searchParams,
}: {
  searchParams?: Promise<{ page?: string }>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const page = getPageNumber(resolvedSearchParams?.page);
  const { trips, pagination, error } = await getTripListPageData(page, PAGE_SIZE);

  return (
    <AdminShell
      title="Trips"
      description="All trip records captured from the Traqo LR app, shown separately from LR records."
      section="trips"
    >
      <section className="grid gap-4 md:grid-cols-3 xl:grid-cols-4">
        <StatCard label="Total trips" value={pagination.totalItems.toString()} />
        <StatCard label="Page size" value={pagination.pageSize.toString()} />
        <StatCard
          label="Current page"
          value={`${pagination.page} / ${pagination.totalPages}`}
        />
      </section>

      <SetupError error={error} />

      <SurfaceCard title="Trip list" subtitle="Paginated trip records from the app frontend.">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-5 py-3 font-medium">Trip ID</th>
                <th className="px-5 py-3 font-medium">User</th>
                <th className="px-5 py-3 font-medium">Origin</th>
                <th className="px-5 py-3 font-medium">Destination</th>
                <th className="px-5 py-3 font-medium">Truck</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Created</th>
              </tr>
            </thead>
            <tbody>
              {trips.map((trip) => (
                <tr key={trip.id} className="border-t border-slate-100 align-top">
                  <td className="px-5 py-4 text-slate-900 font-medium">{trip.id}</td>
                  <td className="px-5 py-4 text-slate-600">
                    {trip.user_email || trip.user || trip.tel || "No user"}
                  </td>
                  <td className="px-5 py-4 text-slate-600">{trip.origin || "Unknown"}</td>
                  <td className="px-5 py-4 text-slate-600">{trip.destination || "Unknown"}</td>
                  <td className="px-5 py-4 text-slate-600">{trip.truck_number || "Unknown"}</td>
                  <td className="px-5 py-4 text-slate-600">
                    {String(trip.response?.status || "unknown").replaceAll("_", " ")}
                  </td>
                  <td className="px-5 py-4 text-slate-500">{formatDate(trip.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Pagination
          basePath="/trips"
          page={pagination.page}
          totalPages={pagination.totalPages}
          totalItems={pagination.totalItems}
          startIndex={pagination.startIndex}
          endIndex={pagination.endIndex}
        />
      </SurfaceCard>
    </AdminShell>
  );
}
