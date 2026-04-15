import Link from "next/link";
<<<<<<< HEAD
import {
  AdminShell,
  SetupError,
  StatCard,
  SurfaceCard,
  currency,
  formatDate,
} from "./_components/admin-ui";
import { getDashboardData } from "../lib/lr-data";
=======
import { getDashboardData } from "../lib/lr-data";
import {
    AdminShell,
    SetupError,
    StatCard,
    SurfaceCard,
    formatDate
} from "./_components/admin-ui";
>>>>>>> acc855e (new changes)

const paymentTone: Record<string, string> = {
  paid: "bg-emerald-50 text-emerald-700",
  to_pay: "bg-amber-50 text-amber-700",
  to_be_billed: "bg-sky-50 text-sky-700",
};

export default async function Home() {
  const { lrs, userBreakdown, transporterBreakdown, stats, error } =
    await getDashboardData();
  const recent = lrs.slice(0, 7);
  const recentUsers = userBreakdown.slice(0, 5);
<<<<<<< HEAD
  const recentTransporters = transporterBreakdown.slice(0, 5);
  const activitySeries = buildLast7DaysSeries(lrs);
=======
  const activitySeries = buildLast7DaysSeries(lrs);
  const dailyGrowthRate = calculateDailyGrowthRate(activitySeries.activeUsers);
  const weeklyNewUserGrowthRate = calculateWeeklyNewUserGrowthRate(lrs);
  const averageSessionTimeMs = calculateAverageSessionTime(lrs);
>>>>>>> acc855e (new changes)

  return (
    <AdminShell
      title="Overview"
      description="Track LR activity, user counts, transporter activity, and recent records from one dashboard."
      section="overview"
    >
<<<<<<< HEAD
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
=======
      <section className="grid gap-4 md:grid-cols-3 xl:grid-cols-4">
>>>>>>> acc855e (new changes)
        <StatCard label="Total Users" value={stats.uniqueMobileUsers.toString()} />
        <StatCard label="New This Month" value={recentUsers.length.toString()} />
        <StatCard label="Total LRs" value={stats.totalRecords.toString()} />
        <StatCard label="Transporters" value={transporterBreakdown.length.toString()} />
      </section>

      <SetupError error={error} />

<<<<<<< HEAD
      <section className="grid gap-4 xl:grid-cols-2">
        <SurfaceCard
          title="Active Users — Last 7 Days"
          subtitle="Based on unique mobile numbers that created at least one LR on each day."
=======
      <section className="grid gap-4 md:grid-cols-3">
        <StatCard
          label="Daily user growth"
          value={formatPercent(dailyGrowthRate)}
        />
        <StatCard
          label="Weekly new user growth"
          value={formatPercent(weeklyNewUserGrowthRate)}
        />
        <StatCard
          label="Avg session time"
          value={formatDuration(averageSessionTimeMs)}
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <SurfaceCard
          title="Active Users — Last 7 Days"
          subtitle="Based on users who created or shared an LR on each day."
>>>>>>> acc855e (new changes)
        >
          <div className="p-5">
            <MiniBarChart
              tone="blue"
              values={activitySeries.activeUsers}
              labels={activitySeries.labels}
            />
          </div>
        </SurfaceCard>

        <SurfaceCard
          title="LRs Created — Last 7 Days"
          subtitle="Based on Firestore LR records grouped by their creation date."
        >
          <div className="p-5">
            <MiniBarChart
              tone="green"
              values={activitySeries.lrCount}
              labels={activitySeries.labels}
            />
          </div>
        </SurfaceCard>
      </section>

<<<<<<< HEAD
      <section className="grid gap-4 xl:grid-cols-[1.2fr_1fr]">
        <SurfaceCard title="Recent user activity" subtitle="Users with the most recent LR creation">
          <div className="divide-y divide-slate-100">
            {recentUsers.map((user) => (
              <Link
                key={user.key}
                href={`/users/${encodeURIComponent(user.key)}`}
                className="flex items-center justify-between gap-4 px-5 py-4 transition hover:bg-slate-50"
              >
                <div>
                  <p className="font-medium text-slate-900">{user.phoneNumber}</p>
                  <p className="mt-1 text-sm text-slate-500">
                    Latest LR: {user.latestLrNumber || "No LR number"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-slate-950">{user.lrCount}</p>
                  <p className="text-sm text-slate-500">LRs</p>
                </div>
              </Link>
            ))}
          </div>
        </SurfaceCard>

        <SurfaceCard
          title="Transporter activity"
          subtitle="Recently active transporters"
          actions={
            <Link href="/transporters" className="text-sm font-medium text-slate-500 hover:text-slate-900">
              View all
            </Link>
          }
        >
          <div className="divide-y divide-slate-100">
            {recentTransporters.map((transporter) => (
              <Link
                key={transporter.key}
                href={`/transporters/${encodeURIComponent(transporter.key)}`}
                className="flex items-center justify-between gap-4 px-5 py-4 transition hover:bg-slate-50"
              >
                <div>
                  <p className="font-medium text-slate-900">
                    {transporter.transporterName}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {currency.format(transporter.totalFreight)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-slate-950">
                    {transporter.lrCount}
                  </p>
                  <p className="text-sm text-slate-500">LRs</p>
                </div>
              </Link>
            ))}
          </div>
        </SurfaceCard>
      </section>
=======
>>>>>>> acc855e (new changes)

      <SurfaceCard
        title="Recent LRs"
        subtitle="Latest records across the LR collection"
        actions={
          <Link href="/lrs" className="text-sm font-medium text-slate-500 hover:text-slate-900">
            View all
          </Link>
        }
      >
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-5 py-3 font-medium">LR</th>
                <th className="px-5 py-3 font-medium">Mobile</th>
                <th className="px-5 py-3 font-medium">Transporter</th>
<<<<<<< HEAD
=======
                <th className="px-5 py-3 font-medium">Score</th>
>>>>>>> acc855e (new changes)
                <th className="px-5 py-3 font-medium">Payment</th>
                <th className="px-5 py-3 font-medium">Created</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((lr) => (
                <tr key={lr.id} className="border-t border-slate-100">
                  <td className="px-5 py-4">
                    <Link
                      href={`/lrs/${encodeURIComponent(lr.id)}`}
                      className="font-medium text-slate-900 hover:text-slate-950"
                    >
                      {lr.lrNumber || lr.id}
                    </Link>
                    <p className="mt-1 text-xs text-slate-500">
                      {lr.fromLocation || "Unknown"} to {lr.toLocation || "Unknown"}
                    </p>
                  </td>
                  <td className="px-5 py-4 text-slate-600">
                    {lr.phoneNumber || lr.userId || "No user"}
                  </td>
                  <td className="px-5 py-4 text-slate-600">
                    {lr.transporterName || "No transporter"}
                  </td>
<<<<<<< HEAD
=======
                  <td className="px-5 py-4 text-slate-900 font-semibold">
                    {typeof lr.completionScore === "number"
                      ? `${lr.completionScore.toFixed(1)}/10`
                      : "0.0/10"}
                  </td>
>>>>>>> acc855e (new changes)
                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                        paymentTone[lr.paymentType || ""] || "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {(lr.paymentType || "unknown").replaceAll("_", " ")}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-slate-500">{formatDate(lr.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SurfaceCard>
    </AdminShell>
  );
}

function MiniBarChart({
  values,
  labels,
  tone,
}: {
  values: number[];
  labels: string[];
  tone: "blue" | "green";
}) {
  const max = Math.max(...values, 1);
  const styles =
    tone === "blue"
      ? {
          shell: "bg-sky-50 border-sky-100",
          bar: "bg-sky-500",
          barMuted: "bg-sky-300",
          value: "text-sky-700",
        }
      : {
          shell: "bg-emerald-50 border-emerald-100",
          bar: "bg-emerald-500",
          barMuted: "bg-emerald-300",
          value: "text-emerald-700",
        };

  return (
    <div>
      <div className={`rounded-lg border px-4 py-4 ${styles.shell}`}>
        <div className="grid grid-cols-7 items-end gap-3">
        {values.map((value, index) => {
          const height = Math.max((value / max) * 120, value > 0 ? 10 : 4);
          const isCurrent = index === values.length - 1;

          return (
            <div key={`${labels[index]}-${value}`} className="flex flex-col items-center gap-2">
              <span
                className={`text-xs font-semibold ${
                  isCurrent ? styles.value : "text-slate-500"
                }`}
              >
                {value}
              </span>
              <div className="flex h-32 w-full items-end">
                <div
                  className={`w-full rounded-t-md ${
                    isCurrent ? styles.bar : styles.barMuted
                  }`}
                  style={{ height: `${height}px` }}
                />
              </div>
              <span className="text-xs text-slate-400">{labels[index]}</span>
            </div>
          );
        })}
        </div>
      </div>
      <div className="mt-3 grid grid-cols-7 text-center text-[11px] text-slate-400">
        {labels.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>
    </div>
  );
}

function buildLast7DaysSeries(
<<<<<<< HEAD
  lrs: Array<{ createdAt?: Date | null; phoneNumber?: string | null; userId?: string | null }>
=======
  lrs: Array<{
    createdAt?: Date | null;
    updatedAt?: Date | null;
    phoneNumber?: string | null;
    userId?: string | null;
    shareCount?: number;
    sharePdfUrl?: string | null;
  }>
>>>>>>> acc855e (new changes)
) {
  const formatter = new Intl.DateTimeFormat("en-US", { weekday: "short" });
  const labels: string[] = [];
  const activeUsers: number[] = [];
  const lrCount: number[] = [];

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let offset = 6; offset >= 0; offset -= 1) {
    const dayStart = new Date(today);
    dayStart.setDate(today.getDate() - offset);

    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayStart.getDate() + 1);

<<<<<<< HEAD
    const dayRecords = lrs.filter((lr) => {
=======
    const createdRecords = lrs.filter((lr) => {
>>>>>>> acc855e (new changes)
      if (!lr.createdAt) return false;
      const created = new Date(lr.createdAt);
      return created >= dayStart && created < dayEnd;
    });

<<<<<<< HEAD
    const dayUsers = new Set(
      dayRecords
=======
    const sharedRecords = lrs.filter((lr) => {
      if (!lr.updatedAt) return false;
      const updated = new Date(lr.updatedAt);
      return (
        updated >= dayStart &&
        updated < dayEnd &&
        Boolean(lr.shareCount || lr.sharePdfUrl)
      );
    });

    const dayUsers = new Set(
      [...createdRecords, ...sharedRecords]
>>>>>>> acc855e (new changes)
        .map((lr) => lr.phoneNumber || lr.userId || "")
        .filter(Boolean)
    );

    labels.push(formatter.format(dayStart));
    activeUsers.push(dayUsers.size);
<<<<<<< HEAD
    lrCount.push(dayRecords.length);
=======
    lrCount.push(createdRecords.length);
>>>>>>> acc855e (new changes)
  }

  return { labels, activeUsers, lrCount };
}
<<<<<<< HEAD
=======

function calculateDailyGrowthRate(activeUsers: number[]) {
  if (activeUsers.length < 2) return 0;

  const latest = activeUsers[activeUsers.length - 1];
  const previous = activeUsers[activeUsers.length - 2];
  if (previous === 0) return latest === 0 ? 0 : 100;

  return ((latest - previous) / previous) * 100;
}

function calculateWeeklyNewUserGrowthRate(lrs: Array<{ createdAt?: Date | null; phoneNumber?: string | null; userId?: string | null }>) {
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - 6);

  const prevWeekStart = new Date(weekStart);
  prevWeekStart.setDate(weekStart.getDate() - 7);

  const prevWeekEnd = new Date(weekStart);

  const currentWeekUsers = new Set(
    lrs
      .filter((lr) => {
        if (!lr.createdAt) return false;
        const created = new Date(lr.createdAt);
        return created >= weekStart && created < now;
      })
      .map((lr) => lr.phoneNumber || lr.userId || "")
      .filter(Boolean)
  );

  const previousWeekUsers = new Set(
    lrs
      .filter((lr) => {
        if (!lr.createdAt) return false;
        const created = new Date(lr.createdAt);
        return created >= prevWeekStart && created < prevWeekEnd;
      })
      .map((lr) => lr.phoneNumber || lr.userId || "")
      .filter(Boolean)
  );

  const currentCount = currentWeekUsers.size;
  const previousCount = previousWeekUsers.size;
  if (previousCount === 0) return currentCount === 0 ? 0 : 100;

  return ((currentCount - previousCount) / previousCount) * 100;
}

function calculateAverageSessionTime(lrs: Array<{ createdAt?: Date | null; updatedAt?: Date | null }>) {
  const durations: number[] = lrs
    .map((lr) => {
      if (!lr.createdAt || !lr.updatedAt) return null;
      const start = new Date(lr.createdAt).getTime();
      const end = new Date(lr.updatedAt).getTime();
      return end > start ? end - start : null;
    })
    .filter((value): value is number => value != null);

  if (durations.length === 0) return 0;
  const total = durations.reduce((sum, duration) => sum + duration, 0);
  return total / durations.length;
}

function formatPercent(value: number) {
  const rounded = Math.round(value * 10) / 10;
  return `${rounded >= 0 ? "+" : ""}${rounded.toFixed(1)}%`;
}

function formatDuration(milliseconds: number) {
  if (milliseconds <= 0) return "0m";
  const seconds = Math.round(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours > 0) {
    return `${hours}h ${remainingMinutes}m`;
  }
  return `${minutes}m`;
}
>>>>>>> acc855e (new changes)
