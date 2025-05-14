import { Route, Routes } from "react-router-dom";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Protected from "./components/ProtectedRoute";
import Create from "./pages/Create";
import Explore from "./pages/Explore";
import Notification from "./pages/Notification";
import Profile from "./pages/Profile";
import AddPeople from "./pages/AddPeople";
import SinglePost from "./pages/SinglePost";


const App = () => {
  return (
    <Routes>
      <Route
        path="/login"
        element={<Protected element={<Register />} screen="login" />}
      />
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
      
    </Routes>
  );
};

export default App;
