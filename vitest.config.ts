import { defineConfig } from "vitest/config";
import { resolve } from "node:path";

export default defineConfig({
    test: {
        environment: "jsdom",
        include: ["tests/**/*.test.ts"],
        reporters: ["verbose"],
    },
    resolve: {
        alias: {
            "@": resolve(__dirname, "."),
        },
    },
});