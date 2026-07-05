import Link from "next/link";
import { IPersona } from "@/data/types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight } from "lucide-react";

interface PersonaCardProps {
    persona: IPersona;
}

export function PersonaCard({ persona }: PersonaCardProps) {
    return (
        <Link href={`/chat/${persona.id}`} className="group block h-full">
            <Card className="relative overflow-hidden cursor-pointer h-full border border-white/20 dark:border-white/10 bg-white/40 dark:bg-white/[0.02] backdrop-blur-lg shadow-[0_8px_32px_0_rgba(31,38,135,0.04)] hover:shadow-[0_20px_40px_0_rgba(0,123,255,0.12)] hover:-translate-y-1.5 hover:bg-white/50 dark:hover:bg-white/[0.05] hover:border-blue-500/30 dark:hover:border-blue-400/20 transition-all duration-300 ease-out">
                {/* Subtle Hover Glow Effect */}
                <div className="absolute -right-20 -top-20 w-40 h-40 bg-blue-500/10 dark:bg-blue-400/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                
                <CardHeader className="relative z-10 pb-3">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <Avatar className="h-16 w-16 border-2 border-white/40 dark:border-white/10 group-hover:scale-105 transition-transform duration-300">
                                    <AvatarImage src={persona.avatar} alt={persona.name} />
                                    <AvatarFallback className="bg-muted text-foreground">{persona.name.substring(0, 2)}</AvatarFallback>
                                </Avatar>
                                <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full bg-green-500 border-2 border-background animate-pulse" />
                            </div>
                            <div className="min-w-0">
                                <CardTitle className="text-lg font-bold group-hover:text-primary transition-colors duration-200 truncate">
                                    {persona.name}
                                </CardTitle>
                                <CardDescription className="text-xs text-muted-foreground/90 font-medium truncate mt-0.5">
                                    {persona.title}
                                </CardDescription>
                            </div>
                        </div>
                        
                        {/* Go Icon */}
                        <div className="rounded-full bg-muted/60 p-1.5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 dark:bg-white/5 text-muted-foreground group-hover:text-primary">
                            <ArrowUpRight className="h-4 w-4" />
                        </div>
                    </div>
                </CardHeader>
                
                <CardContent className="relative z-10">
                    <div className="space-y-4">
                        <p className="text-sm text-muted-foreground/90 leading-relaxed line-clamp-3">
                            {persona.description.substring(0, 150)}...
                        </p>
                        <div className="flex flex-wrap gap-2 pt-1">
                            {persona.expertise.slice(0, 4).map((skill) => (
                                <Badge 
                                    key={skill} 
                                    variant="secondary" 
                                    className="bg-muted/50 dark:bg-white/5 border border-border/40 text-muted-foreground hover:bg-muted/80 text-[11px] font-semibold py-0.5 px-2 rounded-md"
                                >
                                    {skill}
                                </Badge>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}
