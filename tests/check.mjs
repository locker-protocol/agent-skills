#!/usr/bin/env node
// Checks this repository before it is published. No dependency, Node 22 or later.
//
//   node tests/check.mjs
//   LPA_BIN=/path/to/lpa node tests/check.mjs
//
// What it checks:
//   1. every JSON manifest parses and carries the fields its host requires,
//      and every path a manifest points at exists;
//   2. one version everywhere (manifests, the skill's frontmatter, the hook),
//      and no @locker-protocol/... package written with a version: launchers
//      and install lines ask for @latest;
//   3. every relative link of every Markdown file resolves;
//   4. every `lpa <command>` written in the documentation exists in the real
//      CLI, and every `--flag` on that line is one the command's own usage
//      line names (plus the global flags). Needs the CLI: LPA_BIN, or `lpa`
//      on the PATH. Skipped with a message when neither answers;
//   5. every MCP tool name written in the documentation exists;
//   6. the eval files are well formed, with no duplicate id or prompt, and no
//      overlap between the positive and the negative set.
//
// Exit 0 when everything passes, 1 with the list of problems otherwise.

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const problems = [];
const notes = [];
const rel = (p) => path.relative(root, p) || '.';
const fail = (where, what) => problems.push(`${where}: ${what}`);

// ─── The 42 MCP tools of @locker-protocol/agent-wallet-hyperliquid-trader-mcp 2.0.2 ──────────────────────────
// Kept here so the check runs in a clone with nothing installed. The list is
// the `name` of every entry of TOOLS in packages/mcp/src/tools.ts, and can be
// replaced at run time with LPA_MCP_TOOLS (comma separated).
const MCP_TOOLS = (process.env.LPA_MCP_TOOLS
    ? process.env.LPA_MCP_TOOLS.split(',')
    : [
          'perps_venues', 'perps_markets', 'perps_quote', 'perps_positions', 'perps_balance',
          'perps_orders', 'perps_regime', 'perps_ranges', 'perps_open', 'perps_close',
          'perps_cancel', 'perps_modify', 'perps_deposit', 'perps_withdraw', 'perps_transfer',
          'wallet_address', 'wallet_balances', 'paper_init', 'paper_status', 'paper_on',
          'paper_off', 'paper_record', 'paper_replay', 'policy_show', 'mandate_show', 'mandate_sign',
          'mandate_revoke', 'journal', 'status', 'doctor',
          'hyperkeel_status', 'hyperkeel_brief', 'hyperkeel_leaders', 'hyperkeel_follows',
          'hyperkeel_follow', 'hyperkeel_unfollow', 'hyperkeel_alerts',
          'copy_start', 'copy_stop', 'copy_status', 'copy_resume',
          'pilot_status',
      ]
).map((s) => s.trim()).filter(Boolean);

// A token written in the documentation is read as a tool name when it starts
// with one of these prefixes. Tool arguments (all_dexes, order_id, limit_px)
// never do, so they are not mistaken for tools.
const TOOL_PREFIXES = ['perps_', 'wallet_', 'paper_', 'policy_', 'mandate_', 'hyperkeel_', 'copy_', 'pilot_'];
// The arguments of mandate_sign that start like a tool, and are not one.
const ARGUMENTS_LIKE_TOOLS = new Set(['copy_leaders', 'copy_budget', 'copy_only']);

// Flags every command accepts.
const GLOBAL_FLAGS = new Set(['--format', '--json', '--help', '--version']);

// ─── Files ───────────────────────────────────────────────────────────────────

function walk(dir, out = []) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        if (e.name === '.git' || e.name === 'node_modules') continue;
        const full = path.join(dir, e.name);
        if (e.isDirectory()) walk(full, out);
        else out.push(full);
    }
    return out;
}

const files = walk(root);
const markdown = files.filter((f) => f.endsWith('.md')).sort();
const jsonFiles = files.filter((f) => f.endsWith('.json')).sort();

// ─── 1. Manifests ────────────────────────────────────────────────────────────

