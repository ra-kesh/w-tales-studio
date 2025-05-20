export type User = {
  name: string;
  email: string;
  image: string | null;
};

export type Member = {
  id: string;
  organizationId: string;
  userId: string;
  role: string;
  createdAt: string;
  user: User;
};

export type Crew = {
  id: number;
  name: string | null;
  role: string;
  specialization: string | null;
  status: string;
  member: Member | null;
};

export type ShootsAssignment = {
  id: number;
  shootId: number;
  crewId: number;
  isLead: boolean;
  organizationId: string;
  assignedAt: string;
  createdAt: string;
  updatedAt: string;
  crew: Crew;
};

export type Shoot = {
  id: number;
  bookingId: number;
  organizationId: string;
  title: string;
  date: string;
  time: string;
  reportingTime: string | null;
  duration: string | null;
  location: string;
  notes: string | null;
  additionalServices: string | null;
  createdAt: string;
  updatedAt: string;
  shootsAssignments: ShootsAssignment[];
};

export type DeliverablesAssignment = {
  id: number;
  deliverableId: number;
  crewId: number;
  isLead: boolean;
  organizationId: string;
  assignedAt: string;
  createdAt: string;
  updatedAt: string;
  crew: Crew;
};

export type Deliverable = {
  id: number;
  bookingId: number;
  organizationId: string;
  title: string;
  isPackageIncluded: boolean;
  cost: string;
  quantity: number;
  dueDate: string;
  notes: string;
  status: string;
  fileUrl: string | null;
  clientFeedback: string | null;
  priority: string;
  revisionCount: number;
  deliveredAt: string | null;
  createdAt: string;
  updatedAt: string;
  deliverablesAssignments: DeliverablesAssignment[];
};

export type ExpensesAssignment = {
  id: number;
  expenseId: number;
  crewId: number;
  organizationId: string;
  assignedAt: string;
  createdAt: string;
  updatedAt: string;
  crew: Crew;
};

export type Expense = {
  id: number;
  bookingId: number;
  organizationId: string;
  billTo: string;
  category: string;
  amount: string;
  date: string;
  description: string;
  fileUrls: string[];
  createdAt: string;
  updatedAt: string;
  expensesAssignments: ExpensesAssignment[];
};

export type ReceivedAmount = {
  id: number;
  bookingId: number;
  amount: string;
  description: string;
  paidOn: string;
  createdAt: string;
  updatedAt: string;
};

export type PaymentSchedule = {
  id: number;
  bookingId: number;
  amount: string;
  description: string;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
};

export type TasksAssignment = {
  id: number;
  taskId: number;
  crewId: number;
  organizationId: string;
  assignedAt: string;
  createdAt: string;
  updatedAt: string;
  crew: Crew;
};

export type Task = {
  id: number;
  bookingId: number;
  organizationId: string;
  deliverableId: number | null;
  status: string;
  description: string;
  priority: string;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
  tasksAssignments: TasksAssignment[];
};

export type Client = {
  id: number;
  organizationId: string;
  name: string;
  brideName: string;
  groomName: string;
  relation: string;
  phoneNumber: string;
  email: string;
  address: string;
  createdAt: string;
  updatedAt: string;
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
  shoots: Shoot[];
  deliverables: Deliverable[];
  expenses: Expense[];
  receivedAmounts: ReceivedAmount[];
  paymentSchedules: PaymentSchedule[];
  tasks: Task[];
  bookingTypeValue: string;
  packageTypeValue: string;
};
