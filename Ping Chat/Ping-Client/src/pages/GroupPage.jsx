import { useSelector } from "react-redux";
import { assets } from "../assets/assets";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function GroupPage() {
  const createGroup = useSelector((state) => state.createGroup);

  const [selectedImage, setSelectedImage] = useState(null);
  const [groupName, setGroupName] = useState("");
  const [description, setDescription] = useState("");

  const navigate = useNavigate();

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      setSelectedImage(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    navigate("/");
  };

  return (
    <div className="min-h-dvh w-full px-3 py-4 sm:px-6 sm:py-6 md:px-10 flex items-center justify-center">
      <div className="w-full max-w-4xl backdrop-blur-2xl bg-black/10 text-gray-300 border border-gray-600 rounded-xl overflow-hidden shadow-xl">
        <div className="flex justify-end p-3 sm:p-4 md:p-5">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-full hover:bg-white/10 cursor-pointer transition"
          >
            <img
              src={assets.arrow}
              alt="Back"
              className="w-4 h-4 sm:w-5 sm:h-5"
            />
          </button>
        </div>

        <div className="flex flex-col lg:flex-row">
          <form
            onSubmit={handleSubmit}
            className="w-full lg:flex-1 flex flex-col gap-4 sm:gap-5 p-5 sm:p-7 md:p-10"
          >
            <div>
              <h3 className="text-lg sm:text-xl md:text-2xl font-medium text-white">
                {createGroup ? "Create Group" : "Edit Group"}
              </h3>
            </div>

            <label
              htmlFor="group-avatar"
              className="flex items-center gap-3 sm:gap-4 cursor-pointer w-fit"
            >
              <input
                onChange={handleImageChange}
                type="file"
                id="group-avatar"
                accept=".png,.jpg,.jpeg"
                hidden
              />

              <img
                src={selectedImage || assets.avtar}
                alt="Group"
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border border-gray-500 object-cover"
              />

              <div>
                <p className="text-sm sm:text-base text-white">Group Image</p>
                <p className="text-xs sm:text-sm text-gray-400">
                  Click to upload
                </p>
              </div>
            </label>

            <div className="flex flex-col gap-2">
              <label className="text-xs sm:text-sm text-gray-300">
                Group Name
              </label>

              <input
                onChange={(e) => setGroupName(e.target.value)}
                value={groupName}
                type="text"
                required
                placeholder="Enter group name"
                className="w-full p-2.5 sm:p-3 text-sm sm:text-base bg-transparent border border-gray-600 rounded-lg focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs sm:text-sm text-gray-300">
                Description
              </label>

              <textarea
                onChange={(e) => setDescription(e.target.value)}
                value={description}
                placeholder="Write something about your group."
                required
                rows={4}
                className="w-full p-2.5 sm:p-3 text-sm sm:text-base bg-transparent border border-gray-600 rounded-lg focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 resize-none transition"
              />
            </div>

            <button
              type="submit"
              className={`w-full text-white p-2.5 sm:p-3 rounded-lg text-sm sm:text-base font-medium cursor-pointer transition hover:opacity-90 ${
                createGroup
                  ? "bg-violet-600 hover:bg-violet-500"
                  : "bg-blue-600 hover:bg-blue-500"
              }`}
            >
              {createGroup ? "Create Group" : "Update Group"}
            </button>
          </form>

          <div className="w-full lg:w-[38%] flex flex-col items-center justify-center gap-3 sm:gap-4 p-5 sm:p-8 md:p-10 border-t lg:border-t-0 lg:border-l border-gray-700">
            <img
              src={assets.groupLogo}
              alt="Group logo"
              className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 object-contain"
            />

            {createGroup ? (
              <button
                type="button"
                className="w-full max-w-sm bg-green-600 hover:bg-green-500 text-white p-2.5 sm:p-3 rounded-lg text-sm sm:text-base font-medium cursor-pointer transition"
              >
                Add Members
              </button>
            ) : (
              <div className="w-full max-w-sm flex flex-col gap-2.5 sm:gap-3">
                <button
                  type="button"
                  className="w-full bg-green-600 hover:bg-green-500 text-white p-2.5 sm:p-3 rounded-lg text-sm sm:text-base font-medium cursor-pointer transition"
                >
                  Add Members
                </button>

                <button
                  type="button"
                  className="w-full bg-orange-600 hover:bg-orange-500 text-white p-2.5 sm:p-3 rounded-lg text-sm sm:text-base font-medium cursor-pointer transition"
                >
                  Remove Members
                </button>

                <button
                  type="button"
                  className="w-full bg-red-600 hover:bg-red-500 text-white p-2.5 sm:p-3 rounded-lg text-sm sm:text-base font-medium cursor-pointer transition"
                >
                  Delete Group
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default GroupPage;
