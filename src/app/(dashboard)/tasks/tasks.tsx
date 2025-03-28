"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { columns } from "./components/columns";
import { DataTable } from "./components/data-table";
import { getTasks } from "./page";
import React from "react";

export default function Tasks() {
	const { data, isLoading, isError } = useQuery({
		queryKey: ["tasks"],
		queryFn: getTasks,
		placeholderData: keepPreviousData,
	});

	const defaultData = React.useMemo(() => [], []);

	//   if (isLoading) {
	//     return <div>Loading...</div>;
	//   }

	//   if (isError) {
	//     return <div>Error loading tasks</div>;
	//   }

	return (
		<div className="hidden h-full flex-1 flex-col space-y-8 p-8 md:flex">
			<div className="flex items-center justify-between space-y-2">
				<div>
					<h2 className="text-2xl font-bold tracking-tight">Welcome back!</h2>
					<p className="text-muted-foreground">
						Here&apos;s a list of your tasks for this month!
					</p>
				</div>
			</div>
			<DataTable data={data?.data || defaultData} columns={columns} />
		</div>
	);
}
