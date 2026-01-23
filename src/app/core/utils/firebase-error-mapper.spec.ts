import { getFirebaseErrorMessage } from './firebase-error-mapper';

describe('FirebaseErrorMapper', () => {
    it('треба да врати соодветна порака за невалидна лозинка', () => {
        const error = { code: 'auth/wrong-password' };
        const result = getFirebaseErrorMessage(error);
        expect(result).toBe('Invalid email or password.');
    });

    it('треба да врати генеричка порака за непознат код', () => {
        const error = null;
        const result = getFirebaseErrorMessage(error);
        expect(result).toBe('An unknown error occurred.');
    });
});