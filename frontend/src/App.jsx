import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";

import Dashboard from "./pages/Dashboard";
import AddStudents from "./pages/AddStudents";
import AddSubjects from "./pages/AddSubjects";
import AddHalls from "./pages/AddHalls";
import GenerateSchedule from "./pages/GenerateSchedule";
import Timetable from "./pages/Timetable";

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="w-full">
          <Navbar />
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/students" element={<AddStudents />} />
            <Route path="/subjects" element={<AddSubjects />} />
            <Route path="/halls" element={<AddHalls />} />
            <Route path="/generate" element={<GenerateSchedule />} />
            <Route path="/timetable" element={<Timetable />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}
