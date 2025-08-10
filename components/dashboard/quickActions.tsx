'use client'

import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Plus, FileText, Users, BarChart3 } from "lucide-react"
import { useRouter } from "next/navigation"

const actions = [
  { icon: <Plus className="w-5 h-5 text-white" />, title: "New Test", desc: "Create assessment", link: "/test-admin/tests/create" },
  { icon: <FileText className="w-5 h-5 text-white" />, title: "My Tests", desc: "Manage tests", link: "/test-admin/tests" },
  { icon: <Users className="w-5 h-5 text-white" />, title: "Participants", desc: "Manage users", link: "/test-admin/participants" },
  { icon: <BarChart3 className="w-5 h-5 text-white" />, title: "Analytics", desc: "View insights", link: "/test-admin/analytics" }
]

export default function QuickActions() {
  const router = useRouter()
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {actions.map((a, idx) => (
        <Card key={idx} variant="feature" className="cursor-pointer bg-gradient-subtle hover:scale-105 hover:shadow-lg border-none"
          onClick={() => router.push(a.link)}>
          <CardHeader className="pb-4 flex gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-400 flex items-center justify-center">
              {a.icon}
            </div>
            <div>
              <CardTitle className="text-lg">{a.title}</CardTitle>
              <CardDescription className="text-sm">{a.desc}</CardDescription>
            </div>
          </CardHeader>
        </Card>
      ))}
    </div>
  )
}
