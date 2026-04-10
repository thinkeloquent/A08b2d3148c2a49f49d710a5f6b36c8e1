import { NavLink } from "react-router-dom";
import { LayoutDashboard, Heart, Settings, Github } from "lucide-react";

const navItems = [
{ to: "/", icon: LayoutDashboard, label: "Dashboard" },
{ to: "/health", icon: Heart, label: "Health" },
{ to: "/settings", icon: Settings, label: "Settings" }];


export function Sidebar() {
  return (
    <aside className="w-56 bg-gray-900 text-white flex flex-col">
      <div className="p-4 border-b border-gray-800" data-test-id="div-e175767f">
        <div className="flex items-center gap-2">
          <Github size={20} />
          <div>
            <h1 className="text-sm font-semibold">Actions UI</h1>
            <p className="text-[10px] text-gray-400">Admin</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 p-2" data-test-id="nav-db252069">
        {navItems.map(({ to, icon: Icon, label }) =>
        <NavLink
          key={to}
          to={to}
          end={to === "/"}
          className={({ isActive }) =>
          `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
          isActive ?
          "bg-gray-800 text-white" :
          "text-gray-400 hover:text-white hover:bg-gray-800/50"}`

          }>

            <Icon size={16} />
            {label}
          </NavLink>
        )}
      </nav>
    </aside>);

}