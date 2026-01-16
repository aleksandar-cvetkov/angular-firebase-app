/**
 * Maps technical Firebase error codes to user-friendly messages.
 * @param error The raw error object from Firebase
 * @returns A clean string message in English (or your language)
 */
export function getFirebaseErrorMessage(error: any): string {
  if (!error) return 'An unknown error occurred.';

  // If the error has a 'code' property, it's likely from Firebase
  if (error.code) {
    switch (error.code) {
      // --- Authentication Errors ---
      case 'auth/email-already-in-use':
        return 'This email is already registered. Please login instead.';
      
      case 'auth/invalid-email':
        return 'The email address is not valid.';
      
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        // SECURITY NOTE: Never tell the user exactly which one failed.
        return 'Invalid email or password.';
      
      case 'auth/weak-password':
        return 'Password should be at least 6 characters.';
      
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later.';
        
      case 'auth/network-request-failed':
        return 'Network error. Please check your internet connection.';

      // --- Firestore / Permission Errors ---
      case 'permission-denied':
        return 'You do not have permission to perform this action.';
        
      case 'unavailable':
        return ' The service is temporarily unavailable. Please try again.';
        
      default:
        // Return the raw code if we haven't mapped it yet (good for debugging)
        return `Error: ${error.code}`;
    }
  }

  // Fallback for non-Firebase errors (standard JS errors)
  return error.message || 'An unexpected error occurred.';
}