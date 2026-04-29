# Rebuttal: Round 2

## Where Beauty is the Enemy of Shipping

Steve wrote 29 lines of poetry and zero lines of pseudocode. He named the thing **TRUE** — a word so generic it is unsearchable on npm, ungreppable in logs, and probably trademarked by a 1990s boy band. The "Apollo 11 flight director" metaphor is inspiring until you realize the actual task is reading two files with regex.

Brand voice documents are what you write when you are afraid to write the script.

We both say **NO** to auto-fix, warnings, and config files. The difference is I said it in six lines and he needed a manifesto. That overhead is not free. Every paragraph about "bone-deep confidence" is an engineer-hour not spent on the actual gate.

## Why Simplicity Compounds

My grep script is boring. That is the feature. Boring code survives turnover. Boring code does not need a hand-off doc. When Margaret quits, the next engineer sees `fs.readFileSync` and a RegExp, not a brand guidelines PDF.

Technical simplicity wins because:
- It ships today, not after the naming committee adjourns.
- It has no dependencies to rot.
- It can be deleted without a migration guide.

## Where Steve is Right

Taste matters at the seam between human and machine. The error message should be one crisp sentence. "Your Edge route cannot fly in static export" is better than my draft. I will steal that line.

The name `margaret-check` is descriptive but dull. If we externalize, we can workshop the bin name. Not **TRUE**. Something that passes the npm search test.

## Non-Negotiables

1. **Regex, not AST.** The TS compiler API is a siren song. Resist. Two literal patterns, 5 ms, zero dependencies.
2. **No auto-fix, ever.** Fail loudly. The human moves one file in 30 seconds and learns the constraint.
3. **CI gate, not product.** This is a `build:check` script in `package.json`. If we build a dashboard, we have failed.

Ship the script. Close the issue. Move on.
