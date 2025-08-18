// import { resolve } from 'path';
// import { defineConfig, externalizeDepsPlugin } from 'electron-vite';

// // @ts-ignore
// import vue from '@vitejs/plugin-vue';

// export default defineConfig({
//   main: {
//     plugins: [externalizeDepsPlugin()],
//     build: {
//       rollupOptions: {
//         output: {
//           format: 'es'
//         },
//         external: ['cheerio']
//       }
//     }
//   },
//   preload: {
//     build: {
//       rollupOptions: {
//         output: {
//           format: 'es'
//         }
//       }
//     }
//   },
//   renderer: {
//     build: {
//       rollupOptions: {
//         external: ['cheerio', 'node:sqlite']
//       }
//     },
//     resolve: {
//       alias: {
//         '@renderer': resolve('src/renderer/src')
//       }
//     },
//     plugins: [vue()]
//   }
// });

import { resolve } from 'path';
import { defineConfig, externalizeDepsPlugin, bytecodePlugin } from 'electron-vite';
// @ts-ignore
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin(), bytecodePlugin()]
  },
  preload: {
    plugins: [externalizeDepsPlugin(), bytecodePlugin()]
  },
  renderer: {
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src')
      }
    },
    plugins: [vue()]
  }
});
