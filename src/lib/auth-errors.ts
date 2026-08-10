interface AuthErrorLike {
  message?: string;
  status?: number;
}

/**
 * Better Auth gives a useful message for real WebAuthn outcomes (cancelled
 * ceremony, already-registered authenticator), but a failed request can arrive
 * with an empty message. Don't guess a cause in that case: an earlier fallback
 * here reported "cancelled" for what was actually a server 500, which pointed
 * debugging in the wrong direction.
 */
export function describeAuthError(error: AuthErrorLike): string {
  if (error.message) return error.message;

  if (error.status && error.status >= 500) {
    return 'The server rejected the request. Check the server logs for details.';
  }

  return 'Something went wrong. Please try again.';
}
