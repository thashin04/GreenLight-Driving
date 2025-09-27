// import { useState } from 'react'
import { Routes, Route } from "react-router-dom"
import DashboardPage from "./pages/dashboard"
import IncidentsPage from "./pages/incidents"
import QuizzesPage from "./pages/quizzes"

function App() {

  return (
    <Routes>
      {/* We can add more routes as we go, / is supposed to be login page but we dont have that yet */}
      <Route path="/" element={<DashboardPage />} />
      <Route path="/incidents" element={<IncidentsPage />} />
      <Route path="/quizzes" element={<QuizzesPage />} />
    </Routes>
  )
}

export default App