"use client";

import React, { useState } from "react";
import { useShootsParams } from "@/hooks/use-shoots-params";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
} from "../../../../components/ui/sheet";
import { XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useShootDetail } from "@/hooks/use-shoots";
import { ShootForm } from "./shoot-form";

export function ShootEditSheet() {
	const { setParams, shootId } = useShootsParams();

	const { data: shoot, isLoading } = useShootDetail(shootId ?? "");

	const isOpen = Boolean(shootId);

	return (
		<Sheet open={isOpen} onOpenChange={() => setParams(null)}>
			<SheetContent side="right" className="min-w-xl">
				<SheetHeader className="mb-6 flex justify-between items-center flex-row">
					<SheetTitle className="text-xl">Edit Shoot</SheetTitle>
					<Button
						size="icon"
						variant="ghost"
						onClick={() => setParams(null)}
						className="p-0 m-0 size-auto hover:bg-transparent"
					>
						<XIcon className="size-4" />
					</Button>
				</SheetHeader>
				{isLoading ? (
					<div>Loading..</div>
				) : (
					<ShootForm defaultValues={shoot} onSubmit={() => {}} mode="edit" />
				)}
			</SheetContent>
		</Sheet>
	);
}
