"use client";
import { CheckIcon, ChevronDown, X, XIcon } from "lucide-react";
import * as React from "react";
import { useEffect, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
	CommandSeparator,
} from "@/components/ui/command";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface Option {
	label: string;
	value: string; // should be unique, and not empty
}

// ... (interface Props remains the same) ...
interface Props extends React.HTMLAttributes<HTMLDivElement> {
	/**
	 * An array of objects to be displayed in the Select.Option.
	 */
	options: Option[];

	/**
	 * Whether the select is async. If true, the getting options should be async.
	 * Optional, defaults to false.
	 */
	async?: boolean;

	/**
	 * Whether is fetching options. If true, the loading indicator will be shown.
	 * Optional, defaults to false. Works only when async is true.
	 */
	loading?: boolean;

	/**
	 * The error object. If true, the error message will be shown.
	 * Optional, defaults to null. Works only when async is true.
	 */
	error?: Error | null;

	/** The default selected values when the component mounts. */
	defaultValue?: string[];

	/**
	 * Placeholder text to be displayed when no values are selected.
	 * Optional, defaults to "Select options".
	 */
	placeholder?: string;

	/**
	 * Placeholder text to be displayed when the search input is empty.
	 * Optional, defaults to "Search...".
	 */
	searchPlaceholder?: string;

	/**
	 * Maximum number of items to display. Extra selected items will be summarized.
	 * Optional, defaults to 3.
	 */
	maxCount?: number;

	/**
	 * The modality of the popover. When set to true, interaction with outside elements
	 * will be disabled and only popover content will be visible to screen readers.
	 * Optional, defaults to false.
	 */
	modalPopover?: boolean;

	/**
	 * Additional class names to apply custom styles to the multi-select component.
	 * Optional, can be used to add custom styles.
	 */
	className?: string;

	/**
	 * Text to be displayed when the clear button is clicked.
	 * Optional, defaults to "Clear".
	 */
	clearText?: string;

	/**
	 * Text to be displayed when the close button is clicked.
	 * Optional, defaults to "Close".
	 */
	closeText?: string;

	/**
	 * Callback function triggered when the selected values change.
	 * Receives an array of the new selected values.
	 */
	onValueChange: (value: string[]) => void;

	/**
	 * Callback function triggered when the search input changes.
	 * Receives the search input value.
	 */
	onSearch?: (value: string) => void;
}

