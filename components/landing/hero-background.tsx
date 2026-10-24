"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import { useTheme } from "next-themes";

type Particle = {
    x: number;
    y: number;
    vx: number;
    vy: number;
    radius: number;
    depth: number;
    pulse: number;
    colorRgb: string;
};

type Palette = {
    strategy: "void" | "eclipse";
    particles: string[];
    inkRgb: string;
    glowEnabled: boolean;
    auraInner: string;
    auraMid: string;
    lineStrength: number;
    nodeAlphaBase: number;
    nodeAlphaDepth: number;
    vignetteStrength: number;
    ringAlpha: number;
};

const darkPalette: Palette = {
    strategy: "void",
    particles: ["255,255,255", "226,232,240", "148,163,184"],
    inkRgb: "255,255,255",
    glowEnabled: true,
    auraInner: "rgba(255,255,255,0.08)",
    auraMid: "rgba(255,255,255,0.03)",
    lineStrength: 0.1,
    nodeAlphaBase: 0.12,
    nodeAlphaDepth: 0.28,
    vignetteStrength: 0,
    ringAlpha: 1,
};

const lightPalette: Palette = {
    strategy: "eclipse",
    particles: ["9,9,11", "30,41,59", "71,85,105"],
    inkRgb: "9,9,11",
    glowEnabled: false,
    auraInner: "rgba(0,0,0,0)",
    auraMid: "rgba(0,0,0,0)",
    lineStrength: 0.06,
    nodeAlphaBase: 0.16,
    nodeAlphaDepth: 0.26,
    vignetteStrength: 0.08,
    ringAlpha: 1.6,
};

