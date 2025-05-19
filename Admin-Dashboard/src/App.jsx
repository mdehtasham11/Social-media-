import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { Toaster } from 'react-hot-toast';
import SideBar from "./Component/SideBar";
import Dashboard from "./Component/Dashboard";
import TextAnalysis from "./Component/TextAnalysis";
// import CommentAnalysis from "./Component/CommentAnalysis";
// import CaptionAnalysis from "./Component/CaptionAnalysis";
import PostModeration from "./Component/PostModeration";
import UserManagement from "./Component/UserManagement";
import AdminLogin from "./Component/AdminLogin";
import ProtectedRoute from "./Component/ProtectedRoute";

const AppLayout = () => {
  const location = useLocation();

  // Determine if current route is login
  const isLoginPage = location.pathname === "/login";

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Hide sidebar on login page */}
      {!isLoginPage && <SideBar />}
      <div className="flex-1 overflow-auto">
        <Routes>
          <Route path="/login" element={<AdminLogin />} />

          {/* Protected routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/text-analysis"
            element={
              <ProtectedRoute>
                <TextAnalysis />
              </ProtectedRoute>
            }
          />
          {/* <Route path="/comment-analysis" element={<CommentAnalysis />} /> */}
          {/* <Route path="/caption-analysis" element={<CaptionAnalysis />} /> */}
          <Route
            path="/post-moderation"
            element={
              <ProtectedRoute>
                <PostModeration />
              </ProtectedRoute>
            }
          />
          <Route
            path="/user-management"
            element={
              <ProtectedRoute>
                <UserManagement />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
      <Toaster position="top-right" />
    </div>
  );
};

function App() {
  return (
    <Router>
      <AppLayout />
    </Router>
  );
}

export default App;
