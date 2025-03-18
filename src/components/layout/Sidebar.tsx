import React from "react";
import { NavLink } from "react-router-dom";
import {
  Home,
  Building2,
  Package,
  PlaySquare,
  Settings,
  X,
  List,
  Image,
  ClipboardList,
  Contact2Icon,
} from "lucide-react";
import { translations } from "@/lib/constants/translations";
import { useLayoutStore } from "@/stores/layoutStore";

const Sidebar: React.FC = () => {
  const { isSidebarOpen, setSidebarOpen } = useLayoutStore();

  const navItems = [
    {
      name: translations.common.dashboard,
      path: "/dashboard",
      icon: <Home size={20} />,
    },
    {
      name: translations.common.products,
      path: "/products",
      icon: <Package size={20} />,
    },
    {
      name: translations.categories.title,
      path: "/categories",
      icon: <List size={20} />,
    },
    {
      name: translations.common.playlists,
      path: "/playlists",
      icon: <PlaySquare size={20} />,
    },
    {
      name: translations.mediaLibrary.title,
      path: "/media",
      icon: <Image size={20} />,
    },
    {
      name: translations.polls.title,
      path: "/polls",
      icon: <ClipboardList size={20} />,
    },
    { name: "درباره ما", path: "/aboutus", icon: <ClipboardList size={20} /> },
    { name: "تماس با ما", path: "/contact", icon: <Contact2Icon size={20} /> },
  ];

  if (!isSidebarOpen) return null;

  return (
    <>
      {/* Backdrop for mobile */}
      <div
        className="fixed inset-0 bg-gray-600 bg-opacity-75 z-20 md:hidden"
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 right-0 w-64 bg-gray-800 text-white z-30 transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-4">
          <h2 className="text-2xl font-bold">پنل مدیریت</h2>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden text-gray-400 hover:text-white"
          >
            <X size={24} />
          </button>
        </div>

        <nav className="mt-5">
          <ul>
            {navItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center px-4 py-3 ${
                      isActive
                        ? "bg-gray-900 text-white"
                        : "text-gray-300 hover:bg-gray-700"
                    }`
                  }
                >
                  <span className="ml-3">{item.icon}</span>
                  <span>{item.name}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </>
  );
};

export default Sidebar;
