"use client";

import { motion } from "framer-motion";
import CountUp from "react-countup";
import { cn } from "@/lib/utils";
import type { ExpenseStats, ShootStats } from "@/lib/db/queries";

export function ExpensesStats({ stats }: { stats: ExpenseStats }) {
	const metrics = [
		{
			title: "Food and Beverages",
			value: stats?.foodAndDrink || 0,
		},
		{
			title: "Travel and Accomodation",
			value: stats?.travelAndAccommodation || 0,
		},
		{
			title: "Euipment",
			value: stats?.equipment || 0,
		},
		{
			title: "Miscellaneous",
			value: stats?.miscellaneous || 0,
		},
	];

	return (
		<div className="relative isolate overflow-hidden ">
			<div className="border-b border-b-gray-900/10 ">
				<dl className="mx-auto grid  grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 lg:px-2 xl:px-0">
					{metrics.map((metric, index) => (
						<motion.div
							key={metric.title}
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: index * 0.1 }}
							className={cn(
								index % 2 === 1
									? "sm:border-l"
									: index === 2
										? "lg:border-l"
										: "",
								"flex flex-wrap items-baseline justify-between gap-x-4  border-t border-gray-900/5 px-4 py-8 sm:px-6 lg:border-t-0 xl:px-8",
							)}
						>
							<dt className="text-sm/6 font-medium text-gray-500">
								{metric.title}
							</dt>

							{/* change */}
							{/* <dd>3</dd> */}

							<dd className="w-full flex-none text-3xl/10 font-medium tracking-tight text-gray-900">
								{!stats ? (
									<span className="text-muted-foreground">...</span>
								) : (
									<CountUp end={metric.value} separator="," duration={2} />
								)}
							</dd>
						</motion.div>
					))}
				</dl>
			</div>
			<div
				aria-hidden="true"
				className="absolute left-0 top-full -z-10 mt-96 origin-top-left translate-y-40 -rotate-90 transform-gpu opacity-20 blur-3xl sm:left-1/2 sm:-ml-96 sm:-mt-10 sm:translate-y-0 sm:rotate-0 sm:transform-gpu sm:opacity-50"
			>
				<div
					style={{
						clipPath:
							"polygon(100% 38.5%, 82.6% 100%, 60.2% 37.7%, 52.4% 32.1%, 47.5% 41.8%, 45.2% 65.6%, 27.5% 23.4%, 0.1% 35.3%, 17.9% 0%, 27.7% 23.4%, 76.2% 2.5%, 74.2% 56%, 100% 38.5%)",
					}}
					className="aspect-[1154/678] w-[72.125rem] bg-gradient-to-br from-[#FF80B5] to-[#9089FC]"
				/>
			</div>
		</div>
	);
}
