import { updateTaskSettings as updateTaskSettingsAction } from "@/app/(dashboard)/tasks/actions/task-settings-actions"

export interface TaskSettings {
  id?: string
  user_id: string
  show_completed: boolean
  created_at?: string
  updated_at?: string
}

export async function updateTaskSettings(settings: Partial<TaskSettings>) {
  return await updateTaskSettingsAction(settings)
}
