import { useQueryClient } from "@tanstack/react-query";
import { Loader2, PlusIcon } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { organization } from "@/lib/auth/auth-client";
import { Button } from "./ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

function CreateOrganizationDialog() {
	const [name, setName] = useState("");
	const [slug, setSlug] = useState("");
	const [loading, setLoading] = useState(false);
	const [open, setOpen] = useState(false);
	const [isSlugEdited, setIsSlugEdited] = useState(false);
	const [logo, setLogo] = useState<string | null>(null);

	const queryClient = useQueryClient();

	const router = useRouter();

	useEffect(() => {
		if (!isSlugEdited) {
			const generatedSlug = name.trim().toLowerCase().replace(/\s+/g, "-");
			setSlug(generatedSlug);
		}
	}, [name, isSlugEdited]);

	useEffect(() => {
		if (open) {
			setName("");
			setSlug("");
			setIsSlugEdited(false);
			setLogo(null);
		}
	}, [open]);

	const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files?.[0]) {
			const file = e.target.files[0];
			const reader = new FileReader();
			reader.onloadend = () => {
				setLogo(reader.result as string);
			};
			reader.readAsDataURL(file);
		}
	};

	const handleCreate = async () => {
		if (!name || !slug) {
			toast.error("Studio Name and Slug are required.");
			return;
		}

		setLoading(true);
		let newOrgId: string | null = null;

		try {
			const { data: newOrg } = await organization.create({
				name: name,
				slug: slug,
				logo: logo || undefined,
			});

			if (!newOrg?.id) {
				throw new Error(
					"Failed to get organization ID from creation response.",
				);
			}
			newOrgId = newOrg.id;

			await organization.setActive({ organizationId: newOrgId });

			try {
				const crewResponse = await fetch("/api/crews/from-member", {
					method: "POST",
				});
				if (!crewResponse.ok) {
					throw new Error("Server responded with an error.");
				}
			} catch (crewError) {
				console.error(
					"Non-critical error: Failed to auto-add owner to crew.",
					crewError,
				);
				toast.warning(
					"Studio created! There was an issue adding you to the crew list automatically. You may need to do this manually.",
				);
			}

			toast.success("Studio created successfully!");
			setOpen(false);

			await Promise.all([
				router.refresh(),
				queryClient.invalidateQueries({ queryKey: ["organizations"] }),
				queryClient.invalidateQueries({ queryKey: ["onboarding"] }),
			]);
		} catch (error) {
			const errorMessage =
				error instanceof Error
					? error.message
					: "An unexpected error occurred.";
			toast.error(errorMessage);
			console.error("Creation process failed:", error);
		} finally {
			setLoading(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button size="sm" className="w-full gap-2" variant="default">
					<PlusIcon />
					<p>New Studio</p>
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[425px] w-11/12">
				<DialogHeader>
					<DialogTitle>New Studio</DialogTitle>
					<DialogDescription>
						Add your studio details to get started.
					</DialogDescription>
				</DialogHeader>
				<div className="flex flex-col gap-4">
					<div className="flex flex-col gap-2">
						<Label>Studio Name</Label>
						<Input
							placeholder="Name"
							value={name}
							onChange={(e) => setName(e.target.value)}
						/>
					</div>
					<div className="flex flex-col gap-2">
						<Label>Studio Slug</Label>
						<Input
							value={slug}
							onChange={(e) => {
								setSlug(e.target.value);
								setIsSlugEdited(true);
							}}
							placeholder="Slug"
						/>
					</div>
					<div className="flex flex-col gap-2">
						<Label>Logo</Label>
						<Input type="file" accept="image/*" onChange={handleLogoChange} />
						{logo && (
							<div className="mt-2">
								<Image
									src={logo}
									alt="Logo preview"
									className="w-16 h-16 object-cover"
									width={16}
									height={16}
								/>
							</div>
						)}
					</div>
				</div>
				<DialogFooter>
					<Button
						disabled={loading}
						onClick={handleCreate}
						// onClick={async () => {
						// 	setLoading(true);
						// 	await organization.create(
						// 		{
						// 			name: name,
						// 			slug: slug,
						// 			logo: logo || undefined,
						// 		},
						// 		{
						// 			onResponse: () => {
						// 				setLoading(false);
						// 			},
						// 			onSuccess: () => {
						// 				queryClient.invalidateQueries({
						// 					queryKey: ["onboarding"],
						// 				});
						// 				toast.success("Organization created successfully");
						// 				setOpen(false);
						// 				queryClient.refetchQueries({
						// 					queryKey: ["onboarding"],
						// 				});
						// 				// // fetch("/api/crews/from-member", { method: "POST" }).catch(
						// 				// // 	(err) => {
						// 				// // 		console.error(
						// 				// // 			"Silent error: Failed to auto-create crew member.",
						// 				// // 			err,
						// 				// // 		);
						// 				// // 		toast.warning(
						// 				// // 			"Welcome! There was an issue adding you to the crew list automatically. you may need to add them manually.",
						// 				// // 		);
						// 				// // 	},
						// 				// // );
						// 				// window.location.reload();
						// 			},
						// 			onError: (error) => {
						// 				toast.error(error.error.message);
						// 				setLoading(false);
						// 			},
						// 		},
						// 	);
						// }}
					>
						{loading ? (
							<Loader2 className="animate-spin" size={16} />
						) : (
							"Create"
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

export default CreateOrganizationDialog;
