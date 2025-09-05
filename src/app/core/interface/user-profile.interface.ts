export interface UserProfile {
    uid: string;
    firstName?: string | null;
    lastName?: string | null;
    displayName?: string;
    email: string;
    photoUrl?: string | null;
    location?: string | null;
    profession?: string | null;
    bio?: string;
    hobbies?: string[] | null;
    createdAt: any; // firebase.firestore.FieldValue или Date
}
