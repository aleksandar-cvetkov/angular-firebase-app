export interface UserProfile {
    uid: string;
    firstName?: string;
    lastName?: string;
    displayName?: string;
    email: string;
    photoUrl?: string;
    location?: string;
    profession?: string;
    bio?: string;
    hobbies?: string[];
    createdAt: any; // firebase.firestore.FieldValue или Date
}
