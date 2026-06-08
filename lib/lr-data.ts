import { getAdminCredentialSource, getAdminDb } from "./firebase-admin";

export interface LRItem {
  id?: string;
  packages?: number;
  description?: string;
  weight?: string;
  amount?: number;
}

export interface LorryReceipt {
  id: string;
  lrNumber?: string;
  phoneNumber?: string;
  userId?: string;
  transporterName?: string;
  transporterAddress?: string;
  companyGstin?: string;
  fromLocation?: string;
  toLocation?: string;
  lrDate?: string;
  consignorName?: string;
  consigneeName?: string;
  truckNumber?: string;
  driverName?: string;
  ewayBill?: string;
  totalPackages?: number;
  totalWeight?: string;
  totalFreight?: number;
  gstPercent?: number;
  extraCharges?: number;
  paidAmount?: number;
  paymentType?: "to_pay" | "paid" | "to_be_billed" | string;
  invoiceNumber?: string;
  invoiceValue?: number;
  remark?: string;
  description?: string;
  items?: LRItem[];
  createdAt?: Date | null;
  updatedAt?: Date | null;
  shareCount?: number;
  sharePdfUrl?: string | null;
  completionScore: number;
}

export interface DashboardData {
  lrs: LorryReceipt[];
  userBreakdown: UserBreakdown[];
  transporterBreakdown: TransporterBreakdown[];
  stats: {
    totalRecords: number;
    totalUsers: number;
    newUsersThisMonth: number;
    totalFreight: number;
    totalPaid: number;
    totalPending: number;
    uniqueUsers: number;
    uniqueMobileUsers: number;
    totalPackages: number;
    paidLrs: number;
    toPayLrs: number;
    billedLrs: number;
    usersWithMissingPhone: number;
    averageFreightPerLr: number;
    completedLrs: number;
    completionScore: number;
  };
  error?: string;
}

export interface LrListPageData {
  lrs: LorryReceipt[];
  stats: Pick<
    DashboardData["stats"],
    "totalRecords" | "paidLrs" | "toPayLrs" | "billedLrs"
  >;
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    startIndex: number;
    endIndex: number;
  };
  error?: string;
}

export interface TripRecord {
  id: string;
  origin?: string;
  destination?: string;
  src?: string | null;
  dest?: string | null;
  tel?: string;
  truck_number?: string;
  vh_type?: string;
  user?: string;
  user_email?: string;
  lrNumber?: string;
  response?: Record<string, any>;
  userId?: string;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

export interface TripListPageData {
  trips: TripRecord[];
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    startIndex: number;
    endIndex: number;
  };
  error?: string;
}

export interface BiltyUser {
  id: string;
  uid?: string;
  name?: string;
  email?: string;
  phoneNumber?: string;
  user?: string;
  user_email?: string;
  createdAt?: Date | null;
  updatedAt?: Date | null;
  [key: string]: unknown;
}

export interface BiltyUserListPageData {
  users: BiltyUser[];
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    startIndex: number;
    endIndex: number;
  };
  error?: string;
}

const LR_COLLECTION = "io.traqo.biltylr";
const TRIP_COLLECTION = "io.traqo.trips";
const BILTY_USER_COLLECTION = "biltyUser";

export interface UserBreakdown {
  key: string;
  phoneNumber: string;
  userIds: string[];
  lrCount: number;
  totalFreight: number;
  totalPaid: number;
  totalPending: number;
  totalPackages: number;
  firstCreatedAt: Date | null;
  latestCreatedAt: Date | null;
  latestUpdatedAt: Date | null;
  latestLrNumber?: string;
  transporters: string[];
  routes: string[];
}

export interface TransporterBreakdown {
  key: string;
  transporterName: string;
  phoneNumbers: string[];
  userIds: string[];
  lrCount: number;
  totalFreight: number;
  totalPaid: number;
  totalPending: number;
  totalPackages: number;
  latestCreatedAt: Date | null;
  latestUpdatedAt: Date | null;
  latestLrNumber?: string;
  routes: string[];
}

