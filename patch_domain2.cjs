const fs = require('fs');
let code = fs.readFileSync('src/services/domainService.ts', 'utf8');

code = code.replace(
`        endDate: goalData.end_date,
        status: goalData.status,
        createdAt: goalData.created_at`,
`        endDate: goalData.end_date,
        status: goalData.status,
        createdAt: goalData.created_at,
        position: goalData.position`
);

fs.writeFileSync('src/services/domainService.ts', code);
