import { z } from 'zod'

// Question validation schema
export const questionSchema = z.object({
  type: z.enum(['multiple-choice', 'select-all', 'free-text', 'true-false']),
  question: z.string().min(1, 'Question is required').max(500, 'Question too long'),
  options: z.array(z.string()).optional(),
  correctAnswers: z.array(z.string()).optional(),
  points: z.number().min(1, 'Points must be at least 1').max(100, 'Points cannot exceed 100'),
  timeLimit: z.number().optional(),
  visibility: z.any().optional(),
  orderIndex: z.number().min(0).optional()

})

export const questionsPayloadSchema = z.object({
  testId: z.string(),
  questions: z.array(questionSchema)
})

// Test settings validation schema
export const testSettingsSchema = z.object({
  authMode: z.enum(['freeForAll', 'registrationRequired', 'exclusiveParticipants']),
  showResults: z.enum(['immediate', 'adminOnly', 'both']),
  timeLimit: z.number().optional(),
  allowRetakes: z.boolean(),
  shuffleQuestions: z.boolean(),
  // requireAuth: z.boolean(),
})

// Test creation validation schema - questions are now optional
export const testCreationSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  description: z.string().max(1000, 'Description too long').optional(),
  passScore: z.number().min(0, 'Pass score cannot be negative').max(100, 'Pass score is rated in percentage'),
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
  settings: testSettingsSchema,
})


export const testUpdateSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  passScore: z.number().min(0, 'Pass score cannot be negative').max(100, 'Pass score is rated in percentage'),
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
  settings: testSettingsSchema,
  questions: z.array(questionSchema).optional().default([]),
})

// File upload schema for AI question generation
export const fileUploadSchema = z.object({
  file: z.instanceof(File).refine(
    (file) => file.size <= 10 * 1024 * 1024, // 10MB limit
    'File size should be less than 10MB'
  ).refine(
    (file) => ['application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.type),
    'Only PDF, TXT, DOC, and DOCX files are allowed'
  ),
  questionCount: z.number().min(1, 'Must generate at least 1 question').max(50, 'Cannot generate more than 50 questions'),
  difficulty: z.enum(['easy', 'medium', 'hard']).default('medium'),
  questionTypes: z.array(z.enum(['multiple-choice', 'select-all', 'free-text', 'true-false'])).min(1, 'Select at least one question type')
})

// Participant registration schema
export const participantRegistrationSchema = z.object({
  email: z.string().email('Invalid email address'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  testId: z.string().min(1, 'Test ID is required'),
})

// Test access schema
export const testAccessSchema = z.object({
  testId: z.string().min(1, 'Test ID is required'),
  participantId: z.string().optional(),
})

// Organization creation schema
export const organizationSchema = z.object({
  name: z.string().min(1, 'Organization name is required').max(100, 'Name too long'),
  description: z.string().max(500, 'Description too long').optional(),
  website: z.string().url('Invalid website URL').optional(),
  contactEmail: z.string().email('Invalid email address'),
})

// Bulk participant upload schema
export const bulkParticipantSchema = z.object({
  participants: z.array(z.object({
    email: z.string().email('Invalid email address'),
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    identifier: z.string().optional(),
  })).min(1, 'At least one participant is required'),
})

export type QuestionFormData = z.infer<typeof questionSchema>
export type TestSettingsFormData = z.infer<typeof testSettingsSchema>
export type TestCreationFormData = z.infer<typeof testCreationSchema> & {questions: QuestionFormData[] }
export type ParticipantRegistrationFormData = z.infer<typeof participantRegistrationSchema>
export type TestAccessFormData = z.infer<typeof testAccessSchema>
export type OrganizationFormData = z.infer<typeof organizationSchema>
export type BulkParticipantFormData = z.infer<typeof bulkParticipantSchema>
export type FileUploadFormData = z.infer<typeof fileUploadSchema>