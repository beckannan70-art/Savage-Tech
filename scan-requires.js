// scan-requires.js
const fs = require('fs');
const path = require('path');

const commandsDir = './commands';
const files = fs.readdirSync(commandsDir).filter(f => f.endsWith('.js'));

// Built-in Node.js modules (these are safe)
const builtins = new Set([
    'fs', 'path', 'os', 'util', 'stream', 'events', 'crypto', 'http', 'https',
    'url', 'querystring', 'zlib', 'child_process', 'process', 'buffer', 'assert',
    'net', 'dns', 'tls', 'readline', 'repl', 'vm', 'worker_threads'
]);

const allRequires = {}; // key: requireString, value: { count, files: [] }

for (const file of files) {
    const fullPath = path.join(commandsDir, file);
    const content = fs.readFileSync(fullPath, 'utf-8');
    // Match require('...') or require("...") – including dynamic but we ignore those.
    const regex = /require\s*\(\s*(['"])(.*?)\1\s*\)/g;
    let match;
    while ((match = regex.exec(content)) !== null) {
        const reqStr = match[2];
        if (!allRequires[reqStr]) {
            allRequires[reqStr] = { count: 0, files: [] };
        }
        allRequires[reqStr].count++;
        if (!allRequires[reqStr].files.includes(file)) {
            allRequires[reqStr].files.push(file);
        }
    }
}

// Categorize
const local = [];
const npm = [];
const builtin = [];

for (const [req, data] of Object.entries(allRequires)) {
    if (req.startsWith('.') || req.startsWith('..')) {
        local.push({ req, ...data });
    } else if (builtins.has(req)) {
        builtin.push({ req, ...data });
    } else {
        npm.push({ req, ...data });
    }
}

console.log('\n=== SCAN COMPLETE ===\n');
console.log(`Total unique require strings: ${Object.keys(allRequires).length}`);
console.log(`- Local (./ or ../): ${local.length}`);
console.log(`- NPM packages: ${npm.length}`);
console.log(`- Built-in Node modules: ${builtin.length}\n`);

if (local.length > 0) {
    console.log('🔴 LOCAL REQUIRES (need attention):');
    local.forEach(({ req, count, files }) => {
        console.log(`   ${req} (used in ${count} file(s)): ${files.join(', ')}`);
    });
    console.log('\n⚠️ These will break if you delete the commands folder without inlining them.');
} else {
    console.log('✅ No local requires found – you are safe!');
}

if (npm.length > 0) {
    console.log('\n📦 NPM PACKAGES (safe – stay in node_modules):');
    npm.forEach(({ req, count }) => console.log(`   ${req} (${count})`));
}

if (builtin.length > 0) {
    console.log('\n🛠️ BUILT-IN MODULES (safe):');
    builtin.forEach(({ req }) => console.log(`   ${req}`));
}

console.log('\nNext step:');
if (local.length > 0) {
    console.log('1. Tell me the local requires listed above, and I will adjust the merge script to inline them.');
} else {
    console.log('1. You are ready to run the merge script (merge-commands.js).');
}
console.log('2. After merging, test and delete the commands folder.');
