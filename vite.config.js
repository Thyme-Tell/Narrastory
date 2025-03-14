// @ts-nocheck
/* eslint-disable import/no-extraneous-dependencies */
import ViteRestart from 'vite-plugin-restart'
import autoprefixer from 'autoprefixer'
import sassGlobImports from 'vite-plugin-sass-glob-import'
import legacy from '@vitejs/plugin-legacy'

/** @type {import('vite').UserConfig} */
export default ({ command }) => ({
	base: command === 'serve' ? '' : '/dist/',
	build: {
		manifest: true,
		outDir: './web/dist',
		commonjsOptions: {
			transformMixedEsModules: true,
		},
		rollupOptions: {
			input: {
				main: './src/js/main.js',
			},
		},
		output: {
			sourcemap: true,
		},
	},
	plugins: [
		sassGlobImports(),
		ViteRestart({
			reload: ['./templates/**/*'],
		}),
		legacy({
			targets: ['defaults', 'not IE 11'],
		}),
	],
	server: {
		host: '0.0.0.0',
		port: 3000,
		strictPort: true,
	},
	css: {
		devSourcemap: true,
		postcss: {
			plugins: [
				autoprefixer({}), // add options if needed
			],
		},
	},
	// this is default but wasn't working, so
	resolve: {
		extensions: ['.mjs', '.js', '.mts', '.ts', '.jsx', '.tsx', '.json'],
	},
})
