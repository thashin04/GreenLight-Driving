import { Routes, Route } from "react-router-dom"
import DashboardPage from "./pages/dashboard"
import IncidentsPage from "./pages/incidents"
import QuizzesPage from "./pages/quizzes"
import LoginPage from "./pages/login"
import SignupPage from "./pages/signup"

function App() {

  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/incidents" element={<IncidentsPage />} />
      <Route path="/quizzes" element={<QuizzesPage />} />
    </Routes>
  )
}

export default App