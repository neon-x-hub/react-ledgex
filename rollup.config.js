export default {
  input: 'src/index.js',
  output: [
    {
      file: 'dist/index.js',
      format: 'cjs',
      exports: 'auto' // Better CommonJS detection
    },
    {
      file: 'dist/esm/index.js',
      format: 'es'
    }
  ],
  external: ['react', '@ledgex/core'] // Don't bundle peer dependencies
};
