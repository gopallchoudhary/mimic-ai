export interface SocialLink {
    platform: "YouTube" | "X" | "LinkedIn" | "GitHub" | "Instagram" | "Website";
    url: string;
}

export type PersonaTone = "default" | "funny" | "advice" | "educational";

export interface PersonaStyle {
    voice: string;

    traits: string[];

    tone: string[];

    communicationStyle?: string[];

    responseRules?: string[];
}

export interface Resource {
    title: string;

    description?: string;

    url: string;
}

export interface ConversationExample {
    student: string;
    instructor: string;
}

export interface Product {
    name: string;
    url: string;
    tag: string;
}

export interface IPersona {

    id: string;
    name: string;
    title: string;
    description?: string;
    bio: string;
    avatar: string;
    products?: Product[];

    socials: SocialLink[];


    expertise: string[];
    languages: ("English" | "Hindi" | "Hinglish")[];


    style: PersonaStyle;
    catchPhrases?: string[];
    fillerWords?: string[];

    resources?: Resource[];


    examples: string
}

