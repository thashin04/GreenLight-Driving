// import { useState } from 'react'
import { Routes, Route } from "react-router-dom"
import Landing from "./pages/landing"

function App() {

  return (
    <Routes>
      {/* We can add more routes as we go */}
      <Route path="/" element={<Landing />} />
    </Routes>
  )
}

export default App