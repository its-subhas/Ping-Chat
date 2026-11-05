import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { assets } from "../assets/assets";
import { updateProfile, logout } from "../lib/auth.js";
import { useDispatch, useSelector } from "react-redux";
import { setLogoutLoading, setProfileLoading } from "../store/slice.js";

function ProfilePage() {
  const dispatch = useDispatch();
  const authUser = useSelector((state) => state.authUser);
  const navigate = useNavigate();

  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [name, setName] = useState(authUser.fullName || "");
  const [bio, setBio] = useState(authUser.bio || "");
  const [profile, setProfile] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (file) {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }

      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(setProfileLoading(true));

    if (!selectedImage) {
      await updateProfile({ fullName: name, bio }, dispatch);
      dispatch(setProfileLoading(false));
      navigate("/");
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(selectedImage);

    reader.onload = async () => {
      const base64Image = reader.result;

      await updateProfile(
        { profilePic: base64Image, fullName: name, bio },
        dispatch,
      );

      dispatch(setProfileLoading(false));
      navigate("/");
    };
  };

  const resetProfile = () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    setProfile(false);
    setSelectedImage(null);
    setImagePreview(null);
    setName(authUser.fullName || "");
    setBio(authUser.bio || "");
  };

  return !profile ? (
    <div
      className="w-full flex items-center justify-center overflow-y-auto px-3 py-4 sm:px-6 sm:py-6 md:px-10"
      style={{ minHeight: "var(--chat-viewport-height, 100dvh)" }}
    >
      <div className="w-full max-w-3xl backdrop-blur-2xl text-gray-300 border-2 border-gray-600 rounded-xl overflow-hidden">
        <div className="flex justify-end p-3 sm:p-4 md:p-5">
          <button
            onClick={() => navigate("/")}
            className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-full hover:bg-white/10 cursor-pointer transition"
          >
            <img
              src={assets.arrow}
              alt="back"
              className="w-4 h-4 sm:w-5 sm:h-5"
            />
          </button>
        </div>

        <div className="flex flex-col items-center text-center px-4 pb-6 sm:px-8 sm:pb-8 md:px-10 md:pb-10">
          <img
            src={imagePreview || authUser.profilePic || assets.avtar}
            alt="profile"
            className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full object-cover border-2 border-gray-500"
          />

          <div className="mt-3 sm:mt-4 flex items-center justify-center gap-1.5 max-w-full">
            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-white text-center break-words [overflow-wrap:anywhere]">
              {authUser.fullName}
            </h2>

            {authUser.verified && (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="-1 0.235 24 24"
                fill="currentColor"
                className="w-5 h-5 sm:w-6 sm:h-6 text-sky-400 shrink-0"
                aria-label="Verified"
                role="img"
              >
                <path
                  fillRule="evenodd"
                  d="M9.401 3.003c.807-1.026 2.391-1.026 3.198 0l.854 1.086 1.376-.201c1.3-.19 2.486.759 2.613 2.066l.135 1.384 1.274.558c1.203.527 1.673 1.97 1.037 3.12l-.674 1.219.674 1.219c.636 1.15.166 2.593-1.037 3.12l-1.274.558-.135 1.384c-.127 1.307-1.313 2.256-2.613 2.066l-1.376-.201-.854 1.086c-.807 1.026-2.391 1.026-3.198 0l-.854-1.086-1.376.201c-1.3.19-2.486-.759-2.613-2.066l-.135-1.384-1.274-.558c-1.203-.527-1.673-1.97-1.037-3.12l.674-1.219-.674-1.219c-.636-1.15-.166-2.593 1.037-3.12l1.274-.558.135-1.384c.127-1.307 1.313-2.256 2.613-2.066l1.376.201.854-1.086Zm4.793 7.873a.75.75 0 0 0-1.116-1.002l-2.81 3.13-1.374-1.374a.75.75 0 1 0-1.06 1.06l1.934 1.935a.75.75 0 0 0 1.088-.029l3.338-3.72Z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </div>

          {authUser.verified && (
            <p className="mt-1 px-2 text-xs sm:text-sm text-gray-400 break-all">
              {authUser.email}
            </p>
          )}

          <p className="mt-2 w-full max-w-md px-2 text-xs sm:text-sm md:text-base text-gray-400 break-words">
            {authUser.bio}
          </p>

          <button
            onClick={() => setProfile(true)}
            className="mt-5 sm:mt-6 w-full max-w-xs px-5 py-2 sm:py-2.5 text-sm sm:text-base rounded-full bg-gradient-to-r from-purple-400 to-violet-600 text-white cursor-pointer hover:from-purple-500 hover:to-violet-700 transition"
          >
            Edit Profile
          </button>

          <button
            onClick={async () => {
              dispatch(setLogoutLoading(true));
              await logout(dispatch);
              dispatch(setLogoutLoading(false));
            }}
            className="mt-3 w-full max-w-xs px-5 py-2 sm:py-2.5 text-sm sm:text-base rounded-full bg-red-400 text-white cursor-pointer hover:bg-red-500 transition"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  ) : (
    <div
      className="w-full flex items-center justify-center overflow-y-auto px-3 py-4 sm:px-6 sm:py-6 md:px-10"
      style={{ minHeight: "var(--chat-viewport-height, 100dvh)" }}
    >
      <div className="w-full max-w-3xl backdrop-blur-2xl text-gray-300 border-2 border-gray-600 rounded-xl overflow-hidden">
        <div className="flex justify-end p-3 sm:p-4 md:p-5">
          <button
            onClick={resetProfile}
            className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-full hover:bg-white/10 cursor-pointer transition"
          >
            <img
              src={assets.arrow}
              alt="back"
              className="w-4 h-4 sm:w-5 sm:h-5"
            />
          </button>
        </div>

        <div className="flex flex-col-reverse sm:flex-row items-center">
          <form
            onSubmit={handleSubmit}
            className="w-full sm:flex-1 flex flex-col gap-4 sm:gap-5 p-4 sm:p-7 md:p-10"
          >
            <h3 className="text-lg sm:text-xl font-medium">Details</h3>

            <label
              htmlFor="avatar"
              className="flex items-center gap-3 cursor-pointer w-fit"
            >
              <input
                onChange={handleImageChange}
                type="file"
                id="avatar"
                accept="image/jpeg, image/jpg, image/png"
                hidden
              />

              <img
                src={imagePreview || authUser.profilePic || assets.avtar}
                alt="profile"
                className="w-12 h-12 sm:w-14 sm:h-14 rounded-full border border-gray-500 object-cover"
              />

              <span className="text-sm sm:text-base">
                Upload Profile Image
              </span>
            </label>

            <input
              onChange={(e) => setName(e.target.value)}
              value={name}
              type="text"
              required
              placeholder="Enter Your Name"
              className="w-full p-2.5 sm:p-3 text-sm sm:text-base bg-transparent border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500"
            />

            <textarea
              onChange={(e) => setBio(e.target.value)}
              value={bio}
              placeholder="Set Your Bio"
              required
              rows={4}
              className="w-full p-2.5 sm:p-3 text-sm sm:text-base bg-transparent border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
            />

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-400 to-violet-600 text-white p-2.5 sm:p-3 rounded-full text-base sm:text-lg cursor-pointer hover:opacity-90 transition"
            >
              Save
            </button>
          </form>

          <div className="w-full sm:w-2/5 flex items-center justify-center p-3 sm:p-8 md:p-10">
            <img
              src={assets.logo}
              alt="logo"
              className="w-16 h-16 sm:w-36 sm:h-36 md:w-44 md:h-44 object-contain rounded-md"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
