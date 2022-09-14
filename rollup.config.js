import dts from 'rollup-plugin-dts'
import esbuild from 'rollup-plugin-esbuild'
import del from 'rollup-plugin-delete'
// import alias from '@rollup/plugin-alias'
import resolve from "@rollup/plugin-node-resolve"
import commonjs from "@rollup/plugin-commonjs"
import nodePolyfills from "rollup-plugin-polyfill-node"

// const name = require('./package.json').main.replace(/\.js$/, '')
const name = require('./package.json').name

const bundle = config => ({
  ...config,
  input: 'src/index.ts',
  external: id => !/^[./]/.test(id),
})

const buildDir = 'dist/'

export default [
  bundle({
    plugins: [
      del({targets: `${buildDir}cjs/**`}),
      nodePolyfills({
        include: ['dist/**', 'node_modules/**'],
      }),
      resolve({browser: true}),
      esbuild()
    ],
    output: [
      {
        exports: 'named',
        inlineDynamicImports: false,
        // file: `${name}.js`,
        dir: `${buildDir}cjs/${name}`,
        format: 'cjs',
        sourcemap: true,
      },
      {
        exports: 'named',
        name: 'wampc',
        inlineDynamicImports: true,
        // file: `${name}.js`,
        dir: `${buildDir}umd/${name}`,
        format: 'umd',
        sourcemap: true,
        globals: {
          'es6-deferred-promise': 'es6DeferredPromise',
          'msgpack5': 'msgpack5',
          'cbor': 'cbor',
          'events': 'EventEmitter',
        },
      },
    ],
  }),
  bundle({
    plugins: [
      del({targets: `${buildDir}mjs/**`}),
      esbuild(),
    ],
    output: [
      {
        exports: 'named',
        inlineDynamicImports: false,
        // file: `${name}.mjs`,
        dir: `${buildDir}mjs/${name}`,
        format: 'es',
        sourcemap: true,
      },
    ],
  }),
  bundle({
    plugins: [
      del({targets: `${buildDir}ts/**`}),
      dts(),
    ],
    output: {
      exports: 'named',
      inlineDynamicImports: false,
      // file: `${name}.d.ts`,
      dir: `${buildDir}ts/${name}`,
      format: 'es',
    },
  }),
]
