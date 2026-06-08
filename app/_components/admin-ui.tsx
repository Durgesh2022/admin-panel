import { requireAdminSession } from "@/lib/admin-auth";
import Link from "next/link";
import { LogoutButton } from "./logout-button";

export const currency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat("en-IN", {
  dateStyle: "medium",
  timeStyle: "short",
});

const NAV_ITEMS = [
  { key: "overview", href: "/", label: "Overview" },
  { key: "users", href: "/users", label: "Users" },
  { key: "lrs", href: "/lrs", label: "LRs" },
  { key: "trips", href: "/trips", label: "Trips" },
  { key: "transporters", href: "/transporters", label: "Transporters" },
] as const;

export type AdminSection = (typeof NAV_ITEMS)[number]["key"];

export function formatDate(value?: Date | null) {
  return value ? dateFormatter.format(value) : "No timestamp";
}

export function getPageNumber(input?: string) {
  const parsed = Number(input);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : 1;
}

export function paginateItems<T>(items: T[], page: number, pageSize: number) {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const start = (safePage - 1) * pageSize;

  return {
    items: items.slice(start, start + pageSize),
    page: safePage,
    totalPages,
    totalItems: items.length,
    startIndex: items.length === 0 ? 0 : start + 1,
    endIndex: Math.min(start + pageSize, items.length),
  };
}

export async function AdminShell({
  title,
  description,
  section,
  children,
}: {
  title: string;
  description: string;
  section: AdminSection;
  children: React.ReactNode;
}) {
  const { profile } = await requireAdminSession();

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto grid min-h-screen w-full  lg:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="hidden border-r border-slate-800 bg-slate-950 text-slate-200 lg:block">
          <div className="sticky top-0 flex h-screen flex-col">
            <div className="border-b border-slate-800 px-5 py-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Traqo
                  </p>
                  <h1 className="mt-1 text-lg font-semibold text-white">Admin Panel</h1>
                </div>
                <span className="text-slate-500">×</span>
              </div>
            </div>

            <nav className="flex flex-col gap-1 px-3 py-4">
              {NAV_ITEMS.map((item) => {
                const active = item.key === section;
                return (
                  <Link
                    key={item.key}
                    href={item.href}
                    className={`rounded-md px-3 py-2.5 text-sm font-medium transition ${
                      active
                        ? "bg-sky-600/15 text-sky-300"
                        : "text-slate-400 hover:bg-slate-900 hover:text-slate-100"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="mt-auto border-t border-slate-800 px-5 py-4 text-xs text-slate-500">
              <p className="font-medium text-slate-300">{profile.name}</p>
              <p className="mt-1 truncate">{profile.email}</p>
            </div>
          </div>
        </aside>

        <div className="min-w-0">
          <div className="border-b border-slate-200 bg-white px-4 py-3 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-slate-950">{title}</h2>
                <p className="mt-1 text-sm text-slate-500">{description}</p>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  href="/"
                  className="text-sm font-medium text-slate-500 transition hover:text-slate-900"
                >
                  Back to Dashboard
                </Link>
                <LogoutButton />
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2 lg:hidden">
              {NAV_ITEMS.map((item) => {
                const active = item.key === section;
                return (
                  <Link
                    key={item.key}
                    href={item.href}
                    className={`rounded-md px-3 py-2 text-sm font-medium ${
                      active
                        ? "bg-slate-900 text-white"
                        : "border border-slate-200 bg-white text-slate-700"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="p-4 sm:p-6 lg:p-8">
            <div className="flex flex-col gap-6">{children}</div>
          </div>
        </div>
      </div>
    </main>
  );
}

export function StatCard({
  label,
  value,
}: {
  label: string;
  value: string;
  accent?: "sky" | "amber" | "emerald";
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-4xl font-semibold tracking-tight text-slate-950">{value}</p>
    </div>
  );
}

export function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-3">
      <span className="text-slate-500">{label}</span>
      <span className="max-w-[60%] text-right font-medium text-slate-900">
        {value}
      </span>
    </div>
  );
}

export function SurfaceCard({
  title,
  subtitle,
  actions,
  children,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-5 py-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-semibold text-slate-950">{title}</h2>
            {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
          </div>
          {actions}
        </div>
      </div>
      {children}
    </section>
  );
}

export function SetupError({ error }: { error?: string }) {
  if (!error) return null;

  return (
    <section className="rounded-xl border border-amber-200 bg-amber-50 px-5 py-5 text-sm text-amber-950 shadow-sm">
      <h2 className="text-sm font-semibold">Dashboard setup needed</h2>
      <p className="mt-2 leading-6">{error}</p>
      <p className="mt-3 leading-6">
        Add Firebase Admin credentials in `admin-panel/.env.local`, then restart
        the Next server.
      </p>
    </section>
  );
}

export function Pagination({
  basePath,
  page,
  totalPages,
  totalItems,
  startIndex,
  endIndex,
}: {
  basePath: string;
  page: number;
  totalPages: number;
  totalItems: number;
  startIndex: number;
  endIndex: number;
}) {
  if (totalItems === 0) {
    return (
      <div className="border-t border-slate-200 px-5 py-4 text-sm text-slate-500">
        No records to paginate.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-slate-500">
        Showing {startIndex} to {endIndex} of {totalItems}
      </p>
      <div className="flex items-center gap-2">
        <PaginationLink
          href={buildPageHref(basePath, Math.max(1, page - 1))}
          disabled={page <= 1}
        >
          Previous
        </PaginationLink>
        <span className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700">
          Page {page} of {totalPages}
        </span>
        <PaginationLink
          href={buildPageHref(basePath, Math.min(totalPages, page + 1))}
          disabled={page >= totalPages}
        >
          Next
        </PaginationLink>
      </div>
    </div>
  );
}

function PaginationLink({
  href,
  disabled,
  children,
}: {
  href: string;
  disabled: boolean;
  children: React.ReactNode;
}) {
  if (disabled) {
    return (
      <span className="rounded-md border border-slate-200 px-4 py-2 text-sm font-medium text-slate-300">
        {children}
      </span>
    );
  }

  return (
    <Link
      href={href}
      className="rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
    >
      {children}
    </Link>
  );
}

function buildPageHref(basePath: string, page: number) {
  if (page <= 1) {
    return basePath;
  }

  return `${basePath}?page=${page}`;
}
