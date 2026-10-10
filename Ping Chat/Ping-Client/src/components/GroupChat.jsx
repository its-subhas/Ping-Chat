import GroupSidebar from "./GroupSidebar";
import GroupChatContainer from "./GroupChatContainer";
import GroupRightSidebar from "./GroupRightSidebar";
import { useSelector } from "react-redux";

function GroupChat() {
  const selectedGroup = useSelector((state) => state.selectedGroup);
  const infoGroup = useSelector((state) => state.infoGroup);
  const group = useSelector((state) => state.group);

  return (
    group && (
      <div
        className={`w-full h-full backdrop-blur-xl border-2 border-gray-600 rounded-none sm:rounded-2xl overflow-hidden grid grid-cols-1 relative ${
          selectedGroup
            ? infoGroup
              ? "md:grid-cols-[1fr_1.5fr_1fr] xl:grid-cols-[1fr_2fr_1fr]"
              : "md:grid-cols-[1fr_1.5fr] xl:grid-cols-[1fr_2fr]"
            : "md:grid-cols-2"
        }`}
      >
        <GroupSidebar />

        <GroupChatContainer />

        {selectedGroup && infoGroup && <GroupRightSidebar />}
      </div>
    )
  );
}

export default GroupChat;
