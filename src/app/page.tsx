import Link from "next/link";
import { MessageSquare, Zap, Smile, BookOpen, ChevronRight } from "lucide-react";

export default function Home() {
    return (
        <div className="relative min-h-[calc(100vh-4rem)] w-full overflow-hidden bg-background py-16 px-6 flex flex-col justify-center items-center">
            {/* Sexy Blue Background Gradient & Rings */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-background to-cyan-500/5 dark:from-blue-950/20 dark:via-background dark:to-cyan-950/10 pointer-events-none" />
            
            {/* Faint Concentric Circles (WOW design factor) */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full border border-blue-500/[0.02] dark:border-blue-400/[0.01] pointer-events-none animate-[spin_120s_linear_infinite]" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full border border-dashed border-blue-500/[0.03] dark:border-blue-400/[0.02] pointer-events-none animate-[spin_80s_linear_infinite]" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full border border-blue-500/[0.04] dark:border-blue-400/[0.03] pointer-events-none" />
            
            {/* Radial glow in the center */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/5 dark:bg-blue-400/5 blur-[100px] rounded-full pointer-events-none" />
            
            {/* Grid Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

            <div className="relative z-10 max-w-4xl mx-auto text-center space-y-12">
                {/* Brand Announcement Badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/20 bg-blue-500/5 dark:bg-blue-400/5 backdrop-blur-md text-[11px] font-semibold text-blue-600 dark:text-blue-400 animate-[bounce_2s_infinite,fadeIn_0.6s_ease-out] select-none">
                    <Zap className="h-3 w-3" />
                    Interactive AI Personas
                </div>

                {/* Hero Headings */}
                <div className="space-y-4 max-w-3xl mx-auto animate-slide-up">
                    <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight select-none">
                        Chat with the Digital Twins of
                        <span className="block mt-2 bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-500 bg-clip-text text-transparent dark:from-blue-400 dark:via-indigo-300 dark:to-cyan-300">
                            Your Favorite Tech Minds
                        </span>
                    </h1>
                    <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                        Mimic AI combines specialized training datasets with custom system instructions to capture the unique speech patterns, experiences, and personalities of well-known coding mentors.
                    </p>
                </div>

                {/* Glassmorphic Feature Dashboard Card */}
                <div 
                    className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left max-w-3xl mx-auto animate-slide-up"
                    style={{ animationDelay: "150ms" }}
                >
                    <div className="p-5 rounded-2xl border border-white/20 dark:border-white/5 bg-white/30 dark:bg-white/[0.01] backdrop-blur-md shadow-sm hover:bg-white/40 dark:hover:bg-white/[0.02] transition-colors duration-300">
                        <div className="h-8 w-8 rounded-lg bg-blue-500/10 dark:bg-blue-400/5 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-3">
                            <MessageSquare className="h-4 w-4" />
                        </div>
                        <h3 className="font-semibold text-sm mb-1">Authentic Slang & Vibe</h3>
                        <p className="text-xs text-muted-foreground/90 leading-relaxed">
                            Relatable vocabulary, catchphrases, and humor tailored to matches their real voice.
                        </p>
                    </div>

                    <div className="p-5 rounded-2xl border border-white/20 dark:border-white/5 bg-white/30 dark:bg-white/[0.01] backdrop-blur-md shadow-sm hover:bg-white/40 dark:hover:bg-white/[0.02] transition-colors duration-300">
                        <div className="h-8 w-8 rounded-lg bg-indigo-500/10 dark:bg-indigo-400/5 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-3">
                            <Smile className="h-4 w-4" />
                        </div>
                        <h3 className="font-semibold text-sm mb-1">Dynamic Chat Tones</h3>
                        <p className="text-xs text-muted-foreground/90 leading-relaxed">
                            Need advice, education, or a laugh? Toggle their tone settings instantly to match your mood.
                        </p>
                    </div>

                    <div className="p-5 rounded-2xl border border-white/20 dark:border-white/5 bg-white/30 dark:bg-white/[0.01] backdrop-blur-md shadow-sm hover:bg-white/40 dark:hover:bg-white/[0.02] transition-colors duration-300">
                        <div className="h-8 w-8 rounded-lg bg-cyan-500/10 dark:bg-cyan-400/5 flex items-center justify-center text-cyan-600 dark:text-cyan-400 mb-3">
                            <BookOpen className="h-4 w-4" />
                        </div>
                        <h3 className="font-semibold text-sm mb-1">Technical Guidance</h3>
                        <p className="text-xs text-muted-foreground/90 leading-relaxed">
                            Ask about their courses, development stack, or career pathways for custom tailored guidance.
                        </p>
                    </div>
                </div>

                {/* Call to Action Button */}
                <div 
                    className="flex justify-center pt-4 animate-slide-up"
                    style={{ animationDelay: "300ms" }}
                >
                    <Link href="/chat">
                        <button className="group relative bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-semibold py-3 px-8 rounded-full shadow-[0_8px_20px_-6px_rgba(0,123,255,0.6)] hover:shadow-[0_12px_24px_-4px_rgba(0,123,255,0.8)] transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-2 cursor-pointer">
                            Start Chatting
                            <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
