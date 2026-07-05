"use client";

import { usePathname } from "next/navigation";
import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";

export function Header() {
    const pathname = usePathname();

    // Hide header in chatroom and auth pages
    if (
        pathname.startsWith("/chat") ||
        pathname.startsWith("/sign-in") ||
        pathname.startsWith("/sign-up")
    ) {
        return null;
    }

    return (
        <header className="flex justify-end items-center p-4 gap-4 h-16 shrink-0 bg-background border-b">
            <Show when="signed-out">
                <SignInButton />
                <SignUpButton>
                    <button className="bg-[#6c47ff] text-white rounded-full font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 cursor-pointer">
                        Sign Up
                    </button>
                </SignUpButton>
            </Show>
            <Show when="signed-in">
                <UserButton />
            </Show>
        </header>
    );
}
