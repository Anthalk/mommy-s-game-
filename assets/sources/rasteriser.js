// Convertit chaque SVG d'un dossier en PNG 256x256 transparent
const { chromium } = require('playwright'); const fs = require('fs'), path = require('path');
(async () => {
  const [src, out] = process.argv.slice(2); fs.mkdirSync(out, { recursive: true });
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 256, height: 256 } });
  for (const f of fs.readdirSync(src).filter(f => f.endsWith('.svg'))) {
    const data = fs.readFileSync(path.join(src, f), 'utf8');
    await p.setContent(`<html><body style="margin:0;background:transparent">${data}</body></html>`);
    await p.locator('svg').screenshot({ path: path.join(out, f.replace('.svg', '.png')), omitBackground: true });
  }
  await b.close();
})();
