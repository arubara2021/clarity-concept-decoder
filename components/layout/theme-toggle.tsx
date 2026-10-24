"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { motion, useMotionValue, useSpring } from "motion/react";
import { Laptop, Moon, Sun } from "lucide-react";

type ThemeChoice = "system" | "light" | "dark";

const order: ThemeChoice[] = ["system", "light", "dark"];

const labels: Record<ThemeChoice, string> = {
    system: "System",
    light: "Light",
    dark: "Dark",
};

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const [previous, setPrevious] = useState<ThemeChoice | null>(null);

    const rotation = useMotionValue(0);
    const rotate = useSpring(rotation, {
        stiffness: 300,
        damping: 22,
        mass: 0.7,
    });

    useEffect(() => {
        setMounted(true);
    }, []);

    const current: ThemeChoice =
        theme === "light" || theme === "dark" || theme === "system"
            ? theme
            : "system";

    useEffect(() => {
        if (!mounted) return;

        if (previous !== null && previous !== current) {
            rotation.set(rotation.get() + 120);
        }

        setPrevious(current);
    }, [current, mounted, previous, rotation]);

    if (!mounted) {
        return (
            <span
                className="inline-grid h-9 w-9 place-items-center rounded-full border border-transparent text-transparent"
                aria-hidden="true"
            />
        );
    }

    const next = order[(order.indexOf(current) + 1) % order.length];
    const Icon = current === "system" ? Laptop : current === "dark" ? Moon : Sun;

    return (
        <button
            type="button"
            onClick={() => setTheme(next)}
            aria-label={`Theme is ${labels[current]}. Switch to ${labels[next]}.`}
            title={`Theme: ${labels[current]}`}
            className="inline-grid h-9 w-9 place-items-center rounded-full border border-transparent text-[var(--text-1)] transition-colors duration-150 hover:border-[var(--border)] hover:bg-[var(--bg-2)] hover:text-[var(--text-0)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-ring)]"
        >
            <motion.span style={{ rotate }} className="inline-flex">
                <Icon size={15} aria-hidden="true" />
            </motion.span>
        </button>
    );
}