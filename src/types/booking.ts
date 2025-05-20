import {
  Client,
  Deliverable,
  DeliverablesAssignment,
  Expense,
  ExpensesAssignment,
  Member,
  PaymentSchedule,
  ReceivedAmount,
  Shoot,
  ShootsAssignment,
  Task,
  TasksAssignment,
  User,
} from "@/lib/db/schema";

export type Crew = {
  id: number;
  name: string | null;
  role: string;
  specialization: string | null;
  status: string;
  member: Member & {
    user: Pick<User, "name" | "email" | "image"> | null;
  };
};

export type deliverablesWithAssignments = Deliverable & {
  deliverablesAssignments: DeliverablesAssignment &
    {
      crew: Crew;
    }[];
};
export type shootsWithAssignments = Shoot & {
  shootsAssignments: ShootsAssignment &
    {
      crew: Crew;
    }[];
};
export type tasksWithAssignments = Task & {
  tasksAssignments: TasksAssignment &
    {
      crew: Crew;
    }[];
};
export type expenseWithAssignments = Expense & {
  expensesAssignments: ExpensesAssignment &
    {
      crew: Crew;
    }[];
};

export type BookingDetail = {
  id: number;
  organizationId: string;
  name: string;
  bookingType: string;
  packageType: string;
  packageCost: string;
  clientId: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  note: string | null;
  clients: Client;
  shoots: shootsWithAssignments[];
  deliverables: deliverablesWithAssignments[];
  expenses: expenseWithAssignments[];
  receivedAmounts: ReceivedAmount[];
  paymentSchedules: PaymentSchedule[];
  tasks: tasksWithAssignments[];
  bookingTypeValue: string;
  packageTypeValue: string;
};
