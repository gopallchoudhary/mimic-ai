import { personas } from "@/data/personas";
import { PersonaCard } from "@/components/PersonaCard";

export default function ChatSelectionPage() {
    return (
        <div className="relative min-h-[calc(100vh-4rem)] w-full overflow-hidden bg-background py-12 px-6 flex flex-col justify-center">
            {/* Sexy Blue Background Gradients */}
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 via-background to-cyan-500/5 dark:from-blue-950/20 dark:via-background dark:to-cyan-950/10 pointer-events-none" />
            
            {/* Concentric radial rings for the wow factor */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full border border-blue-500/[0.03] dark:border-blue-400/[0.02] pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-blue-500/[0.04] dark:border-blue-400/[0.03] pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full border border-blue-500/[0.05] dark:border-blue-400/[0.04] pointer-events-none" />
            
            {/* Soft radial glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/5 dark:bg-blue-400/5 blur-[80px] rounded-full pointer-events-none" />
            
            {/* Grid Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none dark:opacity-80" />

            <div className="relative z-10 max-w-5xl mx-auto w-full space-y-10">
                {/* Heading Area */}
                <div className="text-center space-y-4 max-w-2xl mx-auto">
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-500 bg-clip-text text-transparent dark:from-blue-400 dark:via-indigo-300 dark:to-cyan-300 drop-shadow-sm">
                        Select a Persona
                    </h1>
                    <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                        Start a customized session. Each AI matches the unique tone, background, and expert knowledge of its real-world developer counterpart.
                    </p>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {personas.map((persona, index) => (
                        <div 
                            key={persona.id}
                            className="animate-fade-in"
                            style={{ animationDelay: `${index * 150}ms` }}
                        >
                            <PersonaCard persona={persona} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
