import { format } from "date-fns";
import { CalendarIcon, MapPinIcon } from "lucide-react";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { isUrl } from "@/lib/utils";

export function ShootCard({ assignment }) {
	const { shoot } = assignment;

	// Parse date safely
	const shootDate = shoot?.date ? new Date(shoot.date) : null;
	const isValidDate = shootDate && !isNaN(shootDate.getTime());

	// Check if location is a URL
	const locationIsUrl = shoot.location && isUrl(shoot.location);

	return (
		<li className="flex items-center justify-between gap-x-6 py-6 ">
			<div className="min-w-full">
				<div className="flex items-center gap-x-3">
					<p className="text-md font-semibold text-gray-900">{shoot.title}</p>
				</div>
				{shoot.booking?.name && (
					<p className="text-xs font-semibold mt-1  text-gray-500">
						{shoot.booking.name}
					</p>
				)}

				<div className="mt-2 flex items-center gap-x-2 text-xs/5 text-gray-500">
					{/* Date and Time */}
					{isValidDate && (
						<div className="flex items-center gap-x-1">
							<CalendarIcon className="h-4 w-4 text-gray-400" />
							<time dateTime={shoot.date}>
								{format(shootDate, "MMM dd, yyyy")}
								{shoot.time && (
									<>
										<span className="mx-1">at</span>
										<span className="inline-flex items-center gap-x-1">
											{/* <ClockIcon className="h-3 w-3 text-gray-400" /> */}
											{shoot.time}
										</span>
									</>
								)}
							</time>
						</div>
					)}

					{/* Only show time if date is not available but time is */}
					{/* {!isValidDate && shoot.time && (
						<div className="flex items-center gap-x-1">
							<ClockIcon className="h-4 w-4 text-gray-400" />
							<span>{shoot.time}</span>
						</div>
					)} */}

					{/* Location */}
					{shoot.location && (
						<>
							{(isValidDate || shoot.time) && (
								<svg viewBox="0 0 2 2" className="size-0.5 fill-current">
									<circle r={1} cx={1} cy={1} />
								</svg>
							)}
							<div className="flex items-center gap-x-1">
								<MapPinIcon className="h-4 w-4 text-gray-400" />
								{locationIsUrl ? (
									<Tooltip>
										<TooltipTrigger asChild>
											<a
												href={shoot.location}
												target="_blank"
												rel="noopener noreferrer"
												className="text-blue-600 hover:text-blue-800 underline cursor-pointer max-w-[200px]"
											>
												<span className="truncate">{shoot.location}</span>
											</a>
										</TooltipTrigger>
										<TooltipContent className="max-w-xs text-balance">
											<p className="font-semibold">{shoot.location}</p>
										</TooltipContent>
									</Tooltip>
								) : (
									<Tooltip>
										<TooltipTrigger asChild>
											<div className="text-xs text-gray-500 flex items-center cursor-help max-w-[200px]">
												<span className="truncate">{shoot.location}</span>
											</div>
										</TooltipTrigger>
										<TooltipContent className="max-w-xs text-balance">
											<p className="font-semibold">{shoot.location}</p>
										</TooltipContent>
									</Tooltip>
								)}
							</div>
						</>
					)}
				</div>

				<div className="mt-2 rounded-md bg-gray-50 px-2 py-4">
					{shoot.notes ? (
						<p className="text-xs text-gray-600">{shoot.notes}</p>
					) : (
						<p className="text-xs text-gray-400 italic">No notes added</p>
					)}
				</div>
			</div>
		</li>
	);
}
