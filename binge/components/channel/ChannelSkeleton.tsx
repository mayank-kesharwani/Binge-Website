export default function ChannelSkeleton() {
  return (
    <div className="mx-auto max-w-[1800px] animate-pulse">

      {/* Banner */}
      <div className="h-72 w-full rounded-3xl bg-gray-200" />

      <div className="px-6">

        {/* Avatar + Info */}
        <div className="-mt-16 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">

          <div className="flex gap-5">

            <div className="h-36 w-36 rounded-full border-4 border-white bg-gray-200" />

            <div className="pt-16">

              <div className="h-8 w-72 rounded bg-gray-200" />

              <div className="mt-3 h-5 w-48 rounded bg-gray-200" />

              <div className="mt-4 h-5 w-64 rounded bg-gray-200" />

            </div>

          </div>

          <div className="h-12 w-40 rounded-full bg-gray-200" />

        </div>

        {/* Tabs */}
        <div className="mt-10 flex gap-6 border-b pb-4">

          <div className="h-5 w-20 rounded bg-gray-200" />

          <div className="h-5 w-20 rounded bg-gray-200" />

          <div className="h-5 w-20 rounded bg-gray-200" />

          <div className="h-5 w-20 rounded bg-gray-200" />

        </div>

        {/* Videos */}
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className="space-y-4"
            >
              <div className="aspect-video rounded-2xl bg-gray-200" />

              <div className="flex gap-3">

                <div className="h-10 w-10 rounded-full bg-gray-200" />

                <div className="flex-1">

                  <div className="h-4 w-full rounded bg-gray-200" />

                  <div className="mt-3 h-4 w-2/3 rounded bg-gray-200" />

                </div>

              </div>

            </div>
          ))}

        </div>

      </div>

    </div>
  );
}