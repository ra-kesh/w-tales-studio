"use client";

import React from "react";
import { Input } from "./ui/input";
import { useShootsParams } from "@/hooks/use-shoots-params";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "./ui/sheet";
import { Button } from "./ui/button";
import { X } from "lucide-react";

export function ShootCreateSheet() {
	const { setParams, createShoot } = useShootsParams();

	const isOpen = Boolean(createShoot);

	return (
		<Sheet open={isOpen} onOpenChange={() => setParams(null)}>
			<SheetContent side="right">
				<SheetHeader className="mb-6 flex justify-between items-center flex-row">
					<SheetTitle className="text-xl">Create Shoot</SheetTitle>
					<Button
						size="icon"
						variant="ghost"
						onClick={() => setParams(null)}
						className="p-0 m-0 size-auto hover:bg-transparent"
					>
						<X className="size-4" />
					</Button>
				</SheetHeader>

				<form action="">
					<Input />
				</form>

				{/* <CustomerForm /> */}
			</SheetContent>
		</Sheet>
	);
}
