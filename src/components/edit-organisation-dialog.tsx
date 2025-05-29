import { authClient } from "@/lib/auth/auth-client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Edit, Loader2, X } from "lucide-react";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import Image from "next/image";
import { convertImageToBase64 } from "@/lib/utils";
import { toast } from "sonner";
import type { ActiveOrganization } from "@/types/auth";

function EditOrganisationDialog({
	organization,
}: { organization: ActiveOrganization | null }) {
	const [name, setName] = useState("");
	const [slug, setSlug] = useState("");
	const [loading, setLoading] = useState(false);
	const [open, setOpen] = useState(false);
	const [isSlugEdited, setIsSlugEdited] = useState(false);
	const [logo, setLogo] = useState<File | null>(null);
	const [logoPreview, setLogoPreview] = useState<string | null>(null);

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
		const file = e.target.files?.[0];
		if (file) {
			setLogo(file);
			const reader = new FileReader();
			reader.onloadend = () => {
				setLogoPreview(reader.result as string);
			};
			reader.readAsDataURL(file);
		}
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button size="sm" className="w-full gap-2" variant="outline">
					<Edit size={13} />
					Edit Studio
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[425px] w-11/12">
				<DialogHeader>
					<DialogTitle>Edit Studio</DialogTitle>
					<DialogDescription>Edit your studio details</DialogDescription>
				</DialogHeader>
				<div className="flex flex-col gap-4">
					<div className="flex flex-col gap-2">
						<Label>Studio Name</Label>
						<Input
							placeholder={organization?.name}
							value={name}
							onChange={(e) => setName(e.target.value)}
						/>
					</div>
					<div className="flex flex-col gap-2">
						<Label>Studio Slug</Label>
						<Input
							value={slug}
							placeholder={organization?.slug}
							onChange={(e) => {
								setSlug(e.target.value);
								setIsSlugEdited(true);
							}}
						/>
					</div>
					<div className="flex flex-col gap-2">
						<Label>Logo</Label>
						<Input type="file" accept="image/*" onChange={handleLogoChange} />
						{logoPreview && (
							<div className="mt-2">
								<Image
									src={logoPreview}
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
						onClick={async () => {
							setLoading(true);
							await authClient.organization.update({
								data: {
									name: name ? name : undefined,
									logo: logo ? await convertImageToBase64(logo) : undefined,
									metadata: {},
									slug: slug ? slug : undefined,
								},
								fetchOptions: {
									onSuccess: () => {
										toast.success("Studio details updated successfully");
									},
									onError: (error) => {
										toast.error(error.error.message);
									},
								},
							});

							setName("");
							router.refresh();
							setLogo(null);
							setLogoPreview(null);
							setLoading(false);
							setOpen(false);
							// 	{
							// 		name: name,
							// 		slug: slug,
							// 		logo: logo || undefined,
							// 	},
							// 	{
							// 		onResponse: () => {
							// 			setLoading(false);
							// 		},
							// 		onSuccess: () => {
							// 			queryClient.invalidateQueries({
							// 				queryKey: ["onboarding"],
							// 			});
							// 			toast.success("Organization created successfully");
							// 			setOpen(false);
							// 			queryClient.refetchQueries({
							// 				queryKey: ["onboarding"],
							// 			});
							// 		},
							// 		onError: (error) => {
							// 			toast.error(error.error.message);
							// 			setLoading(false);
							// 		},
							// 	},
							// );
						}}
					>
						{loading ? (
							<Loader2 className="animate-spin" size={16} />
						) : (
							"Update"
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

export default EditOrganisationDialog;