export function HeroBackground({ className = "" }: { className?: string }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const reduceMotion = useReducedMotion();
    const { resolvedTheme } = useTheme();

    // Hydration fix: wait until mounted to read the theme
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);
    const isLight = mounted && resolvedTheme === "light";

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const palette = isLight ? lightPalette : darkPalette;

        let animationId = 0;
        let width = 0;
        let height = 0;
        let frame = 0;
        let particles: Particle[] = [];

        const pointer = {
            x: 0,
            y: 0,
            targetX: 0,
            targetY: 0,
        };

        const createParticles = () => {
            const count = Math.min(72, Math.floor((width * height) / 26000));

            particles = Array.from({ length: count }, () => {
                const depth = 0.35 + Math.random() * 0.85;
                const color =
                    palette.particles[Math.floor(Math.random() * palette.particles.length)] ??
                    palette.particles[0] ??
                    "255,255,255";

                return {
                    x: Math.random() * width,
                    y: Math.random() * height,
                    vx: (Math.random() - 0.5) * 0.12,
                    vy: (Math.random() - 0.5) * 0.12,
                    radius: 0.55 + Math.random() * 1.65,
                    depth,
                    pulse: Math.random() * Math.PI * 2,
                    colorRgb: color,
                };
            });
        };

        const drawVignette = () => {
            if (palette.vignetteStrength <= 0) return;

            const inner = Math.min(width, height) * 0.32;
            const outer = Math.max(width, height) * 0.72;

            const vignette = ctx.createRadialGradient(
                width / 2,
                height / 2,
                inner,
                width / 2,
                height / 2,
                outer
            );

            vignette.addColorStop(0, `rgba(${palette.inkRgb},0)`);
            vignette.addColorStop(1, `rgba(${palette.inkRgb},${palette.vignetteStrength})`);

            ctx.fillStyle = vignette;
            ctx.fillRect(0, 0, width, height);
        };

        const drawEclipseCore = (cx: number, cy: number, min: number) => {
            ctx.beginPath();
            ctx.arc(cx, cy, min * 0.12, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(${palette.inkRgb},${0.16 * palette.ringAlpha})`;
            ctx.lineWidth = 1;
            ctx.stroke();

            const arcStart = frame * 0.0016;
            ctx.beginPath();
            ctx.arc(cx, cy, min * 0.2, arcStart, arcStart + Math.PI * 1.25);
            ctx.strokeStyle = `rgba(${palette.inkRgb},${0.12 * palette.ringAlpha})`;
            ctx.lineWidth = 1;
            ctx.stroke();

            const arcStart2 = -frame * 0.0011;
            ctx.beginPath();
            ctx.arc(cx, cy, min * 0.3, arcStart2, arcStart2 + Math.PI * 0.9);
            ctx.strokeStyle = `rgba(${palette.inkRgb},${0.08 * palette.ringAlpha})`;
            ctx.lineWidth = 1;
            ctx.stroke();

            const satAngle = frame * 0.0024;
            ctx.beginPath();
            ctx.arc(
                cx + Math.cos(satAngle) * min * 0.2,
                cy + Math.sin(satAngle) * min * 0.2,
                2,
                0,
                Math.PI * 2
            );
            ctx.fillStyle = `rgba(${palette.inkRgb},0.5)`;
            ctx.fill();

            ctx.beginPath();
            ctx.arc(cx, cy, 3.2, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${palette.inkRgb},0.62)`;
            ctx.fill();
        };

        const drawVoidRings = (cx: number, cy: number, min: number) => {
            const rings = [
                { radius: min * 0.18, speed: 0.00028, alpha: 0.1, tilt: 0.62 },
                { radius: min * 0.26, speed: -0.0002, alpha: 0.07, tilt: 0.72 },
                { radius: min * 0.36, speed: 0.00013, alpha: 0.045, tilt: 0.82 },
            ];

            rings.forEach((ring, index) => {
                ctx.save();
                ctx.translate(cx, cy);
                ctx.rotate(frame * ring.speed);
                ctx.scale(1, ring.tilt);

                ctx.beginPath();
                ctx.arc(0, 0, ring.radius, 0, Math.PI * 2);
                ctx.strokeStyle = `rgba(${palette.inkRgb},${ring.alpha * palette.ringAlpha})`;
                ctx.lineWidth = 1;
                ctx.stroke();

                if (index === 0) {
                    const angle = frame * 0.0024;

                    ctx.beginPath();
                    ctx.arc(
                        Math.cos(angle) * ring.radius,
                        Math.sin(angle) * ring.radius,
                        1.5,
                        0,
                        Math.PI * 2
                    );
                    ctx.fillStyle = `rgba(${palette.inkRgb},${ring.alpha * 3.2})`;
                    ctx.fill();
                }

                ctx.restore();
            });
        };

        const draw = () => {
            if (width === 0 || height === 0) return;

            ctx.clearRect(0, 0, width, height);
            ctx.globalCompositeOperation = "source-over";

            const cx = width / 2 + pointer.x * 22;
            const cy = height * 0.42 + pointer.y * 16;
            const min = Math.min(width, height);

            if (palette.strategy === "void") {
                const aura = ctx.createRadialGradient(
                    cx,
                    cy,
                    0,
                    cx,
                    cy,
                    Math.max(width, height) * 0.5
                );

                aura.addColorStop(0, palette.auraInner);
                aura.addColorStop(0.3, palette.auraMid);
                aura.addColorStop(1, "rgba(0,0,0,0)");

                ctx.fillStyle = aura;
                ctx.fillRect(0, 0, width, height);

                const hole = ctx.createRadialGradient(cx, cy, 0, cx, cy, min * 0.26);

                hole.addColorStop(0, "rgba(0,0,0,0.98)");
                hole.addColorStop(0.68, "rgba(0,0,0,0.52)");
                hole.addColorStop(1, "rgba(0,0,0,0)");

                ctx.fillStyle = hole;
                ctx.fillRect(0, 0, width, height);

                drawVoidRings(cx, cy, min);
            } else {
                drawVignette();
                drawEclipseCore(cx, cy, min);
            }

            const linkDistance = Math.min(170, Math.max(110, width / 10));

            for (const particle of particles) {
                const dx = cx - particle.x;
                const dy = cy - particle.y;
                const distance = Math.hypot(dx, dy) || 1;

                particle.vx += dx * 0.000016 * particle.depth;
                particle.vy += dy * 0.000016 * particle.depth;

                particle.vx += (-dy / distance) * 0.0034 * particle.depth;
                particle.vy += (dx / distance) * 0.0034 * particle.depth;

                if (distance < min * 0.12) {
                    particle.vx -= (dx / distance) * 0.02;
                    particle.vy -= (dy / distance) * 0.02;
                }

                particle.vx *= 0.988;
                particle.vy *= 0.988;

                particle.x += particle.vx + pointer.x * particle.depth * 0.12;
                particle.y += particle.vy + pointer.y * particle.depth * 0.12;

                if (particle.x < -60) particle.x = width + 60;
                if (particle.x > width + 60) particle.x = -60;

                if (particle.y < -60) particle.y = height + 60;
                if (particle.y > height + 60) particle.y = -60;
            }

            ctx.globalCompositeOperation =
                palette.strategy === "eclipse" ? "multiply" : "lighter";

            for (let i = 0; i < particles.length; i += 1) {
                for (let j = i + 1; j < particles.length; j += 1) {
                    const a = particles[i];
                    const b = particles[j];

                    const dx = a.x - b.x;
                    const dy = a.y - b.y;
                    const distance = Math.hypot(dx, dy);

                    if (distance < linkDistance) {
                        const alpha =
                            (1 - distance / linkDistance) *
                            palette.lineStrength *
                            ((a.depth + b.depth) / 2);

                        ctx.strokeStyle = `rgba(${a.colorRgb},${alpha})`;
                        ctx.lineWidth = 1;
                        ctx.beginPath();
                        ctx.moveTo(a.x, a.y);
                        ctx.lineTo(b.x, b.y);
                        ctx.stroke();
                    }
                }
            }

            for (const particle of particles) {
                const pulse = Math.sin(frame * 0.016 + particle.pulse) * 0.22 + 0.82;
                const radius = particle.radius * pulse;
                const alpha = palette.nodeAlphaBase + particle.depth * palette.nodeAlphaDepth;

                ctx.beginPath();
                ctx.arc(particle.x, particle.y, radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${particle.colorRgb},${alpha})`;

                if (palette.glowEnabled && particle.radius > 1.4) {
                    ctx.shadowColor = `rgba(${particle.colorRgb},0.35)`;
                    ctx.shadowBlur = 10;
                }

                ctx.fill();
                ctx.shadowBlur = 0;
            }

            ctx.globalCompositeOperation = "source-over";
        };

        const resize = () => {
            const dpr = Math.min(window.devicePixelRatio || 1, 2);

            width = canvas.offsetWidth;
            height = canvas.offsetHeight;

            canvas.width = Math.floor(width * dpr);
            canvas.height = Math.floor(height * dpr);

            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

            createParticles();

            if (reduceMotion) {
                draw();
            }
        };

        const handlePointerMove = (event: PointerEvent) => {
            const rect = canvas.getBoundingClientRect();

            pointer.targetX =
                ((event.clientX - rect.left) / rect.width - 0.5) * 2;

            pointer.targetY =
                ((event.clientY - rect.top) / rect.height - 0.5) * 2;
        };

        const resetPointer = () => {
            pointer.targetX = 0;
            pointer.targetY = 0;
        };

        const render = () => {
            frame += 1;

            pointer.x += (pointer.targetX - pointer.x) * 0.04;
            pointer.y += (pointer.targetY - pointer.y) * 0.04;

            draw();

            animationId = window.requestAnimationFrame(render);
        };

        resize();

        if (!reduceMotion) {
            render();
        }

        window.addEventListener("resize", resize);
        window.addEventListener("pointermove", handlePointerMove);
        window.addEventListener("pointerleave", resetPointer);
        window.addEventListener("blur", resetPointer);

        return () => {
            window.cancelAnimationFrame(animationId);
            window.removeEventListener("resize", resize);
            window.removeEventListener("pointermove", handlePointerMove);
            window.removeEventListener("pointerleave", resetPointer);
            window.removeEventListener("blur", resetPointer);
        };
    }, [reduceMotion, isLight]);

    return (
        <div
            aria-hidden="true"
            className={`pointer-events-none absolute inset-0 overflow-hidden bg-[var(--bg-0)] ${className}`}
        >
            <div className="hero-background absolute inset-0" />
            <div className="hero-vignette absolute inset-0" />
            <div className="hero-glow absolute left-1/2 top-[38%] h-[360px] w-[360px] sm:h-[520px] sm:w-[520px] lg:h-[620px] lg:w-[620px]" />
            <canvas
                ref={canvasRef}
                className={`absolute inset-0 h-full w-full ${isLight ? "opacity-60" : "opacity-80"}`}
            />
            <div className="hero-grid absolute inset-0 opacity-40" />
            <div className="hero-noise absolute inset-0" />
            <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-b from-transparent to-[var(--bg-0)]" />
        </div>
    );
}