const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'node_modules', 'expo-device', 'ios', 'UIDevice.swift');
if (!fs.existsSync(filePath)) {
  console.log('expo-device UIDevice.swift not found, skipping patch');
  process.exit(0);
}

let content = fs.readFileSync(filePath, 'utf8');
if (content.includes('TARGET_OS_SIMULATOR')) {
  content = content.replace(
    'return TARGET_OS_SIMULATOR != 0',
    '#if targetEnvironment(simulator)\n    return true\n    #else\n    return false\n    #endif'
  );
  fs.writeFileSync(filePath, content);
  console.log('Patched expo-device UIDevice.swift: replaced TARGET_OS_SIMULATOR with targetEnvironment(simulator)');
} else {
  console.log('expo-device UIDevice.swift already patched, skipping');
}
