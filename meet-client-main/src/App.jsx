import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import Protected from "./components/ProtectedRoute";

/* ── lazy‑loaded pages (code‑split into separate chunks) ────── */
const Register = lazy(() => import("./pages/Register"));
const Home = lazy(() => import("./pages/Home"));
const Create = lazy(() => import("./pages/Create"));
const Explore = lazy(() => import("./pages/Explore"));
const Notification = lazy(() => import("./pages/Notification"));
const Profile = lazy(() => import("./pages/Profile"));
const AddPeople = lazy(() => import("./pages/AddPeople"));
const SinglePost = lazy(() => import("./pages/SinglePost"));
const Chat = lazy(() => import("./pages/Chat"));

/* ── minimal loading fallback ────────────────────────────────── */
const PageLoader = () => (
  <div className="flex h-screen items-center justify-center">
    <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-800" />
  </div>
);

const App = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/login" element={<Register />} />
        <Route path="/" element={<Protected element={<Home />} />} />
        <Route path="/upload" element={<Protected element={<Create />} />} />
        <Route path="/explore" element={<Protected element={<Explore />} />} />
        <Route
          path="/notification"
          element={<Protected element={<Notification />} />}
        />
        <Route
          path="/profile/:id"
          element={<Protected element={<Profile />} />}
        />
        <Route
          path="/post/:id"
          element={<Protected element={<SinglePost />} />}
        />
        <Route path="/add" element={<Protected element={<AddPeople />} />} />
        <Route path="/chat" element={<Protected element={<Chat />} />} />
      </Routes>
    </Suspense>
  );
};

export default App;
