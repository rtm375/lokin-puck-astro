/**
 * Error handling for the class system
 * Provides error codes, factory functions, and type guards
 */

// Error codes enum
export enum ErrorCode {
  CLASS_NOT_FOUND = 'CLASS_NOT_FOUND',
  VARIABLE_NOT_FOUND = 'VARIABLE_NOT_FOUND',
  INVALID_CLASS_NAME = 'INVALID_CLASS_NAME',
  DUPLICATE_CLASS_NAME = 'DUPLICATE_CLASS_NAME',
  SYSTEM_CLASS_MODIFICATION = 'SYSTEM_CLASS_MODIFICATION',
  INVALID_PROPERTY_VALUE = 'INVALID_PROPERTY_VALUE',
  MERGE_ERROR = 'MERGE_ERROR',
  STORAGE_ERROR = 'STORAGE_ERROR',
}

// Extended error interface
export interface ClassSystemError extends Error {
  code: ErrorCode;
  context?: Record<string, any>;
}

/**
 * Factory function to create class system errors
 * @param message - Human-readable error message
 * @param code - Error code from ErrorCode enum
 * @param context - Optional context data for debugging
 * @returns ClassSystemError instance
 */
export function createClassSystemError(
  message: string,
  code: ErrorCode,
  context?: Record<string, any>
): ClassSystemError {
  const error = new Error(message) as ClassSystemError;
  error.name = 'ClassSystemError';
  error.code = code;
  error.context = context;
  return error;
}

/**
 * Type guard to check if an error is a ClassSystemError
 * @param error - Error to check
 * @returns True if error is a ClassSystemError
 */
export function isClassSystemError(error: unknown): error is ClassSystemError {
  return (
    error instanceof Error &&
    error.name === 'ClassSystemError' &&
    'code' in error &&
    typeof (error as any).code === 'string'
  );
}

/**
 * Helper to log errors with context
 * @param error - Error to log
 * @param additionalContext - Additional context to include
 */
export function logClassSystemError(
  error: ClassSystemError,
  additionalContext?: Record<string, any>
): void {
  console.error('[ClassSystem Error]', {
    message: error.message,
    code: error.code,
    context: { ...error.context, ...additionalContext },
    stack: error.stack,
  });
}
