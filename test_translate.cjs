const translate = require('@vitalets/google-translate-api').translate;

async function run() {
  const res = await translate('Hello world', { to: 'hi' });
  console.log(res.text);
}
run().catch(console.error);
