import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppProviders } from "@/components/providers/app-providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Clarity — Understand anything, at your level",
    description:
        "Turn dense text into a structured mental model. TL;DR, analogy, jargon translation, takeaway, concept map, and a private local library.",
    keywords: [
        "concept decoder",
        "plain english explainer",
        "concept map",
        "reading assistant",
        "local first",
    ],
};

export const viewport: Viewport = {
    themeColor: "#000000",
    width: "device-width",
    initialScale: 1,
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html
            lang="en"
            data-scroll-behavior="smooth"
            suppressHydrationWarning
        >
            <body
                className={`${inter.className} bg-[var(--bg-0)] text-[var(--text-0)] antialiased`}
            >
                <AppProviders>{children}</AppProviders>
            </body>
        </html>
    );
}