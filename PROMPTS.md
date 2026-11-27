# Project Prompts

A chronological log of all user prompts used to build **SG HazeMonitor**.

---

## Prompt 1 — Frontend Foundation

> 1. build me a singapore based haze tracker application that tracks live psi levels across singapore
> 2. build just the front end for now, i will establish an api connection later.

---

## Prompt 2 — Serverless API Integration

> 1. add a serverless connection that pulls data from data.gov.sg using the following end points:
>
> https://api-open.data.gov.sg/v2/real-time/api/psi
>
> 2. store this in /api at project root level (not the src file)
> 3. include a /health.ts and /psi.ts within the same subfolder

---

## Prompt 3 — Vercel Deployment Dependency Fix

> deployment failed with error, fix this:
>
> ```text
> 11:35:34.024 Running build in Washington, D.C., USA (East) – iad1
> 11:35:34.025 Build machine configuration: 2 cores, 8 GB
> 11:35:34.159 Cloning github.com/KeziahVickraman/haze-what (Branch: main, Commit: 913c5f1)
> 11:35:34.161 Previous build caches not available.
> 11:35:34.443 Cloning completed: 284.000ms
> 11:35:35.415 Running "vercel build"
> 11:35:35.423 Vercel CLI 66.6.0
> 11:35:36.194 Installing dependencies...
> 11:35:36.838 npm warn Unknown env config "cache-dir". This will stop working in the next major version of npm. See `npm help npmrc` for supported config options.
> 11:35:47.817 npm error code ERESOLVE
> 11:35:47.818 npm error ERESOLVE could not resolve
> 11:35:47.818 npm error
> 11:35:47.819 npm error Found: esbuild@0.25.12
> 11:35:47.819 npm error node_modules/esbuild
> 11:35:47.819 npm error   dev esbuild@"^0.25.0" from the root project
> 11:35:47.819 npm error
> 11:35:47.819 npm error Could not resolve dependency:
> 11:35:47.819 npm error peerOptional esbuild@"^0.27.0 || ^0.28.0" from vite@8.4.0
> 11:35:47.819 npm error node_modules/vite
> 11:35:47.819 npm error   vite@"^8.3.0" from the root project
> 11:35:47.819 npm error   peer vite@"^5.2.0 || ^6 || ^7 || ^8" from @tailwindcss/vite@4.3.5
> 11:35:47.820 npm error   node_modules/@tailwindcss/vite
> 11:35:47.821 npm error     @tailwindcss/vite@"^4.3.3" from the root project
> 11:35:47.821 npm error   1 more (@vitejs/plugin-react)
> 11:35:47.821 npm error
> 11:35:47.821 npm error Conflicting peer dependency: esbuild@0.28.2
> 11:35:47.821 npm error node_modules/tsx/node_modules/esbuild
> 11:35:47.821 npm error   peerOptional esbuild@"^0.27.0 || ^0.28.0" from vite@8.4.0
> 11:35:47.821 npm error   node_modules/vite
> 11:35:47.822 npm error     vite@"^8.3.0" from the root project
> 11:35:47.822 npm error     peer vite@"^5.2.0 || ^6 || ^7 || ^8" from @tailwindcss/vite@4.3.5
> 11:35:47.822 npm error     node_modules/@tailwindcss/vite
> 11:35:47.823 npm error       @tailwindcss/vite@"^4.3.3" from the root project
> 11:35:47.823 npm error     1 more (@vitejs/plugin-react)
> 11:35:47.823 npm error
> 11:35:47.823 npm error Fix the upstream dependency conflict, or retry this command with --force or --legacy-peer-deps to accept an incorrect (and potentially broken) dependency resolution.
> 11:35:47.823 npm error
> 11:35:47.823 npm error
> 11:35:47.823 npm error For a full report see:
> 11:35:47.823 npm error /vercel/.npm/_logs/2026-11-27T03_35_36_425Z-eresolve-report.txt
> 11:35:47.823 npm error A complete log of this run can be found in: /vercel/.npm/_logs/2026-11-27T03_35_36_425Z-debug-0.log
> 11:35:47.871 Error: [BUILD_UTILS_SPAWN_1] Command "npm install" exited with 1
> ```

---

## Prompt 4 — Prompt Log Export

> collate all prompts and store them in PROMPTS.md
