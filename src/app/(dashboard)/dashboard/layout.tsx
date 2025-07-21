import type React from "react";
import { Protected } from "@/app/restricted-to-roles";

const layout = ({ children }: { children: React.ReactNode }) => {
	return (
		<Protected permissions={{ dashboard: ["read"] }}>{children}</Protected>
	);
};

export default layout;
