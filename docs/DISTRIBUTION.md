# Where this repository is listed, and how

Version 2.0.2. Every line below is the real channel, with what it needs from this repository.

## 1. Our own Claude Code marketplace

Claude Code reads a marketplace from any GitHub repository that carries `.claude-plugin/marketplace.json`. This repository is that marketplace, so no directory review stands between a user and the plugin:

```
/plugin marketplace add locker-protocol/agent-skills
/plugin install locker-agentic@locker-protocol
```

`locker-protocol` is the marketplace name in [`../.claude-plugin/marketplace.json`](../.claude-plugin/marketplace.json); `locker-agentic` is the plugin name in [`../.claude-plugin/plugin.json`](../.claude-plugin/plugin.json). The plugin bundles three things: the skill (`skills/`), the session-start hook (`hooks/hooks.json`), and the MCP server ([`../.mcp.json`](../.mcp.json), started as `npx -y --ignore-scripts @locker-protocol/agent-wallet-hyperliquid-trader-mcp@latest`). The launcher is pinned to an exact version, which the plugin checklist requires.

Before every release: `claude plugin validate .`, then a local install with `claude --plugin-dir .`.

## 2. The skills CLI

```sh
npx skills add locker-protocol/agent-skills
```

This installs `skills/locker-agentic/` into any host that reads `.agents/skills`, without the hook or the MCP server. Verified on a clean machine before each release.

## 3. Codex, and the mirror repository

Codex reads the same layout from `.codex-plugin/plugin.json` and `hooks/codex-hooks.json`:

```sh
codex plugin marketplace add locker-protocol/agent-skills
codex plugin add locker-agentic@locker-protocol
```

Codex skips a plugin's hooks until the user reviews and trusts them. The MCP server is configured separately, in `~/.codex/config.toml`, at `@latest` the same way. The Codex marketplace expects a repository of its own: `locker-protocol/agentic-codex-plugin` mirrors this one, with the same skill and the Codex manifest, and is republished from here at each release.

## 4. Cursor

`.cursor-plugin/plugin.json` and the root `hooks.json`. Users add the repository from Git under **Customize > Plugins**. The listing form is at https://cursor.com/marketplace. What review looks for: a kebab-case name, an honest description, a README, relative paths only, no committed secrets, and a documented hook that installs nothing.

## 5. Antigravity

`.antigravity-plugin/plugin.json` follows Google's schema (https://antigravity.google/docs/plugins), with its rule file in `.antigravity-plugin/rules/` and its hook in `.antigravity-plugin/hooks.json`. Local install:

```sh
agy plugin install https://github.com/locker-protocol/agent-skills
```

Install the repository root, so `skills/` and `hooks/session-start.sh` are on the plugin path. The Antigravity marketplace is entered through a form, which the owner submits.

## 6. Gemini CLI

[`../gemini-extension.json`](../gemini-extension.json) at the root makes this repository a Gemini CLI extension: it starts `npx -y --ignore-scripts @locker-protocol/agent-wallet-hyperliquid-trader-mcp@latest` and loads [`../GEMINI.md`](../GEMINI.md) as its context file.

```sh
gemini extensions install https://github.com/locker-protocol/agent-skills
```

The public gallery indexes repositories carrying the GitHub topic `gemini-cli-extension`, which this repository must be tagged with. Gemini CLI was superseded by Antigravity on 2026-06-18; the gallery is still indexed and needs no review, so both channels are used.

## 7. Grok Build

`.grok-plugin/plugin.json`, `.grok-plugin/marketplace.json` and `hooks/grok-hooks.json`, same content as the others. `.agents/plugins/marketplace.json` serves the hosts that read the shared agent-plugins layout.

## 8. The MCP Registry

The server itself, not this repository, is listed in the official registry at `registry.modelcontextprotocol.io`, under the namespace `io.github.locker-protocol`, from `packages/mcp/server.json` of the source tree. Its name is `io.github.locker-protocol/agentic`, and the npm package carries the matching `mcpName` field. Its description there is: "Hyperliquid perps for AI agents. The agent trades; the keys stay offline in Locker Vault."

## Why not the official Claude and ChatGPT directories

Both forbid what this software does, in as many words. We read their policies rather than submit and be refused.

**Anthropic Software Directory Policy**, section 4.A, Unsupported Use Cases, dated 15 April 2026 (https://support.claude.com/en/articles/13145358-anthropic-software-directory-policy):

> Software that transfers money, cryptocurrency, or other financial assets, or executes financial transactions on behalf of users.

**OpenAI app submission guidelines**, "Prohibited fraudulent, deceptive, or high-risk services" (https://developers.openai.com/apps-sdk/app-submission-guidelines), which list among the prohibited:

> Execution of money transfers, crypto transfers, or investment trades

Two more facts from the same reading, on 2026-09-29: Anthropic no longer accepts a local server as a `.mcpb` bundle, only inside a plugin bundle, which the chat on claude.ai ignores; and ChatGPT requires a remote HTTPS server, which a wallet whose whole point is to run on the user's own machine cannot be.

So the distribution is the open channels plus our own marketplace, which is what sections 1 to 8 describe.

The compliance work was done anyway, because it is good for every client: four boolean annotations on every MCP tool, tool descriptions that describe and never instruct the model, launchers that run no install script (`--ignore-scripts`) everywhere, and a Privacy Policy section in each README.
