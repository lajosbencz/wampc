import dts from 'rollup-plugin-dts'
import esbuild from 'rollup-plugin-esbuild'
import del from 'rollup-plugin-delete'

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
    plugins: [esbuild(), del({ targets: `${buildDir}**` })],
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
        inlineDynamicImports: false,
        // file: `${name}.mjs`,
        dir: `${buildDir}mjs/${name}`,
        format: 'es',
        sourcemap: true,
      },
    ],
  }),
  bundle({
    plugins: [dts(), del({ targets: `${buildDir}ts/**` })],
    output: {
      exports: 'named',
      inlineDynamicImports: false,
      // file: `${name}.d.ts`,
      dir: `${buildDir}ts/${name}`,
      format: 'es',
    },
  }),
]
