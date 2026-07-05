import { ChatStoreProvider } from "@/components/ChatStoreProvider";

export default function ChatLayout({ children }: { children: React.ReactNode }) {
    return (
        <ChatStoreProvider>
            {children}
        </ChatStoreProvider>
    );
}
