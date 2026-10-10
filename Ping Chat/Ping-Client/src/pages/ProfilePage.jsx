import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { assets } from "../assets/assets";
import { updateProfile, logout } from "../lib/auth.js";
import { useDispatch, useSelector } from "react-redux";

// Profile page component for updating the user's profile details.
function ProfilePage() {
  const dispatch = useDispatch();
  const authUser = useSelector((state) => state.authUser);
  const navigate = useNavigate();

  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [name, setName] = useState(authUser.fullName || "");
  const [bio, setBio] = useState(authUser.bio || "");
  const [profile, setProfile] = useState(false);

  // Handles profile image selection and creates a preview URL.
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

  // Handles profile form submission.
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedImage) {
      await updateProfile({ fullName: name, bio }, dispatch);
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
      navigate("/");
      return;
    };
  };

  return !profile ? (
    <div className="min-h-screen w-full px-3 py-4 sm:px-6 sm:py-6 md:px-10 flex items-center justify-center">
      {" "}
      <div className="w-full max-w-3xl backdrop-blur-2xl text-gray-300 border-2 border-gray-600 rounded-xl overflow-hidden">
        {/* Back button. */}{" "}
        <div className="flex justify-end p-3 sm:p-4 md:p-5">
          <button
            onClick={() => navigate("/")}
            className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-full hover:bg-white/10 cursor-pointer transition"
          >
            {" "}
            <img
              src={assets.arrow}
              alt="back"
              className="w-4 h-4 sm:w-5 sm:h-5"
            />{" "}
          </button>{" "}
        </div>
        {/* User information. */}
        <div className="flex flex-col items-center text-center px-4 pb-6 sm:px-8 sm:pb-8 md:px-10 md:pb-10">
          {/* Profile image. */}
          <img
            src={imagePreview || authUser.profilePic || assets.avtar}
            alt="profile"
            className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full object-cover border-2 border-gray-500"
          />

          {/* User name. */}
          <h2 className="mt-3 sm:mt-4 max-w-full px-2 text-lg sm:text-xl md:text-2xl font-semibold text-white truncate">
            {authUser.fullName}
          </h2>

          {/* User bio. */}
          <p className="mt-2 w-full max-w-md px-2 text-xs sm:text-sm md:text-base text-gray-400 break-words">
            {authUser.bio}
          </p>

          {/* Edit profile button. */}
          <button
            onClick={() => setProfile(true)}
            className="mt-5 sm:mt-6 w-full max-w-xs px-5 py-2 sm:py-2.5 text-sm sm:text-base rounded-full bg-gradient-to-r from-purple-400 to-violet-600 text-white cursor-pointer hover:from-purple-500 hover:to-violet-700 transition"
          >
            Edit Profile
          </button>

          {/* Logout button. */}
          <button
            onClick={() => logout(dispatch)}
            className="mt-3 w-full max-w-xs px-5 py-2 sm:py-2.5 text-sm sm:text-base rounded-full bg-red-400 text-white cursor-pointer hover:bg-red-500 transition"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  ) : (
    <div className="min-h-screen w-full px-3 py-4 sm:px-6 sm:py-6 md:px-10 flex items-center justify-center">
      {" "}
      <div className="w-full max-w-3xl backdrop-blur-2xl text-gray-300 border-2 border-gray-600 rounded-xl overflow-hidden">
        {/* Back button. */}{" "}
        <div className="flex justify-end p-3 sm:p-4 md:p-5">
          <button
            onClick={() => {
              setProfile(false);
              setSelectedImage(null);
              setImagePreview(null);
              setName(authUser.fullName);
              setBio(authUser.bio);
            }}
            className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-full hover:bg-white/10 cursor-pointer transition"
          >
            {" "}
            <img
              src={assets.arrow}
              alt="back"
              className="w-4 h-4 sm:w-5 sm:h-5"
            />{" "}
          </button>{" "}
        </div>
        <div className="flex flex-col-reverse sm:flex-row items-center">
          {/* Profile details form. */}
          <form
            onSubmit={handleSubmit}
            className="w-full sm:flex-1 flex flex-col gap-5 p-5 sm:p-7 md:p-10"
          >
            <h3 className="text-lg sm:text-xl font-medium">Details</h3>

            {/* Profile image upload section. */}
            <label
              htmlFor="avatar"
              className="flex items-center gap-3 cursor-pointer w-fit"
            >
              <input
                onChange={handleImageChange}
                type="file"
                id="avatar"
                accept="image/png,image/jpeg"
                hidden
              />

              <img
                src={imagePreview || authUser.profilePic || assets.avtar}
                alt="profile"
                className="w-12 h-12 sm:w-14 sm:h-14 rounded-full border border-gray-500 object-cover"
              />

              <span className="text-sm sm:text-base">Upload Profile Image</span>
            </label>

            {/* User name input. */}
            <input
              onChange={(e) => setName(e.target.value)}
              value={name}
              type="text"
              required
              placeholder="Enter Your Name"
              className="w-full p-2.5 sm:p-3 text-sm sm:text-base bg-transparent border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500"
            />

            {/* User bio input. */}
            <textarea
              onChange={(e) => setBio(e.target.value)}
              value={bio}
              placeholder="Set Your Bio"
              required
              rows={4}
              className="w-full p-2.5 sm:p-3 text-sm sm:text-base bg-transparent border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
            />

            {/* Saves the profile details. */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-400 to-violet-600 text-white p-2.5 sm:p-3 rounded-full text-base sm:text-lg cursor-pointer hover:opacity-90 transition"
            >
              Save
            </button>
          </form>

          {/* Ping logo section. */}
          <div className="w-full sm:w-2/5 flex items-center justify-center p-5 sm:p-8 md:p-10">
            <img
              src={assets.logo}
              alt="logo"
              className="w-24 h-24 sm:w-36 sm:h-36 md:w-44 md:h-44 object-contain rounded-md"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
