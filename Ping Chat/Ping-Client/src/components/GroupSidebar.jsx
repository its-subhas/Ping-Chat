import { useNavigate } from "react-router-dom";
import { assets, groups } from "../assets/assets";
import { useDispatch, useSelector } from "react-redux";
import { setCreateGroup, setGroup, setSelectedGroup } from "../store/slice";

function GroupSidebar() {
  const group = useSelector((state) => state.group);
  const selectedGroup = useSelector((state) => state.selectedGroup);
  const audioCall = useSelector((state) => state.audioCall);
  const videoCall = useSelector((state) => state.videoCall);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const backToChat = () => {
    group && dispatch(setGroup(false));
  };

  const returnToCall = () => {
    navigate("/calls");
  };

  const createGroup = () => {
    dispatch(setCreateGroup(true));
    navigate("/Group");
  };

  return (
    <div
      className={`bg-[#8185B2]/10 h-full p-3 sm:p-4 md:p-5 rounded-r-xl overflow-y-auto text-white ${
        selectedGroup ? "max-md:hidden" : ""
      }`}
    >
      <div className="pb-4 sm:pb-5">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2 min-w-0">
            <img
              src={assets.groupLogo}
              alt="groupLogo"
              className="w-8 h-8 sm:w-9 sm:h-9 shrink-0"
            />

            <span className="text-xl sm:text-2xl font-bold tracking-wide">
              Group
            </span>
          </div>

          <div
            onClick={returnToCall}
            className={`${
              audioCall || videoCall ? "flex" : "hidden"
            } items-center gap-1.5 cursor-pointer`}
          >
            <img
              src={audioCall ? assets.call : assets.video}
              alt="calls"
              className="w-5 h-5 sm:w-6 sm:h-6"
            />

            <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
          </div>

          <div onClick={backToChat} className="relative py-2 group shrink-0">
            <img
              src={assets.arrow}
              alt="back"
              className="w-5 h-5 cursor-pointer"
            />
          </div>
        </div>

        <div className="mt-4 sm:mt-5 flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 rounded-full bg-[#282142] border border-gray-600">
          <img
            src={assets.search}
            alt="search"
            className="w-4 h-4 opacity-70 shrink-0"
          />

          <input
            type="text"
            placeholder="Search Group"
            className="w-full min-w-0 bg-transparent outline-none border-none text-xs sm:text-sm text-white placeholder-gray-400"
          />
        </div>

        <div
          onClick={createGroup}
          className="mt-4 sm:mt-5 flex items-center justify-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 rounded-2xl bg-[#282142] border border-gray-600 cursor-pointer"
        >
          <div className="flex items-center gap-2 min-w-0">
            <img
              src={assets.add}
              alt="Group"
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover shrink-0"
            />

            <p
              className={`${selectedGroup ? "hidden" : "text-sm sm:text-base truncate"}`}
            >
              Create Group
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        {groups.map((group, index) => (
          <div
            onClick={() => dispatch(setSelectedGroup(group))}
            key={group._id || index}
            className={`relative flex items-center gap-2 sm:gap-3 p-2 sm:p-2.5 pl-3 sm:pl-4 rounded-md cursor-pointer transition ${
              selectedGroup?._id === group._id
                ? "bg-[#0891B2]/50"
                : "hover:bg-white/5"
            }`}
          >
            <img
              src={group?.groupPic || assets.avtar}
              alt="group picture"
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover shrink-0"
            />

            <div className="flex flex-col leading-5 min-w-0 pr-6">
              <p className="text-sm sm:text-base truncate">{group.groupName}</p>

              {index < 3 ? (
                <span className="text-green-400 text-[10px] sm:text-xs">
                  {index + 1} Online
                </span>
              ) : (
                <span className="text-neutral-400 text-[10px] sm:text-xs">
                  Offline
                </span>
              )}
            </div>

            {index > 2 && (
              <p className="absolute top-1/2 -translate-y-1/2 right-2 sm:right-3 text-[10px] sm:text-xs h-5 w-5 flex justify-center items-center rounded-full bg-violet-500/50">
                {index}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default GroupSidebar;
