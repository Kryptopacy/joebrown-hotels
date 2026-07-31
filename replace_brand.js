const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

// Replacements
const replacements = [
  { search: /Dreamsfield Hotel & Lounge/g, replace: 'Joebrown Palace Hotel and Suites' },
  { search: /Dreamsfield Hotel/g, replace: 'Joebrown Palace Hotel' },
  { search: /Dreamsfield/g, replace: 'Joebrown' },
  { search: /dreamsfieldhotels.com/g, replace: 'joebrownhotels.com' },
  { search: /dreamsfield/gi, replace: 'joebrown' },
  { search: /text-gold/g, replace: 'text-brown' },
  { search: /bg-gold/g, replace: 'bg-brown' },
  { search: /border-gold/g, replace: 'border-brown' },
  { search: /ring-gold/g, replace: 'ring-brown' },
  { search: /fill-gold/g, replace: 'fill-brown' },
  { search: /from-gold/g, replace: 'from-brown' },
  { search: /to-gold/g, replace: 'to-brown' },
  { search: /via-gold/g, replace: 'via-brown' },
  { search: /gold-/g, replace: 'brown-' },
  { search: /DREAMSFIELD/g, replace: 'JOEBROWN' }
];

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      processDirectory(filePath);
    } else if (filePath.endsWith('.tsx') || filePath.endsWith('.ts') || filePath.endsWith('.css')) {
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
console.log('Brand string replacement complete!');
