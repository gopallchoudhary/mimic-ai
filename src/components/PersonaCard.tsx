import Link from "next/link";
import { IPersona } from "@/data/types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface PersonaCardProps {
    persona: IPersona;
}

export function PersonaCard({ persona }: PersonaCardProps) {
    return (
        <Link href={`/chat/${persona.id}`}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <Avatar className="h-16 w-16">
                            <AvatarImage src={persona.avatar} alt={persona.name} />
                            <AvatarFallback>{persona.name.substring(0, 2)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <CardTitle>{persona.name}</CardTitle>
                            <CardDescription>{persona.title}</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        <p className="text-sm text-muted-foreground line-clamp-3">
                            {persona.bio.substring(0, 150)}...
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {persona.expertise.slice(0, 4).map((skill) => (
                                <Badge key={skill} variant="secondary">
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
