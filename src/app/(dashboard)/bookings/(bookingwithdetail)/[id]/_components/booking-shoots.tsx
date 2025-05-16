"use client";

import type { Shoot } from "@/lib/db/schema";
import { ShootTable } from "@/app/(dashboard)/shoots/_components/shoots-table";
import { useBookingShootColumns } from "./booking-shoot-columns";

interface BookingShootsProps {
	shoots: Shoot[];
}

export function BookingShoots({ shoots }: BookingShootsProps) {
	const columns = useBookingShootColumns();

	return <ShootTable data={shoots} columns={columns} />;
}
