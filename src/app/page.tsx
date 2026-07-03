import { personas } from "@/data/personas";
import { PersonaCard } from "@/components/PersonaCard";

export default function Home() {
	return (
		<div className="min-h-screen bg-background p-8">
			<div className="max-w-6xl mx-auto space-y-8">
				<div className="text-center space-y-4">
					<h1 className="text-4xl font-bold tracking-tight">Mimic AI</h1>
					<p className="text-xl text-muted-foreground">
						Choose who you want to chat with
					</p>
				</div>
				
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
					{personas.map((persona) => (
						<PersonaCard key={persona.id} persona={persona} />
					))}
				</div>
			</div>
		</div>
	);
}