const REQUIRED = {
    'plugin.json': ['name', 'version', 'description', 'license'],
    '.claude-plugin/plugin.json': ['name', 'version', 'description', 'license', 'skills', 'hooks', 'mcpServers'],
    '.claude-plugin/marketplace.json': ['name', 'owner.name', 'plugins.0.name', 'plugins.0.source', 'plugins.0.version'],
    '.codex-plugin/plugin.json': ['name', 'version', 'description', 'skills', 'hooks', 'interface.displayName', 'interface.privacyPolicyURL'],
    '.cursor-plugin/plugin.json': ['name', 'version', 'description', 'skills', 'hooks'],
    '.grok-plugin/plugin.json': ['name', 'version', 'description', 'skills', 'hooks'],
    '.grok-plugin/marketplace.json': ['name', 'owner.name', 'plugins.0.name', 'plugins.0.source', 'plugins.0.version'],
    '.antigravity-plugin/plugin.json': ['$schema', 'name', 'description'],
    '.antigravity-plugin/hooks.json': ['hooks.SessionStart.0.hooks.0.command'],
    '.agents/plugins/marketplace.json': ['name', 'plugins.0.name', 'plugins.0.source.path'],
    '.mcp.json': ['mcpServers.locker.command', 'mcpServers.locker.args'],
    'gemini-extension.json': ['name', 'version', 'description', 'contextFileName', 'mcpServers.locker.command'],
    'hooks.json': ['hooks.sessionStart.0.command'],
    'hooks/hooks.json': ['hooks.SessionStart.0.hooks.0.command'],
    'hooks/codex-hooks.json': ['hooks.SessionStart.0.hooks.0.command'],
    'hooks/grok-hooks.json': ['hooks.SessionStart.0.hooks.0.command'],
    'hooks/antigravity-hooks.json': ['hooks.SessionStart.0.hooks.0.command'],
};

const dig = (o, dotted) => dotted.split('.').reduce((v, k) => (v === undefined || v === null ? undefined : v[k]), o);

const parsed = new Map();
for (const f of jsonFiles) {
    try {
        parsed.set(rel(f), JSON.parse(fs.readFileSync(f, 'utf8')));
    } catch (e) {
        fail(rel(f), `not valid JSON: ${e.message}`);
    }
}

for (const [name, fields] of Object.entries(REQUIRED)) {
    const doc = parsed.get(name);
    if (doc === undefined) {
        if (!fs.existsSync(path.join(root, name))) fail(name, 'missing');
        continue;
    }
    for (const field of fields) {
        const v = dig(doc, field);
        if (v === undefined || v === null || v === '' || (Array.isArray(v) && v.length === 0)) fail(name, `missing field ${field}`);
    }
}

// The paths a manifest points at must exist.
const POINTERS = [
    ['.claude-plugin/plugin.json', 'skills'],
    ['.claude-plugin/plugin.json', 'hooks'],
    ['.claude-plugin/plugin.json', 'mcpServers'],
    ['.codex-plugin/plugin.json', 'skills'],
    ['.codex-plugin/plugin.json', 'hooks'],
    ['.cursor-plugin/plugin.json', 'skills'],
    ['.cursor-plugin/plugin.json', 'hooks'],
    ['.grok-plugin/plugin.json', 'skills'],
    ['.grok-plugin/plugin.json', 'hooks'],
    ['gemini-extension.json', 'contextFileName'],
];
for (const [file, field] of POINTERS) {
    const doc = parsed.get(file);
    if (!doc) continue;
    const target = dig(doc, field);
    if (typeof target !== 'string') continue;
    if (!fs.existsSync(path.join(root, target))) fail(file, `${field} points at ${target}, which does not exist`);
}

// The plugin name is the same in every manifest that names one, and matches
// the skill folder.
const pluginName = dig(parsed.get('.claude-plugin/plugin.json') ?? {}, 'name');
for (const [file, field] of [
    ['plugin.json', 'name'],
    ['.codex-plugin/plugin.json', 'name'],
    ['.cursor-plugin/plugin.json', 'name'],
    ['.grok-plugin/plugin.json', 'name'],
    ['.antigravity-plugin/plugin.json', 'name'],
    ['gemini-extension.json', 'name'],
    ['.claude-plugin/marketplace.json', 'plugins.0.name'],
    ['.grok-plugin/marketplace.json', 'plugins.0.name'],
    ['.agents/plugins/marketplace.json', 'plugins.0.name'],
]) {
    const doc = parsed.get(file);
    if (!doc) continue;
    const v = dig(doc, field);
    if (v !== pluginName) fail(file, `${field} is "${v}", not "${pluginName}"`);
}
if (!fs.existsSync(path.join(root, 'skills', pluginName, 'SKILL.md'))) fail('skills/', `no SKILL.md for the plugin "${pluginName}"`);

