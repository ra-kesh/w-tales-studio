"use client";

import * as TabsPrimitive from "@radix-ui/react-tabs";
import * as React from "react";

import { cn } from "@/lib/utils";

function Tabs({
	className,
	...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
	return (
		<TabsPrimitive.Root
			data-slot="tabs"
			className={cn("flex flex-col gap-2", className)}
			{...props}
		/>
	);
}

function TabsList({
	className,
	...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
	return (
		<TabsPrimitive.List
			data-slot="tabs-list"
			className={cn(
				"bg-muted text-muted-foreground inline-flex h-9 w-fit items-center justify-center rounded-lg p-[3px]",
				className,
			)}
			{...props}
		/>
	);
}

function TabsTrigger({
	className,
	...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
	return (
		<TabsPrimitive.Trigger
			data-slot="tabs-trigger"
			className={cn(
				"data-[state=active]:bg-background dark:data-[state=active]:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring dark:data-[state=active]:border-input dark:data-[state=active]:bg-input/30 text-foreground dark:text-muted-foreground inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:shadow-sm [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
				className,
			)}
			{...props}
		/>
	);
}

function TabsContent({
	className,
	...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
	return (
		<TabsPrimitive.Content
			data-slot="tabs-content"
			className={cn("flex-1 outline-none", className)}
			{...props}
		/>
	);
}

const SimpleTabsList = React.forwardRef<
	HTMLDivElement,
	React.ComponentPropsWithRef<"div">
>(({ className, ...props }, ref) => (
	<div
		ref={ref}
		className={cn(
			"inline-flex shrink-0 items-center justify-center border-b text-muted-foreground",
			className,
		)}
		{...props}
	/>
));

SimpleTabsList.displayName = "SimpleTabsList";

const CustomTabsList = React.forwardRef<
	React.ElementRef<typeof TabsPrimitive.List>,
	React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
	<TabsPrimitive.List
		ref={ref}
		className={cn(
			"flex -mb-px items-center justify-start space-x-8 border-b border-gray-200",
			className,
		)}
		{...props}
	/>
));
CustomTabsList.displayName = TabsPrimitive.List.displayName;

const CustomTabsTrigger = React.forwardRef<
	React.ElementRef<typeof TabsPrimitive.Trigger>,
	React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
	<TabsPrimitive.Trigger
		ref={ref}
		className={cn(
			"group flex items-center whitespace-nowrap border-b-2 border-transparent px-1 py-4 text-sm font-medium cursor-pointer",
			"text-gray-500 hover:border-gray-300 hover:text-gray-700",
			"data-[state=active]:border-indigo-500 data-[state=active]:text-indigo-600",
			"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2",
			"disabled:pointer-events-none disabled:opacity-50",
			className,
		)}
		{...props}
	/>
));
CustomTabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const CustomTabsContent = React.forwardRef<
	React.ElementRef<typeof TabsPrimitive.Content>,
	React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
	<TabsPrimitive.Content
		ref={ref}
		className={cn(
			"mt-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
			className,
		)}
		{...props}
	/>
));
CustomTabsContent.displayName = TabsPrimitive.Content.displayName;

const SimpleTabsTrigger = React.forwardRef<
	HTMLDivElement,
	React.ComponentPropsWithoutRef<"div">
>(({ className, ...props }, ref) => (
	<div
		ref={ref}
		className={cn(
			"inline-flex cursor-pointer items-center justify-start whitespace-nowrap text-sm font-medium ring-offset-background transition-all hover:bg-background hover:text-foreground ",
			className,
		)}
		{...props}
	/>
));

SimpleTabsTrigger.displayName = "SimpleTabsTrigger";

export {
	Tabs,
	TabsList,
	TabsTrigger,
	TabsContent,
	SimpleTabsList,
	SimpleTabsTrigger,
	CustomTabsList,
	CustomTabsTrigger,
	CustomTabsContent,
};
