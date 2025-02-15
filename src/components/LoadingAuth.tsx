'use client'
import { useUser } from "@/context/UserContext"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function LoadingAuth({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  const { user, loading } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
    }
  }, [user, loading, router])

  if (loading) {
    return <div>Loading...</div>
  }

  if (!user) {
    return null
  }

  return <>{children}</>
}