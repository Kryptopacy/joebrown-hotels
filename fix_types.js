const fs = require('fs');
['src/types/supabase.ts'].forEach(file => {
  try {
    const content = fs.readFileSync(file, 'utf8');
    // It might be encoded weirdly, let's remove BOM and parse
    let cleanContent = content.replace(/^\uFEFF/, '');
    
    // Check if it's UTF-16LE and needs buffer decoding?
    // Node handles UTF-8 by default. If it's UTF-16LE, we should read it properly.
    const raw = fs.readFileSync(file);
    let str = raw.toString('utf16le');
    if (!str.startsWith('{')) str = raw.toString('utf8');
    
    // Strip BOM
    str = str.replace(/^\uFEFF/, '');

    const json = JSON.parse(str);
    fs.writeFileSync(file, json.types, 'utf8');
    console.log(`Fixed ${file}`);
  } catch (e) {
    console.error(`Error in ${file}:`, e);
  }
});
