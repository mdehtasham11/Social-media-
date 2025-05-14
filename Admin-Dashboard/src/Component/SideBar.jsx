import { NavLink } from "react-router-dom";

const Sidebar = () => {
  const menuItems = [
    { path: "/", label: "Dashboard", icon: "📊" },
    { path: "/text-analysis", label: "Text Analysis", icon: "📝" },
    { path: "/comment-analysis", label: "Comment Analysis", icon: "💬" },
    { path: "/caption-analysis", label: "Caption Analysis", icon: "🖼️" },
  ];

  return (
    <div className="w-64 bg-white shadow-lg">
      <div className="p-4">
        <h1 className="text-2xl font-bold text-gray-800">Admin Panel</h1>
      </div>
      <nav className="mt-4">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `block px-4 py-2 ${
              isActive
                ? "bg-blue-50 text-blue-600 border-r-4 border-blue-600"
                : "text-gray-600 hover:bg-gray-50"
            }`
          }
        >
          Dashboard
        </NavLink>
        <NavLink
          to="/post-moderation"
          className={({ isActive }) =>
            `block px-4 py-2 ${
              isActive
                ? "bg-blue-50 text-blue-600 border-r-4 border-blue-600"
                : "text-gray-600 hover:bg-gray-50"
            }`
          }
        >
          Post Moderation
        </NavLink>
        <NavLink
          to="/text-analysis"
          className={({ isActive }) =>
            `block px-4 py-2 ${
              isActive
                ? "bg-blue-50 text-blue-600 border-r-4 border-blue-600"
                : "text-gray-600 hover:bg-gray-50"
            }`
          }
        >
          Text Analysis
        </NavLink>
        {/* <NavLink
          to="/comment-analysis"
          className={({ isActive }) =>
            `block px-4 py-2 ${isActive
              ? "bg-blue-50 text-blue-600 border-r-4 border-blue-600"
              : "text-gray-600 hover:bg-gray-50"
            }`
          }
        >
          Comment Analysis
        </NavLink> */}
        <NavLink
          to="/caption-analysis"
          className={({ isActive }) =>
            `block px-4 py-2 ${
              isActive
                ? "bg-blue-50 text-blue-600 border-r-4 border-blue-600"
                : "text-gray-600 hover:bg-gray-50"
            }`
          }
        >
          Caption Analysis
        </NavLink>
        <NavLink
          to="/user-management"
          className={({ isActive }) =>
            `block px-4 py-2 ${
              isActive
                ? "bg-blue-50 text-blue-600 border-r-4 border-blue-600"
                : "text-gray-600 hover:bg-gray-50"
            }`
          }
        >
          User Management
        </NavLink>
      </nav>
    </div>
  );
};

export default Sidebar;
