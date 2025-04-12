"use client";

import { useFormContext } from ".";
import { Button } from "../ui/button";

export const SubmitButton = ({ label }: { label: string }) => {
	const form = useFormContext();
	return (
		<form.Subscribe
			selector={(state) => [state.canSubmit, state.isSubmitting]}
			children={([canSubmit, isSubmitting]) => (
				<Button type="submit" disabled={isSubmitting || !canSubmit}>
					{isSubmitting ? "..." : `${label}`}
				</Button>
			)}
		/>
	);
};
