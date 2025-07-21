import React, { type ReactNode } from "react";
import { Protected } from "@/app/restricted-to-roles";

const layout = ({ children }: { children: ReactNode }) => {
	return (
		<Protected permissions={{ booking: ["create"] }}>{children}</Protected>
	);
};

export default layout;
