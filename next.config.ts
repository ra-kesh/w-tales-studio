import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	eslint: {
		ignoreDuringBuilds: true,
	},
	typescript: {
		ignoreBuildErrors: true,
	},
	devIndicators: false,
	async redirects() {
		return [
			{
				source: "/configurations",
				destination: "/configurations/packages",
				permanent: true,
			},
			{
				source: "/settings",
				destination: "/settings/organization",
				permanent: true,
			},
		];
	},
	images: {
		domains: [
			"studio.com",
			"res.cloudinary.com", // If you plan to use Cloudinary
			"uploadthing.com", // If you plan to use UploadThing
		],
	},
	experimental: {
		viewTransition: true,
	},
};

export default nextConfig;
