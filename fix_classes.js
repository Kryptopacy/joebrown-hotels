const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

const replacements = [
  { search: /text--(\d+)/g, replace: 'text-brown-$1' },
  { search: /bg--(\d+)/g, replace: 'bg-brown-$1' },
  { search: /border--(\d+)/g, replace: 'border-brown-$1' },
];

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      processDirectory(filePath);
    } else if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
      let content = fs.readFileSync(filePath, 'utf8');
      let originalContent = content;
      for (const { search, replace } of replacements) {
        content = content.replace(search, replace);
      }
      if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated: ${filePath}`);
      }
    }
  }
}

processDirectory(srcDir);
console.log('Fixed double-dash classes!');
