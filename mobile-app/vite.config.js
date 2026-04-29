var _a;
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
var repoName = (_a = process.env.GITHUB_REPOSITORY) === null || _a === void 0 ? void 0 : _a.split("/")[1];
export default defineConfig({
    plugins: [react()],
    base: process.env.GITHUB_ACTIONS && repoName ? "/".concat(repoName, "/") : "/"
});
