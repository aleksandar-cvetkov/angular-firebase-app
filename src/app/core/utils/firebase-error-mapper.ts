/**
 * Maps technical Firebase error codes to user-friendly messages.
 * @param error The raw error object from Firebase
 * @returns A clean string message in English (or your language)
 */
export function getFirebaseErrorMessage(error: any): string {
  console.error('Firebase Error:', error);
  if (!error) return 'Се случи непозната грешка.';

  // If the error has a 'code' property, it's likely from Firebase
  if (error.code) {
    switch (error.code) {
      // --- Authentication Errors ---
      case 'auth/email-already-in-use':
        return 'Оваа имејл адреса е веќе регистрирана. Ве молиме најавете се.';
      
      case 'auth/invalid-email':
        return 'Имејл адресата не е валидна.';
      
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        // Безбедносна напомена: Никогаш не кажувајте му на корисникот точно кој дел не успеал.
        return 'Невалиден имејл или лозинка.';
      
      case 'auth/weak-password':
        return 'Лозинката треба да има најмалку 8 карактери.';
      
      case 'auth/too-many-requests':
        return 'Премногу неуспешни обиди. Ве молиме обидете се повторно подоцна.';
        
      case 'auth/network-request-failed':
        return 'Грешка во мрежата. Ве молиме проверете ја вашата интернет конекција.';

      case 'auth/requires-recent-login':
        return 'Ве молиме повторно најавете се за да ја извршите оваа акција.';

      // --- Firestore / Permission Errors ---
      case 'permission-denied':
        return 'Немате дозвола за извршување на оваа акција.';
        
      case 'unavailable':
        return ' Сервисот е привремено недостапен. Ве молиме обидете се повторно.';
        
      default:
        // Врати го суровиот код ако сè уште не сме го мапирале (добро за дебагирање)
        return `Error: ${error.code}`;
    }
  }

  // Fallback за не-Firebase грешки (стандардни JS грешки)
  return error.message || 'Се случи непозната грешка.';
}