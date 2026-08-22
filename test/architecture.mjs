import assert from 'node:assert/strict';
import { readFileSync, existsSync, readdirSync } from 'node:fs';

const core = readFileSync('src/server.ts', 'utf8');
const stdio = readFileSync('src/stdio.ts', 'utf8');
const cli = readFileSync('src/cli.ts', 'utf8');
const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
const hookGuard = readFileSync('hooks/noimg-guard.mjs', 'utf8');

assert.match(core, /createServer/);
assert.match(stdio, /createServer/);
assert.match(cli, /runStdio/);
assert.match(cli, /No network listener\. No remote mode\. No tunnel\./);

for (const path of [
  'src/auth.ts',
  'src/http.ts',
  'src/share.ts',
  'src/worker.ts',
  'wrangler.example.jsonc',
]) {
  assert.equal(existsSync(path), false, `${path} must not exist in the public stdio edition`);
}

const source = `${core}\n${stdio}\n${cli}`;
assert.doesNotMatch(source, /OAuthProvider|Bearer|ngrok|cloudflare|hono|127\.0\.0\.1|0\.0\.0\.0/i);
assert.doesNotMatch(source, /node:(?:http|https|net|tls)|createServer\s*\(.*listen|\.listen\s*\(/i);
assert.doesNotMatch(source, /\bfetch\s*\(/i);

const dependencyNames = Object.keys(pkg.dependencies ?? {}).sort();
assert.deepEqual(dependencyNames, ['@modelcontextprotocol/server', 'zod']);
assert.ok(pkg.files.includes('hooks'));
assert.ok(pkg.files.includes('chatgpt'));
assert.doesNotMatch(hookGuard, /node:(?:http|https|net|tls)|\bfetch\s*\(|\.listen\s*\(/i);

const distFiles = readdirSync('dist').sort();
assert.deepEqual(distFiles, ['cli.js', 'server.js', 'stdio.js']);

console.log('NoIMG stdio-only architecture contracts OK');
