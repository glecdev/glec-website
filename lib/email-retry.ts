/**
 * Email Retry Logic Utility
 *
 * Purpose: Resilient email sending with exponential backoff
 * Based on: Resend API best practices
 *
 * Features:
 * - Exponential backoff (1s → 2s → 4s)
 * - Max 3 retry attempts
 * - Detailed error logging
 * - Non-blocking (doesn't throw errors)
 */

interface RetryOptions {
  maxRetries?: number;
  initialDelay?: number; // milliseconds
  maxDelay?: number; // milliseconds
}

interface EmailResult {
  success: boolean;
  emailId?: string;
  attempt: number;
  error?: string;
}

/**
 * Sleep utility for retry delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Send email with automatic retry logic
 *
 * @param sendFn - Async function that sends the email
 * @param options - Retry configuration
 * @returns EmailResult with success status and details
 */
export async function sendEmailWithRetry(
  sendFn: () => Promise<{ data?: { id?: string }; error?: any }>,
  options: RetryOptions = {}
): Promise<EmailResult> {
  const {
    maxRetries = 3,
    initialDelay = 1000, // 1 second
    maxDelay = 8000, // 8 seconds
  } = options;

  let lastError: any = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`[EmailRetry] Attempt ${attempt}/${maxRetries}`);

      const result = await sendFn();

      if (result.error) {
        lastError = result.error;

        // Log the error
        console.error(
          `[EmailRetry] Attempt ${attempt} failed:`,
          result.error
        );

        // Don't retry on certain errors (e.g., invalid email, rate limit)
        if (isNonRetryableError(result.error)) {
          console.error(
            `[EmailRetry] Non-retryable error detected, aborting retries`
          );
          return {
            success: false,
            attempt,
            error: formatError(result.error),
          };
        }

        // Calculate exponential backoff delay
        if (attempt < maxRetries) {
          const delay = Math.min(initialDelay * Math.pow(2, attempt - 1), maxDelay);
          console.log(`[EmailRetry] Waiting ${delay}ms before retry...`);
          await sleep(delay);
          continue;
        }
      } else {
        // Success!
        console.log(
          `[EmailRetry] Email sent successfully on attempt ${attempt}`,
          result.data?.id ? `(ID: ${result.data.id})` : ''
        );

        return {
          success: true,
          emailId: result.data?.id,
          attempt,
        };
      }
    } catch (exception: any) {
      lastError = exception;
      console.error(
        `[EmailRetry] Attempt ${attempt} threw exception:`,
        exception.message
      );

      if (attempt < maxRetries) {
        const delay = Math.min(initialDelay * Math.pow(2, attempt - 1), maxDelay);
        await sleep(delay);
        continue;
      }
    }
  }

  // All retries exhausted
  console.error(
    `[EmailRetry] All ${maxRetries} attempts failed. Last error:`,
    lastError
  );

  return {
    success: false,
    attempt: maxRetries,
    error: formatError(lastError),
  };
}

/**
 * Determine if error is non-retryable
 */
function isNonRetryableError(error: any): boolean {
  if (!error) return false;

  const errorMessage = error.message || error.toString();

  // Don't retry on validation errors
  if (
    errorMessage.includes('Invalid email') ||
    errorMessage.includes('validation') ||
    errorMessage.includes('invalid_email')
  ) {
    return true;
  }

  // Don't retry on authentication errors
  if (
    errorMessage.includes('unauthorized') ||
    errorMessage.includes('forbidden') ||
    errorMessage.includes('invalid_api_key')
  ) {
    return true;
  }

  // Don't retry on rate limit errors (should wait longer)
  if (
    errorMessage.includes('rate_limit') ||
    errorMessage.includes('too many requests')
  ) {
    return true;
  }

  return false;
}

/**
 * Format error for logging
 */
function formatError(error: any): string {
  if (!error) return 'Unknown error';

  if (typeof error === 'string') return error;

  if (error.message) return error.message;

  if (error.error) return JSON.stringify(error.error);

  return JSON.stringify(error);
}
