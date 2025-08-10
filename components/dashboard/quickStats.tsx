'use client'

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

export default function QuickStats({ tests }: { tests: any[] }) {
  return (
    <Card variant="elevated">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">Quick Stats</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <StatItem label="Total Tests" value={tests.length} />
        <StatItem label="Published Tests" value={tests.filter(t => t.status === 'published').length} />
        <StatItem label="Draft Tests" value={tests.filter(t => t.status === 'draft').length} />
        <StatItem label="Archived Tests" value={tests.filter(t => t.status === 'archived').length} />
        <StatItem label="Total Questions" value={tests.reduce((sum, t) => sum + (t.question_count || 0), 0)} />
      </CardContent>
    </Card>
  )
}

function StatItem({ label, value }: { label: string, value: number }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  )
}
