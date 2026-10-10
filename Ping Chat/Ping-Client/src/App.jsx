import { Navigate, Route, Routes } from "react-router-dom";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import HomePage from "./pages/HomePage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import NotFound from "./pages/NotFound.jsx";
import GroupPage from "./pages/GroupPage.jsx";
import AudioVideoCallPage from "./pages/AudioVideoCallPage.jsx";
import { Toaster } from "react-hot-toast";
import { checkAuth } from "./lib/auth.js";
import Loading from "./components/Loading.jsx";

function App() {
  const authUser = useSelector((state) => state.authUser);
  const token = useSelector((state) => state.token);
  const dispatch = useDispatch();
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const verifyAuth = async () => {
      if (token) {
        await checkAuth(dispatch);
      }

      setAuthLoading(false);
    };

    verifyAuth();
  }, [token, dispatch]);

  if (authLoading) {
    return <Loading />;
  }

  return (
    <div
      className="w-full min-h-screen bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/background.jpg')" }}
    >
      <Toaster />

      <Routes>
        <Route
          path="/"
          element={authUser ? <HomePage /> : <Navigate to="/login" />}
        />
        <Route
          path="/login"
          element={!authUser ? <LoginPage /> : <Navigate to="/" />}
        />
        <Route
          path="/profile"
          element={authUser ? <ProfilePage /> : <Navigate to="/login" />}
        />
        <Route
          path="/group"
          element={authUser ? <GroupPage /> : <Navigate to="/login" />}
        />
        <Route
          path="/calls"
          element={authUser ? <AudioVideoCallPage /> : <Navigate to="/login" />}
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

export default App;
