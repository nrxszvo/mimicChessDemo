import tailwindcss from '@tailwindcss/vite';
import { svelteTesting } from '@testing-library/svelte/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import fs from 'fs';
import nodeResolve from '@rollup/plugin-node-resolve';

export default defineConfig({
	plugins: [
		sveltekit(),
		tailwindcss(),
		nodeResolve({
			dedupe: ['svelte', 'svelte/transition', 'svelte/internal'] // important!
		})
	],
	server: {
		https: {
			key: fs.readFileSync(`${__dirname}/cert/key.pem`),
			cert: fs.readFileSync(`${__dirname}/cert/cert.pem`)
		},
		proxy: {}
	},
	test: {
		workspace: [
			{
				extends: './vite.config.ts',
				plugins: [svelteTesting()],

				test: {
					name: 'client',
					environment: 'jsdom',
					clearMocks: true,
					include: ['src/**/*.svelte.{test,spec}.{js,ts}'],
					exclude: ['src/lib/server/**'],
					setupFiles: ['./vitest-setup-client.ts']
				}
			},
			{
				extends: './vite.config.ts',

				test: {
					name: 'server',
					environment: 'node',
					include: ['src/**/*.{test,spec}.{js,ts}'],
					exclude: ['src/**/*.svelte.{test,spec}.{js,ts}']
				}
			}
		]
	}
});
