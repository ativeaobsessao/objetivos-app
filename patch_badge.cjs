const fs = require('fs');
let content = fs.readFileSync('src/pages/Home.tsx', 'utf8');

const targetStr = `<div className="flex items-center gap-2 mt-1">
            <span className={\`text-xs font-bold px-2 py-0.5 rounded-full \${badgeClasses}\`}>
              {badgeText}
            </span>
            <span className="text-xs text-gray-500 font-medium">{progress}% concluído</span>
          </div>`;

const replacement = `<div className="flex items-center flex-nowrap gap-2 mt-1 overflow-hidden">
            <span className={\`text-[11px] sm:text-xs font-bold px-2.5 py-0.5 whitespace-nowrap rounded-full \${badgeClasses}\`}>
              {badgeText}
            </span>
            <span className="text-[11px] sm:text-xs text-gray-500 font-medium whitespace-nowrap truncate">{progress}% concluído</span>
          </div>`;

if (content.includes(targetStr)) {
  content = content.replace(targetStr, replacement);
  fs.writeFileSync('src/pages/Home.tsx', content);
  console.log("Patched successfully!");
} else {
  console.log("Could not find target string.");
}
