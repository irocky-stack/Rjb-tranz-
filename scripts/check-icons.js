// Simple pre-dist check to ensure platform icons exist for electron-builder
// This will not fail the build, but will print clear guidance if files are missing

const fs = require('fs');
const path = require('path');

const assetsDir = path.join(__dirname, '..', 'electron', 'assets');
const required = [
  { file: 'icon.icns', platform: 'macOS', builderKey: 'mac.icon' },
  { file: 'icon.ico', platform: 'Windows', builderKey: 'win.icon' },
  { file: 'icon.png', platform: 'Linux', builderKey: 'linux.icon' },
];

function fileExists(p) {
  try {
    return fs.existsSync(p);
  } catch {
    return false;
  }
}

function main() {
  try {
    if (!fs.existsSync(assetsDir)) {
      console.warn(`[check-icons] assets directory does not exist: ${assetsDir}`);
      console.warn(`[check-icons] Create it or update electron-builder icon paths in package.json -> build`);
      return;
    }

    const missing = required.filter(({ file }) => !fileExists(path.join(assetsDir, file)));
    if (missing.length === 0) {
      console.log('[check-icons] All platform icon files found ✅');
      return;
    }

    console.warn('[check-icons] One or more platform icons are missing:');
    for (const m of missing) {
      console.warn(`  - ${m.file} (${m.platform}) -> package.json build key: ${m.builderKey}`);
    }

    console.warn('\nGuidance:');
    console.warn(`  - Put your icon files under: ${assetsDir}`);
    console.warn('  - Recommended sizes:');
    console.warn('      macOS (.icns): 512x512 or appiconset converted to .icns');
    console.warn('      Windows (.ico): multi-size 16/32/48/64/128/256');
    console.warn('      Linux (.png): 512x512');
    console.warn('\nQuick options:');
    console.warn('  - Use an online converter to generate .icns and .ico from a 512x512 PNG');
    console.warn('  - Or use electron-icon-builder locally to generate from a source PNG');
    console.warn('    npm i -D electron-icon-builder && npx electron-icon-builder --input=icon.png --output=electron/assets');

    // Do not fail the build; just warn
  } catch (err) {
    console.warn('[check-icons] Unexpected error:', err?.message || err);
    // Do not fail the build
  }
}

main();