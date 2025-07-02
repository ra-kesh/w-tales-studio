import { Skeleton } from "@/components/ui/skeleton";

const Loading = () => {
	return (
		<>
			<main>
				{/* <header className="relative isolate">
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 overflow-hidden"
          >
            <div className="absolute top-full left-16 -mt-16 transform-gpu opacity-50 blur-3xl xl:left-1/2 xl:-ml-80">
              <div className="aspect-1154/678 w-[72.125rem] bg-linear-to-br from-[#FF80B5] to-[#9089FC]" />
            </div>
            <div className="absolute inset-x-0 bottom-0 h-px bg-gray-900/5" />
          </div>

          <div className="mx-auto px-4 py-8 sm:px-6 lg:px-8">
            <div className="mx-auto flex max-w-2xl items-center justify-between gap-x-8 lg:mx-0 lg:max-w-none">
              <div className="flex items-center gap-x-6">
                <Skeleton className="rounded-full size-16 ring-1 ring-gray-950/10 p-2" />
                <div>
                  <Skeleton className="h-4 w-24 mb-1" />
                  <Skeleton className="h-6 w-48" />
                </div>
              </div>
            </div>
          </div>
        </header> */}
			</main>
			<div className="hidden h-full flex-1 flex-col space-y-8 p-6 pt-0 md:flex">
				<div className="flex flex-col space-y-8">
					{/* <div className="flex w-full justify-start gap-6">
						<Skeleton className="h-8 w-24" />
						<Skeleton className="h-8 w-24" />
						<Skeleton className="h-8 w-24" />
					</div> */}
					<Skeleton className="h-96 w-full" />
				</div>
			</div>
		</>
	);
};

export default Loading;
