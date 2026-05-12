/**
 * TODO: Remove this file once proper Clerk credentials are configured.
 * 
 * This is a temporary development helper that validates and fixes Clerk environment
 * variables to prevent atob InvalidCharacterError during server-side rendering.
 * 
 * Issue: Clerk's isomorphicAtob function fails when the publishable key suffix
 *        is not a valid base64 string (e.g., "pk_test_dummy" → atob("dummy") fails).
 * 
 * Solution: Ensure NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY always contains a valid base64 suffix.
 */

function isBase64(str: string): boolean {
  try {
    return Buffer.from(str, 'base64').toString('base64') === str;
  } catch {
    return false;
  }
}

export function validateClerkEnv(): void {
  if (typeof window !== 'undefined') {
    // Client-side: keys are already injected, no need to validate
    return;
  }

  // Server-side validation
  const pubKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  
  if (pubKey) {
    // Extract the suffix after "pk_test_" or "pk_live_"
    const match = pubKey.match(/^pk_(test|live)_(.+)$/);
    if (match) {
      const suffix = match[2];
      if (!isBase64(suffix)) {
        console.warn(
          '[Clerk] Invalid base64 in publishable key suffix. ' +
          'This will cause an atob error during SSR. ' +
          'Using development test key as fallback.'
        );
        // Override with a valid test key
        process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY =
          'pk_test_Y2ktYnVpbGQuY2xlcmsuYWNjb3VudHMuZGV2JA==';
      }
    }
  } else {
    console.warn('[Clerk] NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY not set. Using development test key.');
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY =
      'pk_test_Y2ktYnVpbGQuY2xlcmsuYWNjb3VudHMuZGV2JA==';
  }
}

// Call this as early as possible
if (typeof window === 'undefined') {
  validateClerkEnv();
}
