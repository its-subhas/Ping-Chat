import { Navigate, Route, Routes } from "react-router-dom";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import HomePage from "./pages/HomePage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import NotFound from "./pages/NotFound.jsx";
import GroupPage from "./pages/GroupPage.jsx";
import AudioVideoCallPage from "./pages/AudioVideoCallPage.jsx";
import { Toaster } from "react-hot-toast";
import { initializeAuth } from "./lib/auth.js";
import Loading from "./components/Loading.jsx";
import { setAuthLoading } from "./store/slice.js";
import Calls from "./pages/Calls.jsx";

function App() {
  const authUser = useSelector((state) => state.authUser);
  const token = useSelector((state) => state.token);
  const dispatch = useDispatch();
  const loading = useSelector((state) => state.loading);

  useEffect(() => {
    const verifyAuth = async () => {
      dispatch(setAuthLoading(true));
      try {
        await initializeAuth(dispatch);
      } catch (error) {
        console.error("Authentication failed:", error);
      } finally {
        dispatch(setAuthLoading(false));
      }
    };
    verifyAuth();
  }, [dispatch]);

  useEffect(() => {
    if (!token) return;

    let payload;

    try {
      payload = JSON.parse(atob(token.split(".")[1]));
    } catch {
      return;
    }

    if (typeof payload.exp !== "number") return;

    const expiresIn = payload.exp * 1000 - Date.now();
    const refreshTime = expiresIn - 30000;

    if (refreshTime <= 0) {
      initializeAuth(dispatch);
      return;
    }

    const timeout = setTimeout(() => {
      initializeAuth(dispatch);
    }, refreshTime);

    return () => clearTimeout(timeout);
  }, [token, dispatch]);

  if (loading) {
    return <Loading />;
  }

  return (
    <div
      className="w-full min-h-dvh bg-cover bg-center bg-no-repeat"
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

        <Route
          path="/connectedCalls"
          element={authUser ? <Calls /> : <Navigate to="/login" />}
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

export default App;
