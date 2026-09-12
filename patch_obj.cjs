const fs = require('fs');
let code = fs.readFileSync('src/pages/ObjectiveDetail.tsx', 'utf8');

const targetStr = `<div className="flex flex-wrap items-center gap-4 text-sm">
            <div className="flex items-center gap-2 bg-gray-50 px-4 py-2.5 rounded-xl border border-gray-100">
              <span className="font-bold tracking-widest text-gray-400 uppercase text-xs">Início</span>
              <span className="font-medium text-gray-900 dark:text-gray-100">{parseLocal(goal.startDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).replace('.', '')}</span>
            </div>
            
            <div className="flex items-center gap-2 bg-red-50 px-4 py-2.5 rounded-xl border border-red-100">
              <span className="font-bold tracking-widest text-red-400 uppercase text-xs">Prazo final</span>
              <span className="font-bold text-red-700">{parseLocal(goal.endDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).replace('.', '')}</span>
            </div>
          </div>`;

const newStr = `<div className="flex flex-wrap items-center gap-4 text-sm">
            <div className="flex items-center gap-2 bg-gray-50 px-4 py-2.5 rounded-xl border border-gray-100">
              <span className="font-bold tracking-widest text-gray-400 uppercase text-xs">Início</span>
              <span className="font-bold text-gray-700">{formatDateFull(goal.startDate)}</span>
            </div>
            
            <div className="flex items-center gap-2 bg-red-50 px-4 py-2.5 rounded-xl border border-red-100">
              <span className="font-bold tracking-widest text-red-400 uppercase text-xs">Prazo final</span>
              <span className="font-bold text-red-700">{formatDateFull(goal.endDate)}</span>
            </div>
          </div>`;

code = code.replace(targetStr, newStr);
fs.writeFileSync('src/pages/ObjectiveDetail.tsx', code);
console.log('Patched');
