#!/usr/bin/env sh
# Session-start hook of the locker-agentic plugin (Claude Code, Codex, Cursor,
# Antigravity, Grok Build).
#
# It runs one local command, `lpa doctor --format json`, and hands the host a
# short line of context. It installs nothing, writes no file, reaches no
# network of its own, and always exits 0: a session never fails because of it.

set -u

HOST=""
while [ $# -gt 0 ]; do
  case "$1" in
    --host) HOST="${2:-}"; shift 2 ;;
    --host=*) HOST="${1#--host=}"; shift ;;
    *) shift ;;
  esac
done

if [ -n "${GROK_PLUGIN_ROOT:-}" ]; then HOST="grok"; fi
if [ -n "${ANTIGRAVITY_AGENT:-}" ]; then HOST="antigravity"; fi

case "$HOST" in
  claude-code|cursor|codex|antigravity|grok) ;;
  *) HOST="unknown" ;;
esac

PLUGIN_VERSION="2.0.2"

emit() {
  # $1 is plain text, already free of quotes, backslashes and newlines.
  case "$HOST" in
    cursor|unknown) printf '{"additional_context":"%s"}\n' "$1" ;;
    *) printf '{"hookSpecificOutput":{"hookEventName":"SessionStart","additionalContext":"%s"}}\n' "$1" ;;
  esac
  exit 0
}

if ! command -v lpa >/dev/null 2>&1; then
  # Nothing to report and nothing to install: stay silent.
  exit 0
fi

# `lpa doctor` exits non-zero when a check FAILS, and its JSON is the report we
# want most in that case: the output is kept whatever the code says, and the
# hook still exits 0 (a session never fails because of it).
DOCTOR=""
if command -v timeout >/dev/null 2>&1; then
  DOCTOR=$(timeout 15 lpa doctor --format json 2>/dev/null) || true
elif command -v gtimeout >/dev/null 2>&1; then
  DOCTOR=$(gtimeout 15 lpa doctor --format json 2>/dev/null) || true
else
  DOCTOR=$(lpa doctor --format json 2>/dev/null) || true
fi

if [ -z "$DOCTOR" ]; then
  emit "Locker Protocol Agentic: lpa is installed but lpa doctor gave no answer. Run lpa doctor before any perps operation. Plugin ${PLUGIN_VERSION}, host ${HOST}."
fi

if ! command -v node >/dev/null 2>&1; then
  emit "Locker Protocol Agentic: lpa is installed. Run lpa doctor and follow its hints before any perps operation. Plugin ${PLUGIN_VERSION}, host ${HOST}."
fi

SUMMARY=$(
  DOCTOR="$DOCTOR" PLUGIN_VERSION="$PLUGIN_VERSION" HOST="$HOST" node <<'NODE' 2>/dev/null
const raw = process.env.DOCTOR || '';
let data = null;
try {
    data = JSON.parse(raw);
} catch {
    const a = raw.indexOf('{');
    const b = raw.lastIndexOf('}');
    if (a >= 0 && b > a) {
        try { data = JSON.parse(raw.slice(a, b + 1)); } catch { data = null; }
    }
}
const parts = [`Locker Protocol Agentic is installed (plugin ${process.env.PLUGIN_VERSION}, host ${process.env.HOST}).`];
if (!data || !Array.isArray(data.checks)) {
    parts.push('lpa doctor returned something unreadable. Run lpa doctor before any perps operation.');
} else {
    const failed = data.checks.filter((c) => c && c.ok === false);
    const pending = data.checks.filter((c) => c && c.ok === null);
    // Names only: the details carry the account's address, the agent's and the folder's
    // path, and this line goes to the model's provider. lpa doctor tells the rest, locally.
    const named = (list) => list.map((c) => String(c.name).replace(/[^a-z -]/gi, '')).join(', ');
    if (failed.length) parts.push(`Failing checks: ${named(failed)}. Run lpa doctor to see why.`);
    if (pending.length) parts.push(`Not set up yet: ${named(pending)}.`);
    if (!failed.length && !pending.length) parts.push('Every check passes.');
}
parts.push('Paper trading needs no key: lpa paper init --budget 1000. Always quote before opening, show the quote, and never add --yes without the user saying so. lpa init and lpa unlock are typed by the user.');
const text = parts.join(' ').slice(0, 1200);
process.stdout.write(JSON.stringify(text).slice(1, -1));
NODE
)

if [ -z "$SUMMARY" ]; then
  emit "Locker Protocol Agentic: lpa is installed. Run lpa doctor and follow its hints before any perps operation. Plugin ${PLUGIN_VERSION}, host ${HOST}."
fi

emit "$SUMMARY"
