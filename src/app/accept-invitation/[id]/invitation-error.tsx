import {
	Card,
	CardHeader,
	CardTitle,
	CardDescription,
	CardContent,
	CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import Link from "next/link";

export function InvitationError() {
	return (
		<Card className="w-full max-w-md mx-auto">
			<CardHeader>
				<div className="flex items-center space-x-2">
					<AlertCircle className="w-6 h-6 text-destructive" />
					<CardTitle className="text-xl text-destructive">
						Invitation Error
					</CardTitle>
				</div>
				<CardDescription>
					There was an issue with your invitation.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<p className="mb-4 text-sm text-muted-foreground">
					Make sure to authenticate yourself before accessing the invitation. If
					you are authenticated and still seeing error then the invitation is
					either invalid or you don't have the correct permissions. Please check
					your email for a valid invitation or contact the person who sent it.
				</p>
			</CardContent>
			<CardFooter className="flex justify-between items-center">
				<div>
					<Link href="/home" className="w-full">
						<Button variant="outline" className="w-full">
							Go back to home
						</Button>
					</Link>
				</div>
				<div>
					<Link href="/sign-in" target="blank" className="w-full">
						<Button className="w-full">Sign-In</Button>
					</Link>
				</div>
			</CardFooter>
		</Card>
	);
}
