import { NavLink } from "react-router-dom";

export default function Sidebar() {
  return (
    <div className="w-64 h-screen p-5 flex flex-col gap-4 border-r border-blue-100 bg-white/85 backdrop-blur-md">
      <NavLink className="outline-pill px-4 py-3 text-2xl font-semibold text-slate-900 text-center" to="/">
        Scheduler
      </NavLink>
      <nav className="flex flex-col gap-1.5 mt-2">
        <NavLink className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`} to="/">
          Dashboard
        </NavLink>
        <NavLink className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`} to="/students">
          Students
        </NavLink>
        <NavLink className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`} to="/subjects">
          Subjects
        </NavLink>
        <NavLink className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`} to="/halls">
          Halls
        </NavLink>
        <NavLink className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`} to="/generate">
          Generate
        </NavLink>
        <NavLink className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`} to="/timetable">
          Timetable
        </NavLink>
      </nav>
    </div>
  );
}
