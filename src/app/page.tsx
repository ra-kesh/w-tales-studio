import Link from "next/link";
import React from "react";

const wtp = () => {
	return (
		<>
			<div>Wedding tales studio solutions</div>
			<Link
				prefetch={true}
				href="/home"
				className="cursor-pointer font-semibold"
			>
				Home
			</Link>
		</>
	);
};

export default wtp;
