import Link from "next/link";
import { getLrListPageData } from "../../lib/lr-data";
import {
    AdminShell,
    Pagination,
    SetupError,
    StatCard,
    SurfaceCard,
    currency,
    formatDate,
    getPageNumber,
} from "../_components/admin-ui";

const paymentTone: Record<string, string> = {
  paid: "bg-emerald-100 text-emerald-900",
  to_pay: "bg-amber-100 text-amber-900",
  to_be_billed: "bg-sky-100 text-sky-900",
};

const PAGE_SIZE = 15;

export default async function LrsPage({
  searchParams,
}: {
  searchParams?: Promise<{ page?: string }>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const page = getPageNumber(resolvedSearchParams?.page);
  const { lrs, stats, pagination, error } = await getLrListPageData(page, PAGE_SIZE);

  return (
    <AdminShell
      title="All LR records"
      description="Every LR record in the collection, with links into individual LR detail pages."
      section="lrs"
    >
      <section className="grid gap-4 md:grid-cols-4">
        <StatCard label="Total LRs" value={stats.totalRecords.toString()} accent="sky" />
        <StatCard label="Paid LRs" value={stats.paidLrs.toString()} accent="emerald" />
        <StatCard label="To pay LRs" value={stats.toPayLrs.toString()} accent="amber" />
        <StatCard label="To be billed LRs" value={stats.billedLrs.toString()} accent="sky" />
      </section>

      <SetupError error={error} />

      <SurfaceCard
        title="LR list"
        subtitle="Paginated LR records with direct links into the full single-LR detail page."
      >
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-5 py-3 font-medium">LR</th>
                <th className="px-5 py-3 font-medium">Mobile</th>
                <th className="px-5 py-3 font-medium">Transporter</th>
                <th className="px-5 py-3 font-medium">Score</th>
                <th className="px-5 py-3 font-medium">Payment</th>
                <th className="px-5 py-3 font-medium">Freight</th>
                <th className="px-5 py-3 font-medium">Shares</th>
                <th className="px-5 py-3 font-medium">Created</th>
              </tr>
            </thead>
            <tbody>
              {lrs.map((lr) => (
                <tr key={lr.id} className="border-t border-slate-100 align-top">
                  <td className="px-5 py-4">
                    <Link
                      href={`/lrs/${encodeURIComponent(lr.id)}`}
                      className="font-medium text-slate-900 hover:text-sky-700"
                    >
                      {lr.lrNumber || lr.id}
                    </Link>
                    <p className="mt-1 text-xs text-slate-500">{lr.id}</p>
                  </td>
                  <td className="px-5 py-4 text-slate-600">{lr.phoneNumber || lr.userId || "No user"}</td>
                  <td className="px-5 py-4 text-slate-600">
                    {lr.transporterName || "No transporter"}
                  </td>
                  <td className="px-5 py-4 text-slate-900 font-semibold">
                    {typeof lr.completionScore === "number"
                      ? `${lr.completionScore.toFixed(1)}/10`
                      : "0.0/10"}
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${paymentTone[lr.paymentType || ""] || "bg-slate-100 text-slate-700"}`}>
                      {(lr.paymentType || "unknown").replaceAll("_", " ")}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-slate-600">
                    {currency.format(lr.totalFreight ?? 0)}
                  </td>
                  <td className="px-5 py-4 text-slate-600">
                    {lr.shareCount ?? 0}
                  </td>
                  <td className="px-5 py-4 text-slate-500">{formatDate(lr.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination
          basePath="/lrs"
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