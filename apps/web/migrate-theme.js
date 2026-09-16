const fs = require('fs');
const path = require('path');

const DIR = './app/dashboard';

const replacements = [
  { regex: /bg-\[#0A0A0A\]/g, replacement: 'bg-bg' },
  { regex: /bg-\[#050505\]/g, replacement: 'bg-bg' },
  { regex: /bg-\[#121212\]/g, replacement: 'bg-surface' },
  { regex: /bg-\[#1E1E1E\]/g, replacement: 'bg-surface-hover' },
  { regex: /border-white\/5/g, replacement: 'border-border' },
  { regex: /border-white\/10/g, replacement: 'border-border-strong' },
  { regex: /text-gray-400/g, replacement: 'text-muted' },
  { regex: /text-gray-500/g, replacement: 'text-faint' },
  { regex: /text-white/g, replacement: 'text-main' },
  { regex: /text-gray-200/g, replacement: 'text-main' },
  { regex: /bg-blue-600/g, replacement: 'bg-primary' },
  { regex: /bg-blue-500/g, replacement: 'bg-primary' },
  { regex: /text-blue-400/g, replacement: 'text-primary' },
  { regex: /text-blue-500/g, replacement: 'text-primary' },
  { regex: /border-blue-500/g, replacement: 'border-primary' },
  { regex: /bg-blue-400\/10/g, replacement: 'bg-primary/10' },
];

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk(DIR);
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;
  
  replacements.forEach(({ regex, replacement }) => {
    content = content.replace(regex, replacement);
  });
  
  if (content !== original) {
    fs.writeFileSync(file, content);
    console.log(`Updated ${file}`);
  }
});
