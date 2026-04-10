import fs from 'fs';
import path from 'path';

const filePath = path.resolve(process.argv[2] || 'src/task_graph.pb.mjs');

try {
  let content = fs.readFileSync(filePath, 'utf8');

  const updatedContent = content.replace(
    /import \* as \$protobuf from "protobufjs\/minimal"/g,
    'import $protobuf from "protobufjs/minimal.js"'
  );

  fs.writeFileSync(filePath, updatedContent, 'utf8');
  console.log(`Patched ${filePath} for ESM compatibility.`);
} catch (err) {
  console.error(`Failed to patch ${filePath}:`, err.message);
  process.exit(1);
}
