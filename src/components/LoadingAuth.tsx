'use client'
import { useUser } from "@/context/UserContext"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function LoadingAuth({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  const { user, isLoading } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/login')
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!user) {
    return null
  }

  return <>{children}</>
}