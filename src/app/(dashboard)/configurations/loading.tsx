import React from "react";
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";

const laoding = () => {
	return (
		<DataTableSkeleton
			columnCount={4}
			filterCount={0}
			cellWidths={["20rem", "10rem", "10rem", "10rem"]}
			shrinkZero
		/>
	);
};

export default laoding;
