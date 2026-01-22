// TypeScript Interface (во апликацијата)
export interface UserProfile {
    uid: string;                    // Уникатен идентификатор (Primary Key)
    email: string;                  // Е-пошта на корисникот
    firstName?: string | null;      // Име
    lastName?: string | null;       // Презиме
    profession?: string | null;     // Професија или занимање
    bio?: string | null;            // Кратка биографија или опис
    location?: string | null;       // Локација (град, земја и сл.)
    photoUrl?: string | null;       // URL до профилна фотографија         
    createdAt: any;                 // Датум на регистрација
}
