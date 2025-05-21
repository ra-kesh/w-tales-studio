import type { Shoot, ShootsAssignment } from "@/lib/db/schema";

export type ShootRowData = Shoot & {
  booking: { name: string };
  shootsAssignments: ShootsAssignment[];
};

export interface ShootsResponse {
  data: ShootRowData[];
  total: number;
}
