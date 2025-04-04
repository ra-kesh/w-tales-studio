"use client";

import { useFormContext } from ".";
import { Button } from "../ui/button";

export const SubmitButton = ({ label }: { label: string }) => {
	const form = useFormContext();
	return (
		<form.Subscribe selector={(state) => state.isSubmitting}>
			{(isSubmitting) => (
				<Button type="submit" disabled={isSubmitting}>
					{label}
				</Button>
			)}
		</form.Subscribe>
	);
};