// The MCP launchers ask for @latest, never a version: a client then starts the newest release
// each time, and a release needs no edit of anyone's configuration (decision of 5 October 2026).
for (const [file, field] of [
    ['.mcp.json', 'mcpServers.locker.args'],
    ['gemini-extension.json', 'mcpServers.locker.args'],
]) {
    const args = dig(parsed.get(file) ?? {}, field);
    if (!Array.isArray(args)) continue;
    const pkg = args.find((a) => typeof a === 'string' && a.startsWith('@locker-protocol/'));
    if (!pkg) fail(file, 'the launcher does not name a @locker-protocol package');
    else if (!pkg.endsWith('@latest')) fail(file, `the launcher "${pkg}" does not ask for @latest`);
}

// ─── 2. One version everywhere ───────────────────────────────────────────────

const VERSION = dig(parsed.get('.claude-plugin/plugin.json') ?? {}, 'version');
const seenVersions = [];
const sawVersion = (where, v) => seenVersions.push([where, v]);

for (const [name, doc] of parsed) {
    if (typeof doc?.version === 'string') sawVersion(`${name} version`, doc.version);
    if (typeof doc?.metadata?.version === 'string') sawVersion(`${name} metadata.version`, doc.metadata.version);
    if (Array.isArray(doc?.plugins)) {
        doc.plugins.forEach((p, i) => {
            if (typeof p?.version === 'string') sawVersion(`${name} plugins.${i}.version`, p.version);
        });
    }
}

function frontmatter(text) {
    const m = /^---\n([\s\S]*?)\n---\n/.exec(text);
    if (!m) return null;
    const out = {};
    for (const line of m[1].split('\n')) {
        const kv = /^(\s*)([A-Za-z_][A-Za-z0-9_]*):\s*(.*)$/.exec(line);
        if (!kv) continue;
        const key = (kv[1].length > 0 ? 'metadata.' : '') + kv[2];
        out[key] = kv[3].trim().replace(/^"(.*)"$/, '$1');
    }
    return out;
}

const skillPath = path.join(root, 'skills', String(pluginName), 'SKILL.md');
if (fs.existsSync(skillPath)) {
    const fm = frontmatter(fs.readFileSync(skillPath, 'utf8'));
    if (!fm) fail(rel(skillPath), 'no YAML frontmatter');
    else {
        for (const key of ['name', 'description', 'license']) if (!fm[key]) fail(rel(skillPath), `frontmatter is missing ${key}`);
        if (fm.name !== pluginName) fail(rel(skillPath), `frontmatter name is "${fm.name}", not "${pluginName}"`);
        if (fm['metadata.version']) sawVersion(`${rel(skillPath)} metadata.version`, fm['metadata.version']);
        if (fm['metadata.cliVersion']) sawVersion(`${rel(skillPath)} metadata.cliVersion`, fm['metadata.cliVersion']);
    }
}

const hookSrc = fs.existsSync(path.join(root, 'hooks/session-start.sh')) ? fs.readFileSync(path.join(root, 'hooks/session-start.sh'), 'utf8') : '';
const hookVersion = /PLUGIN_VERSION="([^"]+)"/.exec(hookSrc);
if (hookVersion) sawVersion('hooks/session-start.sh PLUGIN_VERSION', hookVersion[1]);
else if (hookSrc) fail('hooks/session-start.sh', 'no PLUGIN_VERSION');

