import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import AdminDashboard from './pages/admin/AdminDashboard'
import EmployeePanel from './pages/employee/EmployeePanel'
import { useAuth } from './context/AuthContext'

// Protected Route Component
const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, role, loading } = useAuth()

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">جاري التحميل...</div>
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (requiredRole && role !== requiredRole) {
    return <Navigate to="/" replace />
  }

  return children
}

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" reverseOrder={false} />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Admin Routes */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Employee Routes */}
        <Route
          path="/employee/*"
          element={
            <ProtectedRoute requiredRole="employee">
              <EmployeePanel />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App
