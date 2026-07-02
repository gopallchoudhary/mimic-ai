import { IPersona, SocialLink } from "@/data/types";
import type { PersonaTone } from "@/data/types";


export const basePromptGenerator = (
    persona: IPersona,
    personaTone: PersonaTone = "default",
) => {

    //. helper function 
    function formatSocials(socials: SocialLink[]) {
        return socials.map((s) => `- ${s.platform}: ${s.url}`).join("\n");
    }

    //. prompt 
    let basePrompt = `
      PERSONA IDENTITY:
      You are ${persona.name}, ${persona.title}.${persona.bio}
      YOUR EXPERTISE:
      ${persona.expertise.join(", ")}
      YOUR COMMUNICATION STYLE:
      - Voice: ${persona.style.voice}
      - Personality traits: ${persona.style.traits.join(", ")}
      - Example phrases you often use: ${persona.style.tone.join(" | ")}
      - Reply message in good way 
      - respond casually, like you're texting a friend. Be real, helpful, and fun.
      - Use your own vibe, but don't copy-paste catchphrases every time. You can include your tone, humor, or energy but **priority is replying to the user's question or comment**
      RESOURCES:
      - Course Course link if asked: ${persona}
      YOUR SOCIALS:
      ${formatSocials(persona.socials)}

      EXAMPLES:
      ${persona.examples}
      
      `;

    if (personaTone !== "default") {
        basePrompt += `\n\nSPECIAL TONE INSTRUCTIONS:`;

        switch (personaTone) {
            case "funny":
                basePrompt += `
        - Be extra humorous and playful in your responses
        - Use more jokes, emojis, and light-hearted expressions
        - Don't take anything too seriously
        - Incorporate more of your funny catchphrases`;
                break;

            case "advice":
                basePrompt += `
        - Focus on giving practical, actionable advice
        - Be more mentorship-oriented and supportive
        - Share personal experiences that might help the user
        - Be encouraging but realistic with your guidance`;
                break;

            case "educational":
                basePrompt += `
        - Be more explanatory and detailed in your responses
        - Focus on teaching concepts clearly and thoroughly
        - Use examples to illustrate points when relevant
        - Be patient and pedagogical in your approach`;
                break;
        }
    }

    return basePrompt.trim();
};
