/* eslint-disable no-undef */
const fs = require('fs');
const path = require('path');

const DIRECTORIES_TO_SCAN = [
  'app',
  'assets/data',
  'components',
  'constants',
  'context',
  'hooks',
  'services'
];

const EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx', '.json', '.md'];

function replaceEmDashesInFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    if (content.includes('—')) {
      // Replace em dash with spaces around it to a single space-dash-space
      // Then replace any remaining em dashes with space-dash-space
      let updatedContent = content.replace(/\s*—\s*/g, ' - ');
      fs.writeFileSync(filePath, updatedContent, 'utf8');
      console.log(`Updated: ${filePath}`);
    }
  } catch (error) {
    console.error(`Error reading/writing file ${filePath}:`, error.message);
  }
}

function scanDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) return;
  
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      scanDirectory(fullPath);
    } else if (entry.isFile()) {
      const ext = path.extname(fullPath);
      if (EXTENSIONS.includes(ext)) {
        replaceEmDashesInFile(fullPath);
      }
    }
  }
}

console.log('Scanning for em dashes...');
for (const dir of DIRECTORIES_TO_SCAN) {
  scanDirectory(path.join(__dirname, '..', dir));
}

// Also scan root files
const ROOT_FILES = ['README.md', 'app.config.js', 'aso_and_product_strategy.md'];
for (const file of ROOT_FILES) {
  const fullPath = path.join(__dirname, '..', file);
  if (fs.existsSync(fullPath)) {
    replaceEmDashesInFile(fullPath);
  }
}

console.log('Done!');
