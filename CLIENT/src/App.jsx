import React from 'react'
import "./App.css"
import { Route, BrowserRouter, Routes } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'

import LandingPage from './LandingPage'
import AuthPage from './AuthPage'
import Dashboard from './Dashboard'






const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/dashboard" element={<Dashboard />} />



      </Routes>
      <ToastContainer position="top-right" autoClose={3000} />

    </BrowserRouter>
  )
}

export default App
