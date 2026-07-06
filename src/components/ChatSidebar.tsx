"use client";

import Link from "next/link";
import { personas } from "@/data/personas";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UserButton } from "@clerk/nextjs";
import { PlusCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ThemeToggle";
import Image from "next/image";

interface ChatSidebarProps {
	currentPersonaId: string;
	lastMessages: Record<string, string>;
	isOpen: boolean;
	onClose: () => void;
}

export function ChatSidebar({
	currentPersonaId,
	lastMessages,
	isOpen,
	onClose,
}: ChatSidebarProps) {
	return (
		<>
			{/* Mobile backdrop */}
			<div
				className={cn(
					"fixed inset-0 z-40 bg-black/50 md:hidden transition-opacity duration-300",
					isOpen
						? "opacity-100 pointer-events-auto"
						: "opacity-0 pointer-events-none",
				)}
				onClick={onClose}
			/>

			{/* Sidebar panel */}
			<aside
				className={cn(
					"fixed md:relative inset-y-0 left-0 z-50 flex h-full w-64 shrink-0 flex-col border-r border-border/40 bg-background/80 dark:bg-background/40 backdrop-blur-md",
					"transition-transform duration-300 ease-in-out md:translate-x-0",
					isOpen ? "translate-x-0" : "-translate-x-full",
				)}
			>
				{/* Top — brand + New Chat */}
				<div className="flex items-center justify-between border-b border-border/40 px-4 py-3">
					<Link
						href="/"
						onClick={onClose}
						className="flex items-center hover:opacity-90 transition-opacity"
					>
						<Image
							src="/logo.png"
							alt="Mimic AI"
							width={30}
							height={20}
							className="object-contain rounded-full"
							priority
						/>
					</Link>
					<div className="flex items-center gap-1">
						<Link href="/" onClick={onClose}>
							<Button
								variant="ghost"
								size="icon"
								className="h-8 w-8"
								title="New Chat"
							>
								<PlusCircle className="h-4 w-4" />
							</Button>
						</Link>
						<Button
							variant="ghost"
							size="icon"
							className="h-8 w-8 md:hidden"
							onClick={onClose}
						>
							<X className="h-4 w-4" />
						</Button>
					</div>
				</div>

				{/* Persona list */}
				<ScrollArea className="flex-1 py-2">
					<div className="space-y-0.5 px-2">
						{personas.map((persona) => {
							const isActive = persona.id === currentPersonaId;
							const preview = lastMessages[persona.id];
							return (
								<Link
									key={persona.id}
									href={`/chat/${persona.id}`}
									onClick={onClose}
								>
									<div
										className={cn(
											"flex items-center gap-3 rounded-lg px-3 py-2.5 cursor-pointer transition-colors",
											isActive ? "bg-primary/10" : "hover:bg-muted/60",
										)}
									>
										{/* Avatar + active dot */}
										<div className="relative shrink-0">
											<Avatar className="h-9 w-9">
												<AvatarImage src={persona.avatar} alt={persona.name} />
												<AvatarFallback className="text-xs">
													{persona.name.substring(0, 2)}
												</AvatarFallback>
											</Avatar>
											{isActive && (
												<span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-background" />
											)}
										</div>

										{/* Name + last message */}
										<div className="min-w-0 flex-1">
											<p
												className={cn(
													"truncate text-sm font-medium leading-tight",
													isActive ? "text-primary" : "text-foreground",
												)}
											>
												{persona.name}
											</p>
											<p className="mt-0.5 truncate text-xs text-muted-foreground">
												{preview ?? "Start a conversation..."}
											</p>
										</div>
									</div>
								</Link>
							);
						})}
					</div>
				</ScrollArea>

				{/* Bottom — Clerk UserButton + ThemeToggle */}
				<div className="flex items-center justify-between border-t border-border/40 px-4 py-3 bg-muted/10 dark:bg-white/[0.01]">
					<div className="flex items-center gap-3 min-w-0">
						<UserButton />
						<span className="truncate text-sm text-muted-foreground font-medium">
							My Account
						</span>
					</div>
					<div className="shrink-0">
						<ThemeToggle />
					</div>
				</div>
			</aside>
		</>
	);
}
