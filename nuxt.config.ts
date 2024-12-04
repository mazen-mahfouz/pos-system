// https://nuxt.com/docs/api/configuration/nuxt-config
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export default defineNuxtConfig({
	alias: {
		"@": resolve(__dirname, "./"),
	},

	vite: true,

	imports: {
		autoImport: true,
	},
	sourcemap: false,	

	// pwa: {
	//   manifest: {
	//     name: "Nuxt3 PWA",
	//     short_name: "Nuxt3 PWA",
	//     description: "Testing Nuxt3 PWA",
	//     icons: [
	//       {
	//         src: "icons/icon_64x64.png",
	//         sizes: "64x64",
	//         type: "image/png",
	//       },
	//       {
	//         src: "icons/icon_144x144.png",
	//         sizes: "144x144",
	//         type: "image/png",
	//       },
	//       {
	//         src: "icons/icon_192x192.png",
	//         sizes: "192x192",
	//         type: "image/png",
	//       },
	//       {
	//         src: "icons/icon_512x512.png",
	//         sizes: "512x512",
	//         type: "image/png",
	//       },
	//     ],
	//   },
	//   workbox: {
	//     navigateFallback: "/",
	//   },
	//   devOptions: {
	//     enabled: true,
	//     type: "module",
	//   },
	// },

	css: [
		"~/assets/css/main.scss",
		"notivue/notification.css",
		"notivue/animations.css",
	],

	devtools: { enabled: true },
	modules: [
		"@nuxt/ui",
		"nuxt-swiper",
		"@pinia/nuxt",
		"notivue/nuxt",
		"@vite-pwa/nuxt",
		"@nuxt/image",
	],

	swiper: {
		prefix: "Swiper",
		styleLang: "css",
	},

	runtimeConfig: {
		// Keys within public, will be also exposed to the client-side
		public: {
			apiBase: "http://127.0.0.1:8000/api",
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
				"Access-Control-Allow-Origin": "*",
			},
		},
	},

	plugins: [{ src: "~/plugins/echo.client.js", mode: "client" }],

	vite: {
		server: {
			proxy: {
				"/app": {
					target: "http://127.0.0.1:6001",
					changeOrigin: true,
					ws: true,
				},
			},
		},
		build: {
			cssMinify: true,
			minify: 'terser',
			terserOptions: {
				compress: {
					drop_console: true,
					drop_debugger: true
				}
			},
			rollupOptions: {
				output: {
					manualChunks: {
						'ui': ['@nuxt/ui'],
						'notivue': ['notivue'],
						'vendor': [
							'vue',
							'vue-router',
							'pinia',
							'@pinia/nuxt'
						]
					}
				}
			}
		},
		optimizeDeps: {
			include: ['vue', 'vue-router', '@nuxt/ui', 'notivue']
		},
		server: {
			hmr: {
				protocol: 'ws'
			},
			build: {
				target: 'esnext',
				sourcemap: false, // تعطيل السورسماب
				// استخدم إصدار حديث لتسريع البناء
			  },
			  optimizeDeps: {
				entries: [], // تقليل عدد الإدخالات المحسنة تلقائيًا
			  },
			fs: {
				strict: false, // للسماح بقراءة الملفات خارج المجلد الحالي
			  },
			proxy: {
				'/app': {
					target: 'http://127.0.0.1:6001',
					changeOrigin: true,
					ws: true
				}
			}
		},
		cacheDir: './node_modules/.vite_cache', 
		css: {
			devSourcemap: false
		},
		resolve: {
			alias: {
				"@": resolve(__dirname, "./")
			}
		}
	},

	notivue: {
		limit: 4,
		enqueue: true,
		notifications: {
			global: {
				duration: 4000,
			},
		},
	},

	ui: {
		theme: {
			default: "light", // Set the default theme to 'light'
		},
	},

	build: {
		transpile: ["@nuxt/ui"],
	},

	colorModel: {
		preference: "light",
	},

	compatibilityDate: "2024-10-15",

	nitro: {
		compressPublicAssets: true,
		minify: true,
		timing: false,
		sourceMap: false
	},

	experimental: {
		payloadExtraction: true,
		renderJsonPayloads: true,
		treeshakeClientOnly: true,
		componentIslands: true
	},

	app: {
		buildAssetsDir: '/_nuxt/',
		keepalive: true,
		head: {
			htmlAttrs: {
				lang: 'ar'
			}
		}
	},
});