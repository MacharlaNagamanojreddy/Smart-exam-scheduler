import { Link } from "react-router-dom";

export default function Sidebar() {
  return (
    <div className="w-64 bg-white shadow-lg h-screen p-5 flex flex-col gap-4">
      <Link className="text-lg font-medium" to="/">Dashboard</Link>
      <Link className="text-lg font-medium" to="/students">Students</Link>
      <Link className="text-lg font-medium" to="/subjects">Subjects</Link>
      <Link className="text-lg font-medium" to="/halls">Halls</Link>
      <Link className="text-lg font-medium" to="/generate">Generate</Link>
      <Link className="text-lg font-medium" to="/timetable">Timetable</Link>
    </div>
  );
}
