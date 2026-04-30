import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
export default defineConfig({
    plugins: [react()],
    // Relative base prevents broken asset paths on iOS home-screen launches and subpath hosting.
    base: "./"
});
