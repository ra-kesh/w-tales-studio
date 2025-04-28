"use client";

import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useClientParams } from "@/hooks/use-client-params";
import { useUpdateClientMutation } from "@/hooks/use-client-mutation";
import { useClientDetail } from "@/hooks/use-clients";
import { ClientForm } from "./client-form";
import type { ClientFormValues } from "./client-form-schema";
import { toast } from "sonner";

export function ClientEditSheet() {
	const { setParams, clientId } = useClientParams();
	const isOpen = Boolean(clientId);

	const { data: client, isLoading } = useClientDetail(clientId as string);

	const updateClientMutation = useUpdateClientMutation();

	const handleSubmit = async (data: ClientFormValues) => {
		try {
			await updateClientMutation.mutateAsync({
				data,
				clientId: clientId as string,
			});
			setParams(null);
		} catch (error: unknown) {
			if (error instanceof Error) {
				toast.error(error.message);
			} else {
				toast.error("An unknown error occurred");
			}
		}
	};

	return (
		<Sheet open={isOpen} onOpenChange={() => setParams(null)}>
			<SheetContent side="right" className="min-w-xl">
				<SheetHeader className="mb-6 flex justify-between items-center flex-row">
					<SheetTitle className="text-xl">Edit Client</SheetTitle>
					<Button
						size="icon"
						variant="ghost"
						onClick={() => setParams(null)}
						className="p-0 m-0 size-auto hover:bg-transparent"
					>
						<X className="size-4" />
					</Button>
				</SheetHeader>

				{isLoading ? (
					<div>Loading...</div>
				) : (
					<ClientForm
						defaultValues={client}
						onSubmit={handleSubmit}
						mode="edit"
					/>
				)}
			</SheetContent>
		</Sheet>
	);
}
