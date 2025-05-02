"use client";

import { Button } from "@/components/ui/button";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import { Plus } from "lucide-react";
import { CrewForm } from "./crew-form";

export function OpenCrewSheet() {
	return (
		<Sheet>
			<SheetTrigger asChild>
				<Button>
					<Plus className="mr-2 h-4 w-4" />
					Add Crew
				</Button>
			</SheetTrigger>
			<SheetContent className="w-full sm:max-w-2xl">
				<SheetHeader>
					<SheetTitle>Add New Crew Member</SheetTitle>
					<SheetDescription>
						Add a new crew member to your team. Fill out the form below to
						create a new crew member profile.
					</SheetDescription>
				</SheetHeader>
				<CrewForm />
			</SheetContent>
		</Sheet>
	);
}
