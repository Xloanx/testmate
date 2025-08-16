import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import type { TestSettingsFormData } from '@/lib/validations'

interface TestSettingsProps {
  settings: TestSettingsFormData
  onSettingsChange: (settings: TestSettingsFormData) => void
}

export const TestSettings = ({ settings, onSettingsChange }: TestSettingsProps) => {
  const updateSetting = <K extends keyof TestSettingsFormData>(
    key: K,
    value: TestSettingsFormData[K]
  ) => {
    onSettingsChange({
      ...settings,
      [key]: value
    })
  }

  return (
    <div className="space-y-6">
      <Card variant="elevated">
        <CardHeader>
          <CardTitle>Access & Authentication</CardTitle>
          <CardDescription>
            Control who can access your test and how they authenticate
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Access Mode</Label>
            <Select 
              value={settings.authMode} 
              onValueChange={(value) => updateSetting('authMode', value as TestSettingsFormData['authMode'])}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="freeForAll">
                  Free for All - Anyone with the Test ID can take the test
                </SelectItem>
                <SelectItem value="registrationRequired">
                  Registration Required - Participants must register first
                </SelectItem>
                <SelectItem value="exclusiveParticipants">
                  Exclusive Participants - Only invited participants can take the test
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Require Authentication</Label>
              <p className="text-sm text-muted-foreground">
                Participants must sign in to take the test
              </p>
            </div>
            <Switch
              checked={settings.requireAuth}
              onCheckedChange={(checked) => updateSetting('requireAuth', checked)}
            />
          </div> */}
        </CardContent>
      </Card>

      <Card variant="elevated">
        <CardHeader>
          <CardTitle>Test Behavior</CardTitle>
          <CardDescription>
            Configure how the test behaves for participants
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Show Results</Label>
            <Select 
              value={settings.showResults} 
              onValueChange={(value) => updateSetting('showResults', value as TestSettingsFormData['showResults'])}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="immediate">
                  Immediate - Show results right after test completion
                </SelectItem>
                <SelectItem value="adminOnly">
                  Admin Only - Only test creator can see results
                </SelectItem>
                <SelectItem value="both">
                  Both - Participants and admin can see results
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Allow Retakes</Label>
              <p className="text-sm text-muted-foreground">
                Let participants take the test multiple times
              </p>
            </div>
            <Switch
              checked={settings.allowRetakes}
              onCheckedChange={(checked) => updateSetting('allowRetakes', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Shuffle Questions</Label>
              <p className="text-sm text-muted-foreground">
                Randomize question order for each participant
              </p>
            </div>
            <Switch
              checked={settings.shuffleQuestions}
              onCheckedChange={(checked) => updateSetting('shuffleQuestions', checked)}
            />
          </div>
        </CardContent>
      </Card>

      <Card variant="elevated">
        <CardHeader>
          <CardTitle>Time Management</CardTitle>
          <CardDescription>
            Set time limits for the entire test
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Test Time Limit (minutes, optional)</Label>
            <Input
              type="number"
              min="1"
              placeholder="No limit"
              value={settings.timeLimit || ''}
              onChange={(e) => updateSetting('timeLimit', e.target.value ? parseInt(e.target.value) : undefined)}
            />
            <p className="text-sm text-muted-foreground">
              Leave empty for no time limit. Individual questions can have their own time limits.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}