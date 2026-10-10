import { Link } from "react-router-dom";
import { assets } from "../assets/assets.js";

function NotFound() {
  return (
    <main
      className="min-h-screen w-full flex items-center justify-center px-4 py-6 sm:px-6 md:px-8 bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${assets.bg})` }}
    >
      <div className="w-full max-w-md sm:max-w-lg">
        <div className="rounded-2xl sm:rounded-3xl bg-white/80 backdrop-blur-md p-6 sm:p-10 md:p-12 shadow-xl text-center">
          <p className="text-xs sm:text-sm font-semibold uppercase tracking-[0.2em] sm:tracking-[0.3em] text-gray-500">
            Error 404
          </p>

          <h1 className="mt-3 sm:mt-4 text-6xl sm:text-8xl md:text-9xl font-black tracking-tight text-gray-900">
            404
          </h1>

          <h2 className="mt-3 sm:mt-4 text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">
            Page Not Found
          </h2>

          <p className="mt-3 text-sm sm:text-base leading-6 text-gray-500 max-w-sm mx-auto">
            The page you're looking for doesn't exist or may have been moved.
          </p>

          <Link
            to="/"
            className="w-full sm:w-auto inline-flex mt-6 sm:mt-8 items-center justify-center rounded-xl bg-gray-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2"
          >
            Go Back Home
          </Link>
        </div>
      </div>
    </main>
  );
}

export default NotFound;
