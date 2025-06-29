import { useQueryClient } from "@tanstack/react-query";
import { Loader2, PlusIcon } from "lucide-react";
import Image from "next/image";
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
						onClick={async () => {
							setLoading(true);
							await organization.create(
								{
									name: name,
									slug: slug,
									logo: logo || undefined,
								},
								{
									onResponse: () => {
										setLoading(false);
									},
									onSuccess: () => {
										queryClient.invalidateQueries({
											queryKey: ["onboarding"],
										});
										toast.success("Organization created successfully");
										setOpen(false);
										queryClient.refetchQueries({
											queryKey: ["onboarding"],
										});
										window.location.reload();
									},
									onError: (error) => {
										toast.error(error.error.message);
										setLoading(false);
									},
								},
							);
						}}
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
