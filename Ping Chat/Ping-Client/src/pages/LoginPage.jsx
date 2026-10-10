import { useState } from "react";
import { assets } from "../assets/assets";
import { login } from "../lib/auth.js";
import { useDispatch } from "react-redux";

// Login and signup page component.
function LoginPage() {
  // Controls whether the form is in Sign Up or Login mode.
  const [currentState, setCurrentState] = useState("Login");

  // Stores the user's full name.
  const [fullName, setFullName] = useState("");

  // Stores the user's email address.
  const [email, setEmail] = useState("");

  // Stores the user's password.
  const [password, setPassword] = useState("");

  // Stores the user's bio during the second signup step.
  const [bio, setBio] = useState("");

  // Stores the terms and privacy policy checkbox state.
  const [tick, setTick] = useState("");

  // Controls whether the signup form has moved to the bio step.
  const [isDataSubmited, setIsDataSubmited] = useState(false);

  const dispatch = useDispatch();


  // Handles form submission and moves signup to the next step.
  const onSubmitHandler = async (event) => {
    event.preventDefault();

    if (currentState === "Sign Up" && !isDataSubmited) {
      setIsDataSubmited(true);
      return;
    }

    await login(currentState === "Sign Up" ? "signup" : "login", {fullName, email, password, bio}, dispatch );
    return;
  };

  // Handles Google authentication.
  const handleGoogleAuth = () => {
    console.log("Google authentication");
  };

  return (
    // Main responsive login page container.
    <div className="min-h-screen w-full px-4 py-6 sm:px-6 md:px-8 flex items-center justify-center bg-cover bg-center backdrop-blur-xs">
      <div className="w-full max-w-5xl flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12 lg:gap-20">
        {/* Ping logo and application name. */}
        <div className="flex flex-col items-center justify-center gap-3 sm:gap-5">
          <img
            src={assets.logo}
            alt="Ping logo"
            className="w-24 sm:w-32 md:w-40 lg:w-48 h-auto"
          />

          <h1 className="font-medium text-3xl sm:text-4xl md:text-5xl text-white text-center">
            Ping
          </h1>
        </div>

        {/* Login and signup form. */}
        <form
          onSubmit={onSubmitHandler}
          className="w-full max-w-md sm:max-w-lg md:max-w-md border-2 bg-white/8 text-white border-gray-500 p-5 sm:p-6 md:p-7 lg:p-8 flex flex-col rounded-xl shadow-lg gap-4"
        >
          {/* Form heading and back button for the second signup step. */}
          <h2 className="font-medium text-xl sm:text-2xl flex justify-between items-center gap-3">
            {currentState}

            {isDataSubmited && (
              <img
                onClick={() => setIsDataSubmited(false)}
                src={assets.arrow}
                alt="back"
                className="w-5 h-5 cursor-pointer object-contain"
              />
            )}
          </h2>

          {/* Full name field shown only during the first signup step. */}
          {currentState === "Sign Up" && !isDataSubmited && (
            <input
              onChange={(e) => setFullName(e.target.value)}
              type="text"
              value={fullName}
              className="w-full p-2.5 sm:p-3 text-sm sm:text-base bg-transparent border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Full Name"
              required
            />
          )}

          {/* Email and password fields shown during the first step. */}
          {!isDataSubmited && (
            <>
              <input
                onChange={(e) => setEmail(e.target.value)}
                value={email}
                type="email"
                placeholder="Email Address"
                required
                className="w-full p-2.5 sm:p-3 text-sm sm:text-base bg-transparent border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />

              <input
                onChange={(e) => setPassword(e.target.value)}
                value={password}
                type="password"
                placeholder="Enter Password"
                required
                className="w-full p-2.5 sm:p-3 text-sm sm:text-base bg-transparent border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </>
          )}

          {/* Bio field shown during the second signup step. */}
          {currentState === "Sign Up" && isDataSubmited && (
            <textarea
              onChange={(e) => setBio(e.target.value)}
              value={bio}
              rows={4}
              className="w-full p-2.5 sm:p-3 text-sm sm:text-base bg-transparent border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              placeholder="Set Your Bio"
            />
          )}

          {/* Submit button with text based on the current form state. */}
          <button
            type="submit"
            className="w-full py-2.5 sm:py-3 bg-gradient-to-r from-purple-400 to-violet-600 text-white rounded-md cursor-pointer text-sm sm:text-base hover:opacity-90 transition"
          >
            {currentState === "Sign Up"
              ? isDataSubmited
                ? "Continue"
                : "Create Account"
              : "Login"}
          </button>

          {/* Google authentication section shown on the first step. */}
          {!isDataSubmited && (
            <>
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="h-px bg-gray-500 flex-1" />
                <span className="text-xs sm:text-sm text-gray-400">OR</span>
                <div className="h-px bg-gray-500 flex-1" />
              </div>

              {/* Google authentication button. */}
              <button
                type="button"
                onClick={handleGoogleAuth}
                className="w-full py-2.5 sm:py-3 bg-white text-gray-700 rounded-md cursor-pointer flex items-center justify-center gap-2 sm:gap-3 text-sm sm:text-base hover:bg-gray-100 transition"
              >
                {/* Google logo SVG. */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 48 48"
                  className="w-5 h-5 shrink-0"
                >
                  <path
                    fill="#FFC107"
                    d="M43.6 20.5H42V20H24v8h11.3C33.6 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.7 1.1 7.8 3l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.4-.4-3.5z"
                  />
                  <path
                    fill="#FF3D00"
                    d="M6.3 14.7l6.6 4.8C14.7 16.1 19 12 24 12c3 0 5.7 1.1 7.8 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.6 8.3 6.3 14.7z"
                  />
                  <path
                    fill="#4CAF50"
                    d="M24 44c5.1 0 9.7-2 13.1-5.2l-6.1-5.2C29.3 35.1 26.8 36 24 36c-5.3 0-9.6-3.3-11.2-8l-6.5 5C9.6 39.7 16.3 44 24 44z"
                  />
                  <path
                    fill="#1976D2"
                    d="M43.6 20.5H42V20H24v8h11.3c-1.1 3.1-3.1 5.5-5.3 7l6.1 5.2C39.7 36.6 44 30.8 44 24c0-1.2-.1-2.4-.4-3.5z"
                  />
                </svg>

                <span>Continue with Google</span>
              </button>
            </>
          )}

          {/* Terms and privacy policy checkbox for signup. */}
          {currentState !== "Login" && !isDataSubmited && (
            <div className="flex items-start justify-center text-center gap-2 text-xs sm:text-sm text-gray-500">
              <input
                onChange={(e) => setTick(e.target.checked)}
                type="checkbox"
                checked={!!tick}
                className="cursor-pointer mt-0.5 shrink-0"
                required
              />

              <p>Agree to the terms of use & privacy policy.</p>
            </div>
          )}

          {/* Switches between login and signup modes. */}
          {!isDataSubmited && (
            <div className="flex flex-col gap-2 items-center justify-center text-center">
              {currentState === "Sign Up" ? (
                <p className="text-xs sm:text-sm text-gray-500">
                  Already have an account?{" "}
                  <span
                    onClick={() => {
                      setCurrentState("Login");
                      setIsDataSubmited(false);
                    }}
                    className="font-medium text-violet-500 cursor-pointer hover:text-violet-400"
                  >
                    Login here
                  </span>
                </p>
              ) : (
                <p className="text-xs sm:text-sm text-gray-500">
                  Create an account{" "}
                  <span
                    onClick={() => {
                      setCurrentState("Sign Up");
                      setIsDataSubmited(false);
                    }}
                    className="font-medium text-violet-500 cursor-pointer hover:text-violet-400"
                  >
                    Click here
                  </span>
                </p>
              )}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
