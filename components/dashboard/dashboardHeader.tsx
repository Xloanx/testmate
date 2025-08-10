'use client'

import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { SignOutButton, useUser } from "@clerk/nextjs"

export default function DashboardHeader() {
  const { user } = useUser()

  return (
    <div className="mb-8 flex justify-between items-start">
      <div>
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {user?.firstName || 'Admin'}!
        </h1>
        <p className="text-muted-foreground">
          Manage your tests, analyze results, and streamline your assessment process.
        </p>
      </div>
      <SignOutButton redirectUrl="/">
        <Button variant="outline">
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </SignOutButton>
    </div>
  )
}