// No package written anywhere with a version: what a reader copies installs or starts the newest release.
for (const f of [...markdown, ...jsonFiles]) {
    const text = fs.readFileSync(f, 'utf8');
    for (const m of text.matchAll(/@locker-protocol\/[a-z-]+@([0-9][^\s"'`)\],]*)/g)) fail(rel(f), `${m[0]} names a version: write @latest`);
}

for (const [where, v] of seenVersions) {
    if (v !== VERSION) fail(where, `is ${v}, not ${VERSION}`);
}

if (fs.existsSync(path.join(root, 'CHANGELOG.md'))) {
    const changelog = fs.readFileSync(path.join(root, 'CHANGELOG.md'), 'utf8');
    if (!new RegExp(`^##\\s+${VERSION.replace(/\./g, '\\.')}\\s*$`, 'm').test(changelog)) fail('CHANGELOG.md', `no section for ${VERSION}`);
}

// ─── 3. Relative links ───────────────────────────────────────────────────────

for (const f of markdown) {
    const text = fs.readFileSync(f, 'utf8');
    for (const m of text.matchAll(/\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g)) {
        const href = m[1];
        if (/^(https?:|mailto:|#)/.test(href)) continue;
        const target = decodeURI(href.split('#')[0]);
        if (!target) continue;
        const resolved = path.resolve(path.dirname(f), target);
        if (!fs.existsSync(resolved)) fail(rel(f), `link ${href} does not resolve`);
    }
}

// ─── Commands and tools written in the documentation ─────────────────────────

/** Every line of Markdown that is a command line: fenced code, and inline code spans. */
function commandLines(text) {
    const out = [];
    let fenced = false;
    for (const raw of text.split('\n')) {
        if (/^\s*```/.test(raw)) { fenced = !fenced; continue; }
        if (fenced) {
            out.push(raw.replace(/^\s*(?:Usage:\s*)?/, '').replace(/^[$>]\s+/, ''));
        } else {
            for (const m of raw.matchAll(/`([^`]+)`/g)) out.push(m[1].replace(/^\s*(?:Usage:\s*)?/, ''));
        }
    }
    return out.map((l) => l.trim()).filter((l) => l === 'lpa' || l.startsWith('lpa '));
}

function addTokens(into, text) {
    for (const tok of String(text).split(/[^A-Za-z0-9_]+/)) {
        if (TOOL_PREFIXES.some((p) => tok.startsWith(p)) && !ARGUMENTS_LIKE_TOOLS.has(tok)) into.add(tok);
    }
}

/** Tool names written in a Markdown file: the whole line inside a fenced block,
 *  the inline code spans outside one. Fences are tracked line by line, because
 *  a fence's three backticks throw off any regex that pairs them. */
function toolTokens(text) {
    const out = new Set();
    let fenced = false;
    for (const raw of text.split('\n')) {
        if (/^\s*```/.test(raw)) { fenced = !fenced; continue; }
        if (fenced) addTokens(out, raw);
        else for (const m of raw.matchAll(/`([^`]+)`/g)) addTokens(out, m[1]);
    }
    return out;
}

// ─── 5. MCP tool names ───────────────────────────────────────────────────────

const known = new Set(MCP_TOOLS);
if (MCP_TOOLS.length !== 42) fail('tests/check.mjs', `the MCP tool list holds ${MCP_TOOLS.length} names, expected 42`);
let toolsSeen = 0;
for (const f of markdown) {
    for (const tok of toolTokens(fs.readFileSync(f, 'utf8'))) {
        toolsSeen++;
        if (!known.has(tok)) fail(rel(f), `MCP tool "${tok}" does not exist`);
    }
}
for (const name of ['positive.json', 'negative.json']) {
    const full = path.join(root, 'tests/evals', name);
    if (!fs.existsSync(full)) continue;
    const set = new Set();
    addTokens(set, fs.readFileSync(full, 'utf8'));
    for (const tok of set) {
        toolsSeen++;
        if (!known.has(tok)) fail(`tests/evals/${name}`, `MCP tool "${tok}" does not exist`);
    }
}
if (toolsSeen === 0) fail('tests/check.mjs', 'no MCP tool name was found in the documentation: the reader is broken');

// ─── 4. Commands and flags against the real CLI ──────────────────────────────

const LPA_BIN = process.env.LPA_BIN || 'lpa';

function lpa(args) {
    return execFileSync(LPA_BIN, args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], timeout: 30000 });
}

let cliOk = true;
let help = '';
try {
    help = lpa(['--help']);
} catch (e) {
    cliOk = false;
    notes.push(`The CLI check was skipped: ${LPA_BIN} did not answer --help (${e.code || e.message}). Set LPA_BIN to the lpa binary, or install @locker-protocol/agent-wallet-hyperliquid-trader, to check every command and flag.`);
}

if (cliOk) {
    const paths = [];
    for (const line of help.split('\n')) {
        const m = /^\s{2}lpa ([a-z][a-z0-9 -]*?)\s{2,}/.exec(line);
        if (m) paths.push(m[1].trim().split(/\s+/));
    }
    if (paths.length === 0) { cliOk = false; fail('tests/check.mjs', `${LPA_BIN} --help listed no command`); }

    const flagsOf = new Map();
    const usageFlags = (segs) => {
        const key = segs.join(' ');
        if (flagsOf.has(key)) return flagsOf.get(key);
        let set = new Set();
        try {
            const out = lpa([...segs, '--help']);
            const usage = /^Usage: lpa .*$/m.exec(out);
            if (usage) for (const m of usage[0].matchAll(/--[a-z0-9][a-z0-9-]*/g)) set.add(m[0]);
        } catch {
            set = null;
        }
        flagsOf.set(key, set);
        return set;
    };

    const groupWord = (w) => {
        try {
            if (w === 'help') return /^Commands:$/m.test(lpa(['help']));
            return new RegExp(`^Usage: lpa ${w} <command>$`, 'm').test(lpa([w, '--help']));
        } catch {
            return false;
        }
    };

    const longest = (tokens) => {
        let best = null;
        for (const p of paths) {
            if (p.length <= tokens.length && p.every((seg, i) => tokens[i] === seg) && (!best || p.length > best.length)) best = p;
        }
        return best;
    };

    let linesSeen = 0;
    for (const f of markdown) {
        for (const line of commandLines(fs.readFileSync(f, 'utf8'))) {
            linesSeen++;
            const tokens = line.split(/\s+/).slice(1);
            const words = [];
            for (const t of tokens) { if (t.startsWith('-')) break; words.push(t); }
            if (words.some((w) => w.startsWith('<') || w.startsWith('['))) continue; // a placeholder, not a command
            if (words.length === 0) continue; // `lpa` alone opens the session
            const cmd = longest(words);
            // A group word alone lists its commands, and `lpa help` is the whole list: the
            // binary says so itself, so the line is good when its answer is that list.
            if (!cmd && words.length === 1 && groupWord(words[0])) continue;
            if (!cmd) { fail(rel(f), `\`${line}\`: lpa has no command "${words.join(' ')}"`); continue; }
            const allowed = usageFlags(cmd);
            if (allowed === null) { fail(rel(f), `\`${line}\`: lpa ${cmd.join(' ')} --help failed`); continue; }
            for (const raw of tokens) {
                if (!raw.includes('--')) continue;
                const flag = (raw.match(/--[a-z0-9][a-z0-9-]*/) || [])[0];
                if (!flag) continue;
                if (GLOBAL_FLAGS.has(flag) || allowed.has(flag)) continue;
                fail(rel(f), `\`${line}\`: lpa ${cmd.join(' ')} has no flag ${flag}`);
            }
        }
    }
    if (linesSeen === 0) fail('tests/check.mjs', 'no `lpa ...` line was found in the documentation: the reader is broken');
}

// ─── 6. Evals ────────────────────────────────────────────────────────────────

function loadEvals(name) {
    const full = path.join(root, 'tests/evals', name);
    if (!fs.existsSync(full)) { fail(`tests/evals/${name}`, 'missing'); return []; }
    try {
        const data = JSON.parse(fs.readFileSync(full, 'utf8'));
        if (!Array.isArray(data)) { fail(`tests/evals/${name}`, 'is not an array'); return []; }
        return data;
    } catch (e) {
        fail(`tests/evals/${name}`, `not valid JSON: ${e.message}`);
        return [];
    }
}

const positive = loadEvals('positive.json');
const negative = loadEvals('negative.json');
if (positive.length < 15) fail('tests/evals/positive.json', `holds ${positive.length} cases, at least 15 are required`);
if (negative.length < 15) fail('tests/evals/negative.json', `holds ${negative.length} cases, at least 15 are required`);

const ids = new Map();
const prompts = new Map();
const norm = (s) => String(s).toLowerCase().replace(/\s+/g, ' ').trim();

for (const [kind, list] of [['positive', positive], ['negative', negative]]) {
    list.forEach((item, i) => {
        const where = `tests/evals/${kind}.json[${i}]`;
        if (typeof item !== 'object' || item === null) { fail(where, 'is not an object'); return; }
        for (const key of ['id', 'prompt', 'expectedSkill', 'expectedBehavior', 'expectedResultShape']) {
            if (typeof item[key] !== 'string' || item[key].trim() === '') fail(where, `missing ${key}`);
        }
        if (kind === 'positive' && (typeof item.fixtures !== 'object' || item.fixtures === null)) fail(where, 'missing fixtures');
        if (kind === 'negative' && (typeof item.whyNot !== 'string' || item.whyNot.trim() === '')) fail(where, 'missing whyNot');
        if (typeof item.id === 'string') {
            if (ids.has(item.id)) fail(where, `duplicate id ${item.id}, already in ${ids.get(item.id)}`);
            else ids.set(item.id, where);
        }
        if (typeof item.prompt === 'string') {
            const key = norm(item.prompt);
            if (prompts.has(key)) fail(where, `this prompt is already in ${prompts.get(key)}: positive and negative must not overlap`);
            else prompts.set(key, where);
        }
    });
}

// --- What the agent key cannot do, said exactly --------------------------------
//
// Hyperliquid refuses the agent key every withdrawal and every send, and ACCEPTS a
// deposit into a Hyperliquid vault from it (measured on mainnet, 2026-09-28): a line
// saying the key "cannot withdraw or send funds", "cannot send at all" or is refused
// "transfers" promises more than the exchange does.
{
    const OVERCLAIMS = [/cannot withdraw or send funds/i, /cannot send at all/i, /refuses (?:it|that key|the agent key) for withdrawals, sends and transfers/i, /can never withdraw or send funds/i];
    for (const f of files) {
        if (!/\.(md|json)$/.test(f)) continue;
        fs.readFileSync(f, 'utf8').split('\n').forEach((line, i) => {
            for (const re of OVERCLAIMS) if (re.test(line)) fail(`${rel(f)} line ${i + 1}`, `says more than Hyperliquid does about the agent key (${re.source}): it accepts a deposit into a Hyperliquid vault`);
        });
    }
}

// ─── The session hook keeps the user's details at home ─────────────────────
//
// The hook's line goes to the host's model, and so to its provider: it names
// the checks that fail or wait, never their details, which carry the account's
// address, the agent's and the folder's path. Run for real, with a stand-in
// `lpa` on the PATH that answers a doctor report full of such details.

{
    const bin = fs.mkdtempSync(path.join(os.tmpdir(), 'hook-check-'));
    try {
        const report = JSON.stringify({ ok: false, checks: [
            { name: 'home', ok: false, detail: '/Users/someone/.lpa mode 755 (expected 700)' },
            { name: 'account', ok: true, detail: '0x1111111111111111111111111111111111111111 (m/44/60/0/0/0)' },
            { name: 'agent', ok: false, detail: '0x2222222222222222222222222222222222222222 expired: run lpa init again' },
            { name: 'pending agent', ok: null, detail: '0x3333333333333333333333333333333333333333, from an interrupted lpa init' },
        ] });
        fs.writeFileSync(path.join(bin, 'lpa'), `#!/bin/sh\nprintf '%s' '${report.replace(/'/g, "'\\''")}'\nexit 1\n`, { mode: 0o755 });
        const out = execFileSync('sh', [path.join(root, 'hooks', 'session-start.sh'), '--host', 'claude-code'], { env: { ...process.env, PATH: `${bin}:${process.env.PATH}` }, encoding: 'utf8' });
        const line = JSON.parse(out).hookSpecificOutput?.additionalContext ?? '';
        if (!line.includes('Failing checks: home, agent')) fail('hooks/session-start.sh', `the line should name the failing checks, got: ${line}`);
        if (/0x[0-9a-fA-F]{6}|\/Users\/|\/home\//.test(line)) fail('hooks/session-start.sh', `the line carries an address or a path of the user: ${line}`);
    } catch (e) {
        fail('hooks/session-start.sh', `could not be run: ${e.message}`);
    } finally {
        fs.rmSync(bin, { recursive: true, force: true });
    }
}

// ─── Report ──────────────────────────────────────────────────────────────────

for (const n of notes) console.log(`note: ${n}`);

if (problems.length) {
    console.error(`\ncheck failed, ${problems.length} problem${problems.length > 1 ? 's' : ''}:`);
    for (const p of problems) console.error(`- ${p}`);
    process.exit(1);
}

console.log(
    `check: ok (${jsonFiles.length} JSON files, ${markdown.length} Markdown files, version ${VERSION}, ` +
        `${MCP_TOOLS.length} MCP tools, ${positive.length} positive and ${negative.length} negative evals` +
        `${cliOk ? `, commands and flags checked against ${LPA_BIN}` : ', CLI check skipped'})`,
);
