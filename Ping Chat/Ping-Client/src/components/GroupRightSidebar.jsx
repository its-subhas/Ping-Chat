import { useDispatch, useSelector } from "react-redux";
import { assets, media } from "../assets/assets";
import { setCreateGroup, setInfoGroup, setSelectedGroup } from "../store/slice";
import { useNavigate } from "react-router-dom";

function GroupRightSidebar() {
  const selectedGroup = useSelector((state) => state.selectedGroup);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const editGroup = () => {
    dispatch(setCreateGroup(false))
    navigate("/Group");
  };

  return (
    selectedGroup && (
      <div className="bg-[#8185B2]/10 text-white w-full h-full min-w-0 flex flex-col overflow-hidden">
        {/* Mobile back button. */}
        <div className="h-12 sm:h-14 flex items-center justify-end px-3 sm:px-4 md:hidden shrink-0">
          <img
            onClick={() => dispatch(setInfoGroup(false))}
            src={assets.arrow}
            alt="back"
            className="w-5 h-5 sm:w-6 sm:h-6 cursor-pointer"
          />
        </div>

        {/* Group information. */}
        <div className="shrink-0 pt-6 sm:pt-10 md:pt-12 lg:pt-16 px-3 sm:px-4 md:px-5 flex flex-col items-center text-xs font-light">
          <div className="w-full min-w-0 flex flex-col items-center gap-3">
            <img
              src={selectedGroup?.groupPic || assets.avtar}
              alt="groupProfile"
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover shrink-0"
            />

            <h1 className="w-full max-w-full px-2 text-lg sm:text-xl font-medium flex items-center justify-center gap-2 text-center">
              <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
              <span className="min-w-0 break-words">
                {selectedGroup?.groupName}
              </span>
            </h1>

            <p className="w-full max-w-xs px-2 text-center text-xs sm:text-sm text-gray-300 break-words leading-relaxed">
              {selectedGroup?.description}
            </p>

            <button
              onClick={editGroup}
              className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-violet-500/30 border border-violet-400/40 text-xs sm:text-sm text-white hover:bg-violet-500/50 transition cursor-pointer"
            >
              Edit Group
            </button>
          </div>
        </div>

        <hr className="border-[#ffffff50] my-4 sm:my-5 shrink-0" />

        {/* Media section. */}
        <div className="flex-1 min-h-0 px-3 sm:px-4 md:px-5 pb-4 flex flex-col overflow-hidden">
          <p className="text-sm sm:text-base shrink-0">Media</p>

          {/* Only images scroll. */}
          <div className="mt-2 flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 opacity-80">
              {media.map((url, index) => (
                <div
                  key={index}
                  onClick={() => window.open(url.url, "_blank")}
                  className="w-full aspect-square min-w-0 cursor-pointer rounded-md overflow-hidden"
                >
                  <img
                    src={url.url}
                    alt="media"
                    className="w-full h-full object-cover rounded-md hover:opacity-80 transition"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Close chat button. */}
        <div className="shrink-0 px-3 sm:px-4 md:px-5 py-3 sm:py-4 bg-[#282142]/30">
          <button
            onClick={() => {
              dispatch(setSelectedGroup(null));
              dispatch(setInfoGroup(false));
            }}
            className="w-full bg-gradient-to-r from-purple-400 to-violet-600 text-white text-sm font-light py-2.5 sm:py-3 px-6 rounded-full cursor-pointer hover:opacity-90 transition"
          >
            Close Chat
          </button>
        </div>
      </div>
    )
  );
}

export default GroupRightSidebar;