export const MultiAsyncSelect = React.forwardRef<HTMLDivElement, Props>(
	(
		{
			options,
			onValueChange,
			onSearch,
			defaultValue = [],
			placeholder = "Select options",
			searchPlaceholder = "Search...",
			clearText = "Clear",
			closeText = "Close",
			maxCount = 3,
			modalPopover = false,
			className,
			loading = false,
			async = false,
			error = null,
			...props
		},
		ref,
	) => {
		const [selectedValues, setSelectedValues] =
			React.useState<string[]>(defaultValue);
		const [isPopoverOpen, setIsPopoverOpen] = React.useState(false);
		const optionsRef = useRef<Record<string, Option>>({});

		const optionsMap = React.useMemo(() => {
			const map = new Map<string, string>();
			for (const option of options) {
				map.set(option.value, option.label);
			}
			return map;
		}, [options]);

		const customFilter = (value: string, search: string): number => {
			const label = optionsMap.get(value);
			if (label) {
				return label.toLowerCase().includes(search.toLowerCase()) ? 1 : 0;
			}
			return 0;
		};

		const handleInputKeyDown = (
			event: React.KeyboardEvent<HTMLInputElement>,
		) => {
			if (event.key === "Enter") {
				setIsPopoverOpen(true);
			} else if (event.key === "Backspace" && !event.currentTarget.value) {
				const newSelectedValues = [...selectedValues];
				newSelectedValues.pop();
				setSelectedValues(newSelectedValues);
				onValueChange(newSelectedValues);
			}
		};

		const toggleOption = (option: string) => {
			const isAddon = selectedValues.includes(option);
			const newSelectedValues = isAddon
				? selectedValues.filter((value) => value !== option)
				: [...selectedValues, option];
			setSelectedValues(newSelectedValues);
			onValueChange(newSelectedValues);
		};

		const handleClear = () => {
			setSelectedValues([]);
			onValueChange([]);
		};

		const handleTogglePopover = () => {
			setIsPopoverOpen((prev) => !prev);
		};

		const clearExtraOptions = () => {
			const newSelectedValues = selectedValues.slice(0, maxCount);
			setSelectedValues(newSelectedValues);
			onValueChange(newSelectedValues);
		};

		const toggleAll = () => {
			if (selectedValues.length === options.length) {
				handleClear();
			} else {
				const allValues = options.map((option) => option.value);
				setSelectedValues(allValues);
				onValueChange(allValues);
			}
		};

		useEffect(() => {
			const temp = options.reduce(
				(acc, option) => {
					acc[option.value] = option;
					return acc;
				},
				{} as Record<string, Option>,
			);
			if (async) {
				const temp2 = selectedValues.reduce(
					(acc, value) => {
						const option = optionsRef.current[value];
						if (option) {
							acc[option.value] = option;
						}
						return acc;
					},
					{} as Record<string, Option>,
				);
				optionsRef.current = {
					...temp,
					...temp2,
				};
			}
		}, [options]);

		const handleKeyPress = (
			event: React.KeyboardEvent<HTMLDivElement>,
			value: string,
		) => {
			if (event.key === "Enter" || event.key === " ") {
				event.preventDefault();
				toggleOption(value);
			}
		};

		return (
			<Popover
				open={isPopoverOpen}
				onOpenChange={setIsPopoverOpen}
				modal={modalPopover}
			>
				<PopoverTrigger asChild>
					<div
						ref={ref}
						{...props}
						onClick={handleTogglePopover}
						aria-expanded={isPopoverOpen}
						aria-haspopup="listbox"
						aria-controls="select-options"
						className={cn(
							"flex w-full px-3 py-1 rounded-md border min-h-10 h-auto items-center justify-between bg-inherit hover:bg-inherit [&_svg]:pointer-events-auto",
							className,
						)}
					>
						{selectedValues.length > 0 ? (
							<div className="flex justify-between items-center w-full">
								<div className="flex justify-between items-center w-full">
									<div className="flex flex-wrap items-center gap-2">
										{selectedValues.slice(0, maxCount).map((value) => {
											let option: Option | undefined;
											if (async) {
												option = optionsRef.current[value];
											} else {
												option = options.find(
													(option) => option.value === value,
												);
											}
											return (
												<Badge variant={"outline"} key={value}>
													<span>{option?.label}</span>

													<Button
														type="button"
														variant={"ghost"}
														aria-label={`Remove ${option?.label}`}
														className="ml-2 size-4 cursor-pointer rounded"
														onClick={(event) => {
															event.stopPropagation();
															toggleOption(value);
														}}
													>
														<XIcon />
													</Button>
												</Badge>
											);
										})}
										{selectedValues.length > maxCount && (
											<Badge variant={"outline"}>
												<span>{`+ ${selectedValues.length - maxCount}`}</span>

												<Button
													type="button"
													variant={"ghost"}
													aria-label="Clear extra selections"
													className="ml-2 size-4 cursor-pointer"
													onClick={(event) => {
														event.stopPropagation();
														clearExtraOptions();
													}}
													onKeyDown={(event) => {
														if (event.key === "Enter" || event.key === " ") {
															event.preventDefault();
															clearExtraOptions();
														}
													}}
												>
													<XIcon />
												</Button>
											</Badge>
										)}
									</div>
									<div className="flex items-center justify-between">
										<Button
											type="button"
											variant={"ghost"}
											aria-label="Clear all selections"
											className=" cursor-pointer text-zinc-500"
											onClick={(event) => {
												event.stopPropagation();
												handleClear();
											}}
											onKeyDown={(event) => {
												if (event.key === "Enter" || event.key === " ") {
													event.preventDefault();
													handleClear();
												}
											}}
										>
											<XIcon className="h-4 w-4" />
										</Button>
										<Separator
											orientation="vertical"
											className="flex min-h-6 h-full mx-2"
										/>
										<ChevronDown className="h-4 cursor-pointer text-zinc-300 dark:text-zinc-500" />
									</div>
								</div>
							</div>
						) : (
							<div className="flex items-center justify-between w-full mx-auto">
								<span className="text-sm font-normal text-zinc-500">
									{placeholder}
								</span>
								<ChevronDown className="h-4 cursor-pointer text-zinc-300 dark:text-zinc-500" />
							</div>
						)}
					</div>
				</PopoverTrigger>
				<PopoverContent
					className="w-auto p-0"
					align="start"
					onEscapeKeyDown={() => setIsPopoverOpen(false)}
				>
					<Command shouldFilter={!async} filter={customFilter}>
						<CommandInput
							placeholder={searchPlaceholder}
							onValueChange={(value) => {
								if (onSearch) {
									onSearch(value);
								}
							}}
							onKeyDown={handleInputKeyDown}
						/>
						<CommandList>
							{async && error && (
								<div className="p-4 text-destructive text-center">
									{error.message}
								</div>
							)}
							{async && loading && options.length === 0 && (
								<div className="flex justify-center py-6 items-center h-full">
									Loading...
								</div>
							)}
							{async ? (
								!loading &&
								!error &&
								options.length === 0 && (
									<div className="pt-6 pb-4 text-center text-sm">
										{`No ${placeholder.toLowerCase()} found.`}
									</div>
								)
							) : (
								<CommandEmpty>{`No results found.`}</CommandEmpty>
							)}
							<CommandGroup>
								{!async && (
									<CommandItem
										key="all"
										onSelect={toggleAll}
										className="cursor-pointer"
									>
										<div
											className={cn(
												"mr-1 size-4 text-center rounded-[4px] border border-primary shadow-xs transition-shadow outline-none",
												selectedValues.length === options.length
													? "bg-primary text-primary-foreground border-primary"
													: "opacity-50 [&_svg]:invisible",
											)}
										>
											<CheckIcon className="size-3.5 text-white dark:text-black" />
										</div>
										<span>Select all</span>
									</CommandItem>
								)}
								{options.map((option) => {
									const isSelected = selectedValues.includes(option.value);
									return (
										<CommandItem
											key={option.value}
											value={option.value} // value must be present for filter to work
											onSelect={() => toggleOption(option.value)}
											className="cursor-pointer"
										>
											<div
												className={cn(
													"mr-1 size-4 text-center rounded-[4px] border border-primary shadow-xs transition-shadow outline-none",
													isSelected
														? "bg-primary text-primary-foreground border-primary"
														: "opacity-50 [&_svg]:invisible",
												)}
											>
												<CheckIcon className="size-3.5 text-white dark:text-black" />
											</div>
											<span>{option.label}</span>
										</CommandItem>
									);
								})}
							</CommandGroup>
							<CommandSeparator />
							<CommandGroup>
								<div className="flex items-center justify-between">
									{selectedValues.length > 0 && (
										<>
											<CommandItem
												onSelect={handleClear}
												className="flex-1 justify-center cursor-pointer"
											>
												{clearText}
											</CommandItem>
											<Separator
												orientation="vertical"
												className="flex min-h-6 h-full"
											/>
										</>
									)}
									<CommandItem
										onSelect={() => setIsPopoverOpen(false)}
										className="flex-1 justify-center cursor-pointer max-w-full"
									>
										{closeText}
									</CommandItem>
								</div>
							</CommandGroup>
						</CommandList>
					</Command>
				</PopoverContent>
			</Popover>
		);
	},
);

MultiAsyncSelect.displayName = "MultiAsyncSelect";
