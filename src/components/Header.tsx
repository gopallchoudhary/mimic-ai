"use client";

import { usePathname } from "next/navigation";
import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { ThemeToggle } from "@/components/ThemeToggle";
import Image from "next/image";
import Link from "next/link";

export function Header() {
	const pathname = usePathname();

	const isChatRoom = pathname.startsWith("/chat/");
	const isAuth =
		pathname.startsWith("/sign-in") || pathname.startsWith("/sign-up");

	// Hide header in chatroom and auth pages
	if (isChatRoom || isAuth) {
		return null;
	}

	return (
		<header className="sticky top-0 z-50 flex items-center justify-between px-6 h-16 shrink-0 bg-background/50 border-b border-border/40 backdrop-blur-md select-none transition-all duration-300">
			{/* Logo */}
			<Link
				href="/"
				className="flex items-center hover:opacity-90 transition-opacity"
			>
				<Image
					src="/logo.png"
					alt="Mimic AI"
					width={45}
					height={20}
					className="object-contain rounded-full"
					priority
				/>
			</Link>

			{/* Controls */}
			<div className="flex items-center gap-4">
				<ThemeToggle />
				<Show when="signed-out">
					<SignInButton
						mode="modal"
						forceRedirectUrl="/chat"
						fallbackRedirectUrl="/chat"
					>
						<button className="text-sm font-medium hover:text-primary transition-colors cursor-pointer">
							Sign In
						</button>
					</SignInButton>
					<SignUpButton
						mode="modal"
						forceRedirectUrl="/chat"
						fallbackRedirectUrl="/chat"
					>
						<button className="bg-primary hover:bg-primary/95 text-primary-foreground rounded-full font-medium text-sm h-9 px-4 cursor-pointer shadow-sm hover:shadow transition-all duration-200 active:scale-95">
							Sign Up
						</button>
					</SignUpButton>
				</Show>
				<Show when="signed-in">
					<UserButton />
				</Show>
			</div>
		</header>
	);
}
