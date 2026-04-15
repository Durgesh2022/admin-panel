import Link from "next/link";
import { notFound } from "next/navigation";
import {
    getLrDetail,
    getTransporterKeyForRecord,
    getUserKeyForRecord,
} from "../../../lib/lr-data";
import {
    AdminShell,
    DetailRow,
    SetupError,
    SurfaceCard,
    currency,
    formatDate,
} from "../../_components/admin-ui";

export default async function LrDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const decodedId = decodeURIComponent(id);
  const { lr, error } = await getLrDetail(decodedId);

  if (!lr) {
    notFound();
  }

  return (
    <AdminShell
      title={`LR ${lr.lrNumber || lr.id}`}
      description="Detailed view of a single lorry receipt with route, shipment, party, and item information."
      section="lrs"
    >
      <SetupError error={error} />

      <section className="grid gap-4 md:grid-cols-4">
        <SummaryTile label="LR Number" value={lr.lrNumber || "Not provided"} />
        <SummaryTile label="LR Date" value={lr.lrDate || "Not provided"} />
        <SummaryTile label="Transporter" value={lr.transporterName || "Not provided"} />
        <SummaryTile
          label="Completion score"
          value={
            typeof lr.completionScore === "number"
              ? `${lr.completionScore.toFixed(1)}/10`
              : "0.0/10"
          }
        />
      </section>

      <SurfaceCard
        title="Record summary"
        actions={
          <div className="flex flex-wrap gap-2">
            <ActionLink href="/lrs">Back to all LRs</ActionLink>
            <ActionLink href={`/users/${encodeURIComponent(getUserKeyForRecord(lr))}`}>
              Open user
            </ActionLink>
            <ActionLink
              href={`/transporters/${encodeURIComponent(
                getTransporterKeyForRecord(lr)
              )}`}
            >
              Open transporter
            </ActionLink>
          </div>
        }
      >
        <div className="grid gap-6 p-5 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="grid gap-6 md:grid-cols-2">
            <SectionBlock title="Core details">
              <DetailRow label="Document ID" value={lr.id} />
              <DetailRow label="Mobile" value={lr.phoneNumber || "Not provided"} />
              <DetailRow label="User ID" value={lr.userId || "Not provided"} />
              <DetailRow label="Created" value={formatDate(lr.createdAt)} />
              <DetailRow label="Updated" value={formatDate(lr.updatedAt)} />
            </SectionBlock>

            <SectionBlock title="Route and vehicle">
              <DetailRow label="From" value={lr.fromLocation || "Not provided"} />
              <DetailRow label="To" value={lr.toLocation || "Not provided"} />
              <DetailRow label="Truck number" value={lr.truckNumber || "Not provided"} />
              <DetailRow label="Driver name" value={lr.driverName || "Not provided"} />
              <DetailRow label="E-Way bill" value={lr.ewayBill || "Not provided"} />
            </SectionBlock>

            <SectionBlock title="Consignor">
              <DetailRow label="Name" value={lr.consignorName || "Not provided"} />
              <DetailRow label="Description" value={lr.description || "Not provided"} />
            </SectionBlock>

            <SectionBlock title="Consignee">
              <DetailRow label="Name" value={lr.consigneeName || "Not provided"} />
              <DetailRow label="Remark" value={lr.remark || "Not provided"} />
            </SectionBlock>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-5">
            <h3 className="text-sm font-semibold text-slate-950">Amount summary</h3>
            <div className="mt-4 space-y-4">
              <AmountRow label="Freight" value={currency.format(lr.totalFreight ?? 0)} />
              <AmountRow label="Paid amount" value={currency.format(lr.paidAmount ?? 0)} />
              <AmountRow label="Extra charges" value={currency.format(lr.extraCharges ?? 0)} />
              <AmountRow label="Invoice value" value={currency.format(lr.invoiceValue ?? 0)} />
              <AmountRow label="GST" value={formatPercent(lr.gstPercent)} />
              <AmountRow label="Packages" value={String(lr.totalPackages ?? 0)} />
              <AmountRow label="Total weight" value={lr.totalWeight || "Not provided"} />
              <AmountRow label="Invoice no." value={lr.invoiceNumber || "Not provided"} />
              <AmountRow label="Share count" value={String(lr.shareCount ?? 0)} />
              <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-3 last:border-b-0 last:pb-0">
                <span className="text-sm text-slate-500">Shared PDF</span>
                {lr.sharePdfUrl ? (
                  
                    <a
    href={lr.sharePdfUrl}
    target="_blank"
    rel="noopener noreferrer"
    className="text-sm font-semibold text-blue-600 hover:underline"
  >
    View PDF ↗
  </a>
                ) : (
                  <span className="text-sm font-semibold text-slate-950">
                    Not generated
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </SurfaceCard>

      <SurfaceCard
        title="Line items"
        subtitle="Item-level details attached to this LR."
      >
        {!lr.items || lr.items.length === 0 ? (
          <div className="px-5 py-10 text-sm text-slate-500">
            No line items were stored for this LR.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-medium">Item</th>
                  <th className="px-5 py-3 font-medium">Packages</th>
                  <th className="px-5 py-3 font-medium">Weight</th>
                  <th className="px-5 py-3 font-medium">Description</th>
                  <th className="px-5 py-3 font-medium">Amount</th>
                </tr>
              </thead>
              <tbody>
                {lr.items.map((item, index) => (
                  <tr
                    key={item.id || `${lr.id}-item-${index}`}
                    className="border-t border-slate-100"
                  >
                    <td className="px-5 py-4 text-slate-900">
                      {item.id || `Item ${index + 1}`}
                    </td>
                    <td className="px-5 py-4 text-slate-600">{item.packages ?? 0}</td>
                    <td className="px-5 py-4 text-slate-600">
                      {item.weight || "Not provided"}
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {item.description || "Not provided"}
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {currency.format(item.amount ?? 0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SurfaceCard>
    </AdminShell>
  );
}

function SummaryTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-4 py-4 shadow-sm">
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-lg font-semibold text-slate-950">{value}</p>
    </div>
  );
}

function SectionBlock({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <h3 className="text-sm font-semibold text-slate-950">{title}</h3>
      <div className="mt-4 grid gap-3 text-sm">{children}</div>
    </div>
  );
}

function AmountRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-3 last:border-b-0 last:pb-0">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-sm font-semibold text-slate-950">{value}</span>
    </div>
  );
}

function ActionLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
    >
      {children}
    </Link>
  );
}

function formatPaymentType(value?: string) {
  return (value || "Not provided").replaceAll("_", " ");
}

function formatPercent(value?: number) {
  return value === undefined || value === null ? "Not provided" : `${value}%`;
}