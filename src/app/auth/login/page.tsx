'use client'

import { Button } from '@/components/ui/button'

export default function Login() {
  const handleGoogleLogin = () => {
    // window.location.href = 'http://localhost:8000/auth/login/google'
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/login/google`
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in
          </h2>
        </div>
        <div>
          <Button
            onClick={handleGoogleLogin}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Sign in with Google
          </Button>
        </div>
      </div>
    </div>
  )
}