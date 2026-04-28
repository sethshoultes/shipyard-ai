const fs = require('fs');
const path = require('path');

function mapAnswersToSchema(answers) {
  const pages = (answers.pages || '').split(',').map(s => s.trim()).filter(Boolean);
  if (pages.length > 5) {
    throw new Error('Scope guardrail: max 5 pages allowed');
  }

  const schema = [
    '# Site Contract',
    '',
    '- business: ' + (answers.business || '').replace(/\n/g, ' '),
    '- audience: ' + (answers.audience || ''),
    '- goal: ' + (answers.goal || ''),
    '- references: ' + (answers.references || 'none'),
    '- pages: ' + pages.join(', '),
    '- pageCount: ' + pages.length,
    '- maxPages: 5',
    '- scope: marketing site',
    '- eCommerce: false',
    '- auth: false',
    '- i18n: false',
    ''
  ].join('\n');

  return schema;
}

function run() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');

  if (dryRun) {
    const demo = {
      business: 'We build AI tools for founders.',
      audience: 'First-time founders',
      goal: 'book',
      references: 'linear.com',
      pages: 'Home, About, Pricing, Contact'
    };
    const out = mapAnswersToSchema(demo);
    console.log(out);
    return;
  }

  const inputPath = path.join(__dirname, 'answers.json');
  if (!fs.existsSync(inputPath)) {
    console.error('No answers.json found at', inputPath);
    process.exit(1);
  }

  const answers = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
  const schema = mapAnswersToSchema(answers);

  const outPath = path.join(__dirname, '..', 'schema', 'template.md');
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, schema, 'utf8');
  console.log('Wrote schema to', outPath);
}

module.exports = { mapAnswersToSchema };

if (require.main === module) {
  run();
}
