'use client'

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

const steps = [
  { num: 1, text: "Create your first test", active: true },
  { num: 2, text: "Add questions or upload document" },
  { num: 3, text: "Configure test settings" },
  { num: 4, text: "Share test ID with participants" }
]

export default function GettingStarted() {
  return (
    <Card variant="elevated">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">Getting Started</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {steps.map(({ num, text, active }) => (
          <div key={num} className={`flex items-center gap-3 text-sm ${active ? "" : "text-muted-foreground"}`}>
            <div className={`w-6 h-6 rounded-full ${active ? "bg-blue-400" : "bg-muted"} flex items-center justify-center`}>
              <span className={`text-xs ${active ? "text-white" : ""}`}>{num}</span>
            </div>
            <span>{text}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
