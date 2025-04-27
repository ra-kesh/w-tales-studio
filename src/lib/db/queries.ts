import { and, count, desc, eq, or } from "drizzle-orm";
import { client, db } from "./drizzle";
import {
  members,
  users,
  deliverables,
  bookings,
  clients,
  expenses,
  shoots,
  tasks,
  configurations,
  type ConfigType,
  type BookingDetail,
} from "./schema";

export async function getActiveOrganization(userId: string) {
  const result = await db
    .select({
      organizationId: members.organizationId,
    })
    .from(users)
    .leftJoin(members, eq(users.id, members.userId))
    .where(eq(users.id, userId))
    .limit(1);

  return result[0];
}

export async function getDeliverables(
  userOrganizationId: string,
  page = 1,
  limit = 10
) {
  const offset = (page - 1) * limit;

  const deliverableData = await db.query.deliverables.findMany({
    where: and(eq(deliverables.organizationId, userOrganizationId)),
    with: {
      booking: {
        columns: {
          name: true,
        },
      },
    },
    orderBy: (deliverables, { desc }) => [
      desc(deliverables.updatedAt),
      desc(deliverables.createdAt),
    ],
    // limit,
    // offset,
  });

  const total = await db.$count(
    deliverables,
    eq(deliverables.organizationId, userOrganizationId)
  );

  return {
    data: deliverableData,
    total,
    // page,
    // limit,
  };
}
export async function getBookings(
  userOrganizationId: string,
  page = 1,
  limit = 10,
  fields = ""
) {
  const offset = (page - 1) * limit;

  const bookingsData = await db.query.bookings.findMany({
    where: eq(bookings.organizationId, userOrganizationId),
    with: {
      clients: true,
      shoots: true,
    },
    orderBy: (bookings, { desc }) => [
      desc(bookings.updatedAt),
      desc(bookings.createdAt),
    ],
    // limit,
    // offset,
  });

  const total = await db.$count(
    bookings,
    eq(bookings.organizationId, userOrganizationId)
  );

  return {
    data: bookingsData,
    total,
    // page,
    // limit,
  };
}
export async function getMinimalBookings(
  userOrganizationId: string,
  fields = ""
) {
  const fieldsArray = fields
    ? fields.split(",").map((f) => f.trim())
    : ["id", "name"];

  const bookingColumns = {
    id: fieldsArray.includes("id"),
    name: fieldsArray.includes("name"),
    packageType: fieldsArray.includes("packageType"),
    packageCost: fieldsArray.includes("packageCost"),
    updatedAt: fieldsArray.includes("updatedAt"),
    createdAt: fieldsArray.includes("createdAt"),
  };

  const bookingsData = await db.query.bookings.findMany({
    where: eq(bookings.organizationId, userOrganizationId),
    columns: bookingColumns,
    orderBy: (bookings, { desc }) => [
      desc(bookings.updatedAt),
      desc(bookings.createdAt),
    ],
  });

  const total = await db.$count(
    bookings,
    eq(bookings.organizationId, userOrganizationId)
  );

  return {
    data: bookingsData,
    total,
  };
}

export async function getClients(
  userOrganizationId: string,
  page = 1,
  limit = 10
) {
  const offset = (page - 1) * limit;

  const clientsData = await db.query.clients.findMany({
    where: eq(clients.organizationId, userOrganizationId),
    limit,
    offset,
  });

  const total = await db.$count(
    clients,
    eq(clients.organizationId, userOrganizationId)
  );

  return {
    data: clientsData,
    total,
    page,
    limit,
  };
}

export async function getExpenses(
  userOrganizationId: string,
  page = 1,
  limit = 10
) {
  const offset = (page - 1) * limit;

  const expenseData = await db.query.expenses.findMany({
    where: eq(expenses.organizationId, userOrganizationId),
    with: {
      booking: {
        columns: {
          name: true,
        },
      },
    },
    limit,
    offset,
  });

  const total = await db.$count(
    expenses,
    eq(expenses.organizationId, userOrganizationId)
  );

  return {
    data: expenseData,
    total,
    page,
    limit,
  };
}
export async function getShoots(
  userOrganizationId: string,
  page = 1,
  limit = 10
) {
  const offset = (page - 1) * limit;

  const shootsData = await db.query.shoots.findMany({
    where: eq(shoots.organizationId, userOrganizationId),
    with: {
      booking: {
        columns: {
          name: true,
        },
      },
    },
    orderBy: (shoots, { desc }) => [
      desc(shoots.updatedAt),
      desc(shoots.createdAt),
    ],
    // limit,
    // offset,
  });

  const total = await db.$count(
    shoots,
    eq(shoots.organizationId, userOrganizationId)
  );

  return {
    data: shootsData,
    total,
    // page,
    // limit,
  };
}
export async function getTasks(
  userOrganizationId: string,
  page = 1,
  limit = 10
) {
  const offset = (page - 1) * limit;

  const tasksData = await db.query.tasks.findMany({
    where: eq(tasks.organizationId, userOrganizationId),
    with: {
      booking: {
        columns: {
          name: true,
        },
      },
    },
    orderBy: (tasks, { desc }) => [
      desc(tasks.updatedAt),
      desc(tasks.createdAt),
    ],

    // limit,
    // offset,
  });

  const total = await db.$count(
    tasks,
    eq(tasks.organizationId, userOrganizationId)
  );

  return {
    data: tasksData,
    total,
    // page,
    // limit,
  };
}

export async function getConfigs(
  userOrganizationId: string,
  type: (typeof ConfigType.enumValues)[number]
) {
  const config = await db.query.configurations.findMany({
    where: and(
      eq(configurations.type, type),
      or(
        eq(configurations.organizationId, userOrganizationId),
        eq(configurations.isSystem, true)
      )
    ),
    orderBy: configurations.isSystem,
  });

  return config;
}

export async function getBookingDetail(
  userOrganizationId: string,
  bookingId: number
): Promise<BookingDetail | undefined> {
  const response = await db.query.bookings.findFirst({
    where: and(
      eq(bookings.id, bookingId),
      eq(bookings.organizationId, userOrganizationId)
    ),
    with: {
      clients: true,
      shoots: true,
      deliverables: true,
      receivedAmounts: true,
      paymentSchedules: true,
      expenses: true,
      crews: true,
      tasks: true,
    },
  });

  return response;
}
