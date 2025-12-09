import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { AxiosError } from 'axios'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Extracts and formats error messages from axios error responses
 * Handles Django REST Framework validation errors and other error formats
 */
export function formatErrorMessage(error: unknown): string {
  const defaultMessage = 'An error occurred. Please try again.'
  
  if (error instanceof AxiosError && error.response?.data) {
    const errorData = error.response.data
    
    // Handle Django REST Framework validation errors
    // Format: {"field_name": ["error1", "error2"]}
    if (typeof errorData === 'object' && !errorData.detail && !errorData.message) {
      const errorMessages: string[] = []
      for (const [field, messages] of Object.entries(errorData)) {
        if (Array.isArray(messages)) {
          // Convert field name from snake_case to Title Case
          const fieldName = field
            .replace(/_/g, ' ')
            .replace(/\b\w/g, (l) => l.toUpperCase())
          messages.forEach((msg: string) => {
            errorMessages.push(`${fieldName}: ${msg}`)
          })
        } else if (typeof messages === 'string') {
          errorMessages.push(messages)
        }
      }
      if (errorMessages.length > 0) {
        return errorMessages.join('. ')
      }
    }
    
    // Handle detail field errors
    if (errorData.detail) {
      return errorData.detail
    }
    
    // Handle message field errors
    if (errorData.message) {
      return errorData.message
    }
    
    // Handle string errors
    if (typeof errorData === 'string') {
      return errorData
    }
  }
  
  // Handle Error objects
  if (error instanceof Error) {
    return error.message
  }
  
  return defaultMessage
}
