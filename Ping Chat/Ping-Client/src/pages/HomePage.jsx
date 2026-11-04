import ChatContainer from "../components/ChatContainer";
import RightSidebar from "../components/RightSidebar";
import Sidebar from "../components/Sidebar";
import { useSelector } from "react-redux";
import GroupChat from "../components/GroupChat";

// Main home page component that manages selected user and group chat state.
function HomePage() {
  // Stores the currently selected user for the chat.
  const selectedUser = useSelector((state) => state.selectedUser);
  // Stores the currently selected user for the info.
  const infoUser = useSelector((state) => state.infoUser);

  // Controls whether the group chat screen is displayed.
  const group = useSelector((state) => state.group);

  return (
    // Main responsive page container.
    <div className="w-full h-dvh sm:min-h-screen sm:p-4 md:px-[8%] lg:px-[12%] xl:px-[15%] sm:py-4 lg:py-[5%]">
      {!group ? (
        // Main chat layout containing sidebar, chat, and right sidebar.
        <div
          className={`w-full h-full backdrop-blur-xl border-2 border-gray-600 rounded-none sm:rounded-2xl overflow-hidden grid grid-cols-1 relative ${
            selectedUser
              ? infoUser
                ? "md:grid-cols-[1fr_1.5fr_1fr] xl:grid-cols-[1fr_2fr_1fr]"
                : "md:grid-cols-[1fr_1.5fr] xl:grid-cols-[1fr_2fr]"
              : "md:grid-cols-2"
          }`}
        >
          {/* Sidebar containing users, search, and group chat option. */}
          <Sidebar />

          {/* Main chat area for the selected user. */}
          <ChatContainer />

          {/* Right sidebar displaying selected user's profile and media. */}
          {selectedUser && infoUser && <RightSidebar />}
        </div>
      ) : (
        // Displays the group chat screen when group is enabled.
        <GroupChat />
      )}
    </div>
  );
}

export default HomePage;
