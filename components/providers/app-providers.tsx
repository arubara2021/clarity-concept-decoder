"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { ThemeProvider } from "next-themes";
import { MotionConfig } from "motion/react";
import { Toaster } from "sonner";

type AppProvidersProps = {
    children: ReactNode;
};

export function AppProviders({ children }: AppProvidersProps) {
    const pathname = usePathname();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);

    return (
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
            storageKey="clarity-theme"
        >
            <MotionConfig reducedMotion="user">
                {children}

                <Toaster
                    theme="system"
                    position="bottom-center"
                    closeButton={false}
                    duration={2200}
                    toastOptions={{
                        style: {
                            background: "var(--bg-2)",
                            border: "1px solid var(--border)",
                            color: "var(--text-0)",
                            borderRadius: "var(--radius-md)",
                            fontSize: "var(--step--1)",
                            boxShadow: "var(--shadow-float)",
                        },
                    }}
                />
            </MotionConfig>
        </ThemeProvider>
    );
}