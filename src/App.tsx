import { Navigate, Route, Routes } from "react-router-dom";
import { TestDashboard } from "./pages/dashboard/TestDashboard";
import { HomePage } from "./pages/marketing/HomePage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/app" element={<TestDashboard />} />
      <Route path="/testdashboard" element={<TestDashboard />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
