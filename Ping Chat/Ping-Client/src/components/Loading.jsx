function Loading() {
  return (
    <div className="fixed inset-0 z-50 w-full min-h-[100dvh] flex items-center justify-center bg-[#0b0714] px-4 overflow-hidden">
      <div className="absolute -top-24 -left-24 w-56 h-56 sm:w-72 sm:h-72 lg:w-96 lg:h-96 bg-purple-600/20 rounded-full blur-3xl" />
      <div className="absolute -bottom-24 -right-24 w-56 h-56 sm:w-72 sm:h-72 lg:w-96 lg:h-96 bg-pink-600/20 rounded-full blur-3xl" />

      <div className="relative flex flex-col items-center text-center">
        <div className="relative mb-5 sm:mb-6">
          <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-full border-4 border-purple-500/20 border-t-pink-500 border-r-purple-500 animate-spin" />

          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
              P
            </span>
          </div>
        </div>

        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white tracking-wide">
          Ping
        </h1>

        <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm lg:text-base text-gray-400">
          Connecting...
        </p>

        <div className="flex gap-1.5 mt-4 sm:mt-5">
          <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-purple-500 animate-bounce" />
          <span
            className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-pink-500 animate-bounce"
            style={{ animationDelay: "150ms" }}
          />
          <span
            className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-purple-400 animate-bounce"
            style={{ animationDelay: "300ms" }}
          />
        </div>
      </div>
    </div>
  );
}

export default Loading;