function normalizePhoneNumber(value?: string) {
  if (!value) return "";

  const normalized = value.replace(/\s+/g, "").trim();
  if (!normalized) return "";

  const digitsOnly = normalized.replace(/\D/g, "");
  if (!digitsOnly) return normalized;

  if (normalized.startsWith("+")) {
    return `+${digitsOnly}`;
  }

  return digitsOnly;
}

export function getUserKeyForRecord(lr: Pick<LorryReceipt, "id" | "phoneNumber" | "userId">) {
  const normalizedPhone = normalizePhoneNumber(lr.phoneNumber);
  return normalizedPhone || lr.userId || `unknown:${lr.id}`;
}

export function getTransporterKeyForRecord(
  lr: Pick<LorryReceipt, "transporterName">
) {
  return (lr.transporterName || "").trim() || "No transporter";
}

function calculatePending(lr: LorryReceipt) {
  const freight = lr.totalFreight ?? 0;
  const gst = freight * ((lr.gstPercent ?? 0) / 100);
  const extras = lr.extraCharges ?? 0;
  const paid = lr.paidAmount ?? 0;
  return Math.max(0, freight + gst + extras - paid);
}

function calculateLrCompletionScore(lr: LorryReceipt) {
  const checks = [
    Boolean(lr.fromLocation?.trim() && lr.toLocation?.trim()),
    Boolean(lr.truckNumber?.trim() && lr.driverName?.trim()),
    Boolean(lr.consignorName?.trim() && lr.consigneeName?.trim()),
    Boolean(lr.totalPackages != null && lr.totalPackages > 0),
    Boolean(lr.totalWeight?.trim()),
    lr.totalFreight != null,
    Boolean((lr.invoiceNumber && lr.invoiceNumber.trim()) || lr.invoiceValue != null),
    Boolean(lr.paymentType),
    Boolean(lr.items?.length),
  ];

  const completed = checks.filter(Boolean).length;
  return Math.round((completed / checks.length) * 10 * 10) / 10;
}

function isCompleteLr(lr: LorryReceipt) {
  return calculateLrCompletionScore(lr) === 10;
}

const toDate = (value: unknown): Date | null => {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value === "object" && value !== null && "toDate" in value) {
    const maybeTimestamp = value as { toDate?: () => Date };
    return maybeTimestamp.toDate?.() ?? null;
  }
  return null;
};

function mapLrDoc(
  doc: FirebaseFirestore.QueryDocumentSnapshot | FirebaseFirestore.DocumentSnapshot
) {
  const data = doc.data();
  if (!data) return null;

  const lr = {
    id: doc.id,
    ...data,
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
  } as LorryReceipt;

  return {
    ...lr,
    completionScore: calculateLrCompletionScore(lr),
  };
}

function mapTripDoc(
  doc: FirebaseFirestore.QueryDocumentSnapshot | FirebaseFirestore.DocumentSnapshot
) {
  const data = doc.data();
  if (!data) return null;

  return {
    id: doc.id,
    ...data,
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
  } as TripRecord;
}

function mapBiltyUserDoc(
  doc: FirebaseFirestore.QueryDocumentSnapshot | FirebaseFirestore.DocumentSnapshot
) {
  const data = doc.data();
  if (!data) return null;

  return {
    id: doc.id,
    ...data,
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
  } as BiltyUser;
}

function buildCredentialError(error: unknown) {
  const source = getAdminCredentialSource();
  const rawMessage =
    error instanceof Error ? error.message : "Unable to load dashboard data.";

  return rawMessage.includes("UNAUTHENTICATED")
    ? `${rawMessage} Credential source: ${source.mode} (${source.value}). The service account key is being read, but Google is rejecting it. This usually means the key is invalid, disabled, or revoked, or the dev server is still using stale process state.`
    : `${rawMessage} Credential source: ${source.mode} (${source.value}).`;
}

export async function getDashboardData(): Promise<DashboardData> {
  try {
    const db = getAdminDb();
    const [snapshot, userSnapshot] = await Promise.all([
      db.collection(LR_COLLECTION).get(),
      db.collection(BILTY_USER_COLLECTION).get(),
    ]);

    const lrs = snapshot.docs
      .map((doc) => mapLrDoc(doc))
      .filter((lr): lr is LorryReceipt => lr !== null);

    const biltyUsers = userSnapshot.docs
      .map((doc) => mapBiltyUserDoc(doc))
      .filter((user): user is BiltyUser => user !== null);

    lrs.sort((a, b) => {
      const aTime = a.createdAt?.getTime() ?? 0;
      const bTime = b.createdAt?.getTime() ?? 0;
      return bTime - aTime;
    });

    const totalFreight = lrs.reduce((sum, lr) => sum + (lr.totalFreight ?? 0), 0);
    const totalPaid = lrs.reduce((sum, lr) => sum + (lr.paidAmount ?? 0), 0);
    const totalPending = lrs.reduce((sum, lr) => sum + calculatePending(lr), 0);
    const uniqueUsers = new Set(lrs.map((lr) => lr.userId).filter(Boolean)).size;
    const totalPackages = lrs.reduce((sum, lr) => sum + (lr.totalPackages ?? 0), 0);
    const paidLrs = lrs.filter((lr) => lr.paymentType === "paid").length;
    const toPayLrs = lrs.filter((lr) => lr.paymentType === "to_pay").length;
    const billedLrs = lrs.filter((lr) => lr.paymentType === "to_be_billed").length;

    const userMap = new Map<string, UserBreakdown>();

    for (const lr of lrs) {
      const normalizedPhone = normalizePhoneNumber(lr.phoneNumber);
      const userKey = getUserKeyForRecord(lr);
      const existing = userMap.get(userKey);
      const pendingAmount = calculatePending(lr);

      if (!existing) {
        userMap.set(userKey, {
          key: userKey,
          phoneNumber: normalizedPhone || "No phone number",
          userIds: lr.userId ? [lr.userId] : [],
          lrCount: 1,
          totalFreight: lr.totalFreight ?? 0,
          totalPaid: lr.paidAmount ?? 0,
          totalPending: pendingAmount,
          totalPackages: lr.totalPackages ?? 0,
          firstCreatedAt: lr.createdAt ?? null,
          latestCreatedAt: lr.createdAt ?? null,
          latestUpdatedAt: lr.updatedAt ?? null,
          latestLrNumber: lr.lrNumber,
          transporters: lr.transporterName ? [lr.transporterName] : [],
          routes:
            lr.fromLocation || lr.toLocation
              ? [`${lr.fromLocation || "Unknown"} -> ${lr.toLocation || "Unknown"}`]
              : [],
        });
        continue;
      }

      existing.lrCount += 1;
      existing.totalFreight += lr.totalFreight ?? 0;
      existing.totalPaid += lr.paidAmount ?? 0;
      existing.totalPending += pendingAmount;
      existing.totalPackages += lr.totalPackages ?? 0;

      if (lr.userId && !existing.userIds.includes(lr.userId)) {
        existing.userIds.push(lr.userId);
      }
      if (lr.transporterName && !existing.transporters.includes(lr.transporterName)) {
        existing.transporters.push(lr.transporterName);
      }

      const route =
        lr.fromLocation || lr.toLocation
          ? `${lr.fromLocation || "Unknown"} -> ${lr.toLocation || "Unknown"}`
          : "";
      if (route && !existing.routes.includes(route)) {
        existing.routes.push(route);
      }

      const existingCreatedTime = existing.latestCreatedAt?.getTime() ?? 0;
      const lrCreatedTime = lr.createdAt?.getTime() ?? 0;
      if (lrCreatedTime >= existingCreatedTime) {
        existing.latestCreatedAt = lr.createdAt ?? existing.latestCreatedAt;
        existing.latestLrNumber = lr.lrNumber ?? existing.latestLrNumber;
      }

      const existingUpdatedTime = existing.latestUpdatedAt?.getTime() ?? 0;
      const lrUpdatedTime = lr.updatedAt?.getTime() ?? 0;
      if (lrUpdatedTime >= existingUpdatedTime) {
        existing.latestUpdatedAt = lr.updatedAt ?? existing.latestUpdatedAt;
      }
    }

    const userBreakdown = Array.from(userMap.values()).sort((a, b) => {
      if (b.lrCount !== a.lrCount) {
        return b.lrCount - a.lrCount;
      }

      const aTime = a.latestCreatedAt?.getTime() ?? 0;
      const bTime = b.latestCreatedAt?.getTime() ?? 0;
      return bTime - aTime;
    });

    const uniqueMobileUsers = userBreakdown.filter(
      (user) => user.phoneNumber !== "No phone number"
    ).length;
    const usersWithMissingPhone = userBreakdown.length - uniqueMobileUsers;
    const currentMonthStart = new Date();
    currentMonthStart.setDate(1);
    currentMonthStart.setHours(0, 0, 0, 0);
    const nextMonthStart = new Date(currentMonthStart);
    nextMonthStart.setMonth(currentMonthStart.getMonth() + 1);

    const lrUserKeys = new Set(userBreakdown.map((user) => user.key));
    for (const user of biltyUsers) {
      const normalizedPhone = normalizePhoneNumber(user.phoneNumber);
      const userKey = normalizedPhone || user.uid || user.id;

      if (userKey && !lrUserKeys.has(userKey)) {
        lrUserKeys.add(userKey);
      }
    }

    const totalUsers = lrUserKeys.size;
    const newUsersThisMonth = biltyUsers.filter(
      (user) =>
        user.createdAt &&
        user.createdAt >= currentMonthStart &&
        user.createdAt < nextMonthStart
    ).length;
    const averageFreightPerLr = lrs.length > 0 ? totalFreight / lrs.length : 0;
    const completedLrs = lrs.filter(isCompleteLr).length;
    const completionScore = lrs.length > 0
      ? Math.round(
          (lrs.reduce((sum, lr) => sum + (lr.completionScore ?? 0), 0) / lrs.length) *
            10
        ) / 10
      : 0;

    const transporterMap = new Map<string, TransporterBreakdown>();

    for (const lr of lrs) {
      const transporterName = getTransporterKeyForRecord(lr);
      const existing = transporterMap.get(transporterName);
      const pendingAmount = calculatePending(lr);
      const normalizedPhone = normalizePhoneNumber(lr.phoneNumber);
      const route =
        lr.fromLocation || lr.toLocation
          ? `${lr.fromLocation || "Unknown"} -> ${lr.toLocation || "Unknown"}`
          : "";

      if (!existing) {
        transporterMap.set(transporterName, {
          key: transporterName,
          transporterName,
          phoneNumbers: normalizedPhone ? [normalizedPhone] : [],
          userIds: lr.userId ? [lr.userId] : [],
          lrCount: 1,
          totalFreight: lr.totalFreight ?? 0,
          totalPaid: lr.paidAmount ?? 0,
          totalPending: pendingAmount,
          totalPackages: lr.totalPackages ?? 0,
          latestCreatedAt: lr.createdAt ?? null,
          latestUpdatedAt: lr.updatedAt ?? null,
          latestLrNumber: lr.lrNumber,
          routes: route ? [route] : [],
        });
        continue;
      }

      existing.lrCount += 1;
      existing.totalFreight += lr.totalFreight ?? 0;
      existing.totalPaid += lr.paidAmount ?? 0;
      existing.totalPending += pendingAmount;
      existing.totalPackages += lr.totalPackages ?? 0;

      if (normalizedPhone && !existing.phoneNumbers.includes(normalizedPhone)) {
        existing.phoneNumbers.push(normalizedPhone);
      }
      if (lr.userId && !existing.userIds.includes(lr.userId)) {
        existing.userIds.push(lr.userId);
      }
      if (route && !existing.routes.includes(route)) {
        existing.routes.push(route);
      }

      const existingCreatedTime = existing.latestCreatedAt?.getTime() ?? 0;
      const lrCreatedTime = lr.createdAt?.getTime() ?? 0;
      if (lrCreatedTime >= existingCreatedTime) {
        existing.latestCreatedAt = lr.createdAt ?? existing.latestCreatedAt;
        existing.latestLrNumber = lr.lrNumber ?? existing.latestLrNumber;
      }

      const existingUpdatedTime = existing.latestUpdatedAt?.getTime() ?? 0;
      const lrUpdatedTime = lr.updatedAt?.getTime() ?? 0;
      if (lrUpdatedTime >= existingUpdatedTime) {
        existing.latestUpdatedAt = lr.updatedAt ?? existing.latestUpdatedAt;
      }
    }

    const transporterBreakdown = Array.from(transporterMap.values()).sort((a, b) => {
      if (b.lrCount !== a.lrCount) {
        return b.lrCount - a.lrCount;
      }

      const aTime = a.latestCreatedAt?.getTime() ?? 0;
      const bTime = b.latestCreatedAt?.getTime() ?? 0;
      return bTime - aTime;
    });

    return {
      lrs,
      userBreakdown,
      transporterBreakdown,
      stats: {
        totalRecords: lrs.length,
        totalUsers,
        newUsersThisMonth,
        totalFreight,
        totalPaid,
        totalPending,
        uniqueUsers,
        uniqueMobileUsers,
        totalPackages,
        paidLrs,
        toPayLrs,
        billedLrs,
        usersWithMissingPhone,
        averageFreightPerLr,
        completedLrs,
        completionScore,
      },
    };
  } catch (error) {
    const message = buildCredentialError(error);

    return {
      lrs: [],
      userBreakdown: [],
      transporterBreakdown: [],
      stats: {
        totalRecords: 0,
        totalUsers: 0,
        newUsersThisMonth: 0,
        totalFreight: 0,
        totalPaid: 0,
        totalPending: 0,
        uniqueUsers: 0,
        uniqueMobileUsers: 0,
        totalPackages: 0,
        paidLrs: 0,
        toPayLrs: 0,
        billedLrs: 0,
        usersWithMissingPhone: 0,
        averageFreightPerLr: 0,
        completedLrs: 0,
        completionScore: 0,
      },
      error: message,
    };
  }
}

