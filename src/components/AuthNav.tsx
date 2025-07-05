import React from 'react'

interface AuthNavProps {
  currentPage: 'login'
}

const AuthNav: React.FC<AuthNavProps> = ({ currentPage }) => {
  return (
    <div className="absolute top-4 left-4">
      <div className="text-gray-600 text-sm">
        SGLD Project Planning System
      </div>
    </div>
  )
}

export default AuthNav 