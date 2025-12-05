// Source - https://stackoverflow.com/a
// Posted by tony19, modified by community. See post 'Timeline' for change history
// Retrieved 2025-12-05, License - CC BY-SA 4.0

import { normalizePath, defineConfig } from 'vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import path from 'path';

export default defineConfig({
	plugins: [
		viteStaticCopy({
			targets: [
				{
					src: normalizePath(path.resolve(__dirname, './assets')), // 1️⃣
					dest: './', // 2️⃣
				},
			],
		}),
	],
});