export async function getLrListPageData(
  page: number,
  pageSize: number
): Promise<LrListPageData> {
  try {
    const db = getAdminDb();
    const collection = db.collection(LR_COLLECTION);
    const safePage = Math.max(page, 1);
    const safePageSize = Math.max(pageSize, 1);

    const [totalSnapshot, paidSnapshot, toPaySnapshot, billedSnapshot] =
      await Promise.all([
        collection.count().get(),
        collection.where("paymentType", "==", "paid").count().get(),
        collection.where("paymentType", "==", "to_pay").count().get(),
        collection.where("paymentType", "==", "to_be_billed").count().get(),
      ]);

    const totalItems = totalSnapshot.data().count;
    const totalPages = Math.max(1, Math.ceil(totalItems / safePageSize));
    const normalizedPage = Math.min(safePage, totalPages);
    const offset = (normalizedPage - 1) * safePageSize;

    const pageSnapshot = await collection
      .orderBy("createdAt", "desc")
      .offset(offset)
      .limit(safePageSize)
      .get();

    const lrs = pageSnapshot.docs
      .map((doc) => mapLrDoc(doc))
      .filter((lr): lr is LorryReceipt => lr !== null);

    return {
      lrs,
      stats: {
        totalRecords: totalItems,
        paidLrs: paidSnapshot.data().count,
        toPayLrs: toPaySnapshot.data().count,
        billedLrs: billedSnapshot.data().count,
      },
      pagination: {
        page: normalizedPage,
        pageSize: safePageSize,
        totalItems,
        totalPages,
        startIndex: totalItems === 0 ? 0 : offset + 1,
        endIndex: Math.min(offset + lrs.length, totalItems),
      },
    };
  } catch (error) {
    return {
      lrs: [],
      stats: {
        totalRecords: 0,
        paidLrs: 0,
        toPayLrs: 0,
        billedLrs: 0,
      },
      pagination: {
        page: 1,
        pageSize,
        totalItems: 0,
        totalPages: 1,
        startIndex: 0,
        endIndex: 0,
      },
      error: buildCredentialError(error),
    };
  }
}

