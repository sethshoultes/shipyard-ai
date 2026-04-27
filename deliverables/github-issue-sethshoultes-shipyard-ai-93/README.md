# still

Calm, useful commit messages from staged changes.

Install with npm:

```bash
npm install -g still && still install
```

Or use the curl installer:

```bash
curl -sSL https://raw.githubusercontent.com/shipyard-ai/still/main/scripts/install.sh | bash
```

## Usage

Once installed, `still` registers a `prepare-commit-msg` hook. Every time you run `git commit`, a single-line commit message suggestion is written into your editor buffer.

## Commands

- `still install` — register the hook
- `still uninstall` — remove the hook
- `still --version` — print version
- `still --help` — print help
