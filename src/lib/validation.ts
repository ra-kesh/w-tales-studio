import {
	createSearchParamsCache,
	parseAsArrayOf,
	parseAsInteger,
	parseAsString,
	parseAsStringEnum,
} from "nuqs/server";
import { getSortingStateParser } from "./parsers";
import type { Booking } from "./db/schema";
import { z } from "zod/v4";

export const bookingSearchParamsCache = createSearchParamsCache({
	// filterFlag: parseAsStringEnum(
	// 	flagConfig.featureFlags.map((flag) => flag.value),
	// ),
	page: parseAsInteger.withDefault(1),
	perPage: parseAsInteger.withDefault(10),
	sort: getSortingStateParser<Booking>().withDefault([
		{ id: "updatedAt", desc: true },
		{ id: "createdAt", desc: true },
	]),
	name: parseAsString.withDefault(""),
	// status: parseAsArrayOf(z.enum(tasks.status.enumValues)).withDefault([]),
	// priority: parseAsArrayOf(z.enum(tasks.priority.enumValues)).withDefault([]),
	// estimatedHours: parseAsArrayOf(z.coerce.number()).withDefault([]),
	createdAt: parseAsArrayOf(z.coerce.number()).withDefault([]),
	// advanced filter
	// filters: getFiltersStateParser().withDefault([]),
	// joinOperator: parseAsStringEnum(["and", "or"]).withDefault("and"),
});