export async function getTripListPageData(
  page: number,
  pageSize: number
): Promise<TripListPageData> {
  try {
    const db = getAdminDb();
    const collection = db.collection(TRIP_COLLECTION);
    const safePage = Math.max(page, 1);
    const safePageSize = Math.max(pageSize, 1);

    const totalSnapshot = await collection.count().get();
    const totalItems = totalSnapshot.data().count;
    const totalPages = Math.max(1, Math.ceil(totalItems / safePageSize));
    const normalizedPage = Math.min(safePage, totalPages);
    const offset = (normalizedPage - 1) * safePageSize;

    const pageSnapshot = await collection
      .orderBy("createdAt", "desc")
      .offset(offset)
      .limit(safePageSize)
      .get();

    const trips = pageSnapshot.docs
      .map((doc) => mapTripDoc(doc))
      .filter((trip): trip is TripRecord => trip !== null);

    return {
      trips,
      pagination: {
        page: normalizedPage,
        pageSize: safePageSize,
        totalItems,
        totalPages,
        startIndex: totalItems === 0 ? 0 : offset + 1,
        endIndex: Math.min(offset + trips.length, totalItems),
      },
    };
  } catch (error) {
    return {
      trips: [],
      pagination: {
        page: 1,
        pageSize,
        totalItems: 0,
        totalPages: 1,
        startIndex: 0,
        endIndex: 0,
      },
      error: buildCredentialError(error),
    };
  }
}

