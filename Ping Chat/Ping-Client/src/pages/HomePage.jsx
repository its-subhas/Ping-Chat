import ChatContainer from "../components/ChatContainer";
import RightSidebar from "../components/RightSidebar";
import Sidebar from "../components/Sidebar";
import { useSelector } from "react-redux";
import { useEffect } from "react";
import GroupChat from "../components/GroupChat";

// Main home page component that manages selected user and group chat state.
function HomePage() {
  // Stores the currently selected user for the chat.
  const selectedUser = useSelector((state) => state.selectedUser);
  // Stores the currently selected user for the info.
  const infoUser = useSelector((state) => state.infoUser);

  // Controls whether the group chat screen is displayed.
  const group = useSelector((state) => state.group);

  // Keeps the chat inside the actually visible mobile viewport when the keyboard opens.
  useEffect(() => {
    const viewport = window.visualViewport;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    const previousBodyOverflow = document.body.style.overflow;

    const updateViewport = () => {
      document.documentElement.style.setProperty(
        "--chat-viewport-height",
        `${viewport?.height ?? window.innerHeight}px`,
      );
      document.documentElement.style.setProperty(
        "--chat-viewport-top",
        `${viewport?.offsetTop ?? 0}px`,
      );
    };

    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";

    updateViewport();
    viewport?.addEventListener("resize", updateViewport);
    viewport?.addEventListener("scroll", updateViewport);
    window.addEventListener("resize", updateViewport);

    return () => {
      viewport?.removeEventListener("resize", updateViewport);
      viewport?.removeEventListener("scroll", updateViewport);
      window.removeEventListener("resize", updateViewport);
      document.documentElement.style.overflow = previousHtmlOverflow;
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.removeProperty("--chat-viewport-height");
      document.documentElement.style.removeProperty("--chat-viewport-top");
    };
  }, []);

  return (
    // Main responsive page container.
    <div
      className="fixed inset-x-0 min-h-0 overflow-hidden sm:p-4 md:px-[8%] lg:px-[12%] xl:px-[15%] sm:py-4 lg:py-[5%]"
      style={{
        top: "var(--chat-viewport-top, 0px)",
        height: "var(--chat-viewport-height, 100dvh)",
      }}
    >
      {!group ? (
        // Main chat layout containing sidebar, chat, and right sidebar.
        <div
          className={`w-full h-full min-h-0 min-w-0 backdrop-blur-xl border-2 border-gray-600 rounded-none sm:rounded-2xl overflow-hidden grid grid-cols-1 relative ${
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
