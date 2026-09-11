const fs = require('fs');
let code = fs.readFileSync('src/types.ts', 'utf8');

code = code.replace(
`  status: GoalStatus;
  createdAt: string; // ISO 8601
}`,
`  status: GoalStatus;
  createdAt: string; // ISO 8601
  position?: number;
}`);

code = code.replace(
`  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}`,
`  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  position?: number;
}`);

fs.writeFileSync('src/types.ts', code);