export async function getBiltyUserListPageData(
  page: number,
  pageSize: number
): Promise<BiltyUserListPageData> {
  try {
    const db = getAdminDb();
    const collection = db.collection(BILTY_USER_COLLECTION);
    const safePage = Math.max(page, 1);
    const safePageSize = Math.max(pageSize, 1);

    const totalSnapshot = await collection.count().get();
    const totalItems = totalSnapshot.data().count;
    const totalPages = Math.max(1, Math.ceil(totalItems / safePageSize));
    const normalizedPage = Math.min(safePage, totalPages);
    const offset = (normalizedPage - 1) * safePageSize;

    const pageSnapshot = await collection
      .orderBy("createdAt", "desc")
      .offset(offset)
      .limit(safePageSize)
      .get();

    const users = pageSnapshot.docs
      .map((doc) => mapBiltyUserDoc(doc))
      .filter((user): user is BiltyUser => user !== null);

    return {
      users,
      pagination: {
        page: normalizedPage,
        pageSize: safePageSize,
        totalItems,
        totalPages,
        startIndex: totalItems === 0 ? 0 : offset + 1,
        endIndex: Math.min(offset + users.length, totalItems),
      },
    };
  } catch (error) {
    return {
      users: [],
      pagination: {
        page: 1,
        pageSize,
        totalItems: 0,
        totalPages: 1,
        startIndex: 0,
        endIndex: 0,
      },
      error: buildCredentialError(error),
    };
  }
}

export async function getBiltyUserByUid(uid: string) {
  try {
    const db = getAdminDb();
    const snapshot = await db.collection(BILTY_USER_COLLECTION).doc(uid).get();
    const user = mapBiltyUserDoc(snapshot);
    return { user, error: undefined };
  } catch (error) {
    return { user: null, error: buildCredentialError(error) };
  }
}

export async function getUserDashboard(userKey: string) {
  const data = await getDashboardData();
  const user = data.userBreakdown.find((entry) => entry.key === userKey) ?? null;
  const lrs = data.lrs.filter((lr) => {
    const key = getUserKeyForRecord(lr);
    return key === userKey;
  });

  return {
    ...data,
    user,
    lrs,
  };
}

export async function getTransporterDashboard(transporterKey: string) {
  const data = await getDashboardData();
  const transporter =
    data.transporterBreakdown.find((entry) => entry.key === transporterKey) ?? null;
  const lrs = data.lrs.filter(
    (lr) => getTransporterKeyForRecord(lr) === transporterKey
  );

  return {
    ...data,
    transporter,
    lrs,
  };
}

export async function getLrDetail(id: string) {
  try {
    const db = getAdminDb();
    const snapshot = await db.collection(LR_COLLECTION).doc(id).get();
    const lr = mapLrDoc(snapshot);

    return {
      lr,
      error: undefined,
    };
  } catch (error) {
    return {
      lr: null,
      error: buildCredentialError(error),
    };
  }
}
