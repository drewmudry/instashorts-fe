'use client'
import { Button } from '@/components/ui/button'
import LoadingAuth from "@/components/LoadingAuth";
import { useRouter } from 'next/navigation'

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode
}) {
  const router = useRouter()

  const handleLogout = async () => {
    await fetch('http://localhost:8000/logout', {
      credentials: 'include'
    })
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow mb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold">InstaShorts Dashboard</h1>
            </div>
            <div className="flex items-center">
              <Button
                onClick={handleLogout}
                variant="outline"
                className="ml-4"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <LoadingAuth>{children}</LoadingAuth>
      </main>
    </div>
  )
}