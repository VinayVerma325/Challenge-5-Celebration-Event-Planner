const { execSync } = require('child_process');
const path = require('path');

try {
  const tscPkg = require.resolve('typescript/package.json');
  const tscPath = path.join(path.dirname(tscPkg), 'bin/tsc');

  const vitePkg = require.resolve('vite/package.json');
  const vitePath = path.join(path.dirname(vitePkg), 'bin/vite.js');

  console.log('🚀 [BUILD] Compiling Server with TypeScript...');
  execSync(`node "${tscPath}" --project "${path.resolve(__dirname, '../server/tsconfig.json')}"`, {
    stdio: 'inherit'
  });

  console.log('🚀 [BUILD] Compiling Client with Vite...');
  execSync(`node "${vitePath}" build --config "${path.resolve(__dirname, '../client/vite.config.ts')}" "${path.resolve(__dirname, '../client')}"`, {
    stdio: 'inherit'
  });

  console.log('✅ [BUILD] Celebration & Event Planner build finished successfully!');
} catch (error) {
  console.error('❌ [BUILD ERROR]:', error.message);
  process.exit(1);
}
