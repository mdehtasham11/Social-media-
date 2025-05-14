import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from 'react-hot-toast';
import SideBar from "./Component/SideBar";
import Dashboard from "./Component/Dashboard";
import TextAnalysis from "./Component/TextAnalysis";
// import CommentAnalysis from "./Component/CommentAnalysis";
// import CaptionAnalysis from "./Component/CaptionAnalysis";
import PostModeration from "./Component/PostModeration";
import UserManagement from "./Component/UserManagement";

function App() {
  return (
    <Router>
      <div className="flex h-screen bg-gray-100">
        <SideBar />
        <div className="flex-1 overflow-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/text-analysis" element={<TextAnalysis />} />
            {/* <Route path="/comment-analysis" element={<CommentAnalysis />} /> */}
            {/* <Route path="/caption-analysis" element={<CaptionAnalysis />} /> */}
            <Route path="/post-moderation" element={<PostModeration />} />
            <Route path="/user-management" element={<UserManagement />} />
          </Routes>
        </div>
        <Toaster position="top-right" />
      </div>
    </Router>
  );
}

export default App;
