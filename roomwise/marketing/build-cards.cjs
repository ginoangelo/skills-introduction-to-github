// Builds the shareable image cards in marketing/out/ from the real app screens.
// Run "npm run mockup" first, then: node marketing/build-cards.cjs
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const mock = fs.readFileSync(path.join(root, 'dist', 'mockup.html'), 'utf8').replace(/<p class="frame-note">[\s\S]*?<\/p>/, '');
const page = (body) => '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body>' + body + '</body></html>';

const CARDS = [
  { file: '1-three-budgets.png', kicker: 'Roomwise AI', title: 'Snap a room.<br>Get three rehab budgets.', sub: 'Cosmetic, mid-grade and full, each itemized with materials, local labor and a buffer for surprises.' },
  { file: '2-pick-a-look.png', kicker: 'Step 1', title: 'Tell it the look<br>you are going for.', sub: 'Every room in the project is designed and priced toward it.' },
  { file: '3-diy-plan.png', kicker: 'Do it yourself', title: 'See what you save<br>by doing it yourself.', sub: 'Jobs in the right order, one tool list, one shopping list, and the steps for each.' },
  { file: '4-scope-of-work.png', kicker: 'For contractors', title: 'Hand out a scope of work,<br>not your budget.', sub: 'Every work item and quantity, with a blank column for bids.' },
];

(async () => {
  const browser = await chromium.launch();
  const phone = await browser.newPage({ viewport: { width: 390, height: 800 }, deviceScaleFactor: 2 });
  await phone.setContent(page(mock));
  await phone.waitForTimeout(900);
  const shots = [];
  const snap = async (selector) => {
    if (selector) await phone.$eval(selector, (el) => window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - 12));
    else await phone.evaluate(() => window.scrollTo(0, 0));
    await phone.waitForTimeout(150);
    shots.push('data:image/png;base64,' + (await phone.screenshot()).toString('base64'));
  };
  // 2: look step (taken first, it is the opening screen)
  await phone.click('.lookcard[data-v=farmhouse]');
  await snap();
  const lookShot = shots.pop();
  // 1: kitchen plan with the slider part-way
  await phone.click('text=Next: your room');
  await phone.click('[data-act=estimate]');
  await phone.fill('#split', '46'); await phone.dispatchEvent('#split', 'input');
  await snap('.roombar');
  shots.push(lookShot);
  // 3: DIY plan across two rooms
  await phone.click('[data-act=addroom]'); await phone.click('[data-act=estimate]');
  await phone.check('[id="dc-mid:b_toilet"]');
  await phone.click('.rooms button[data-v="0"]');
  await phone.check('[id="dc-mid:k_demo"]'); await phone.check('[id="dc-mid:k_paint_walls"]'); await phone.check('[id="dc-mid:k_lvp"]');
  await phone.click('.tabs [data-v=diy]');
  await snap('main');
  // 4: scope of work
  await phone.click('[data-act=scope]');
  await snap('main');

  const card = await browser.newPage({ viewport: { width: 1080, height: 1350 }, deviceScaleFactor: 1 });
  for (let i = 0; i < CARDS.length; i++) {
    const c = CARDS[i];
    await card.setContent(page(`<style>
      body{margin:0;width:1080px;height:1350px;background:#f3f0eb;color:#23211e;font-family:"Helvetica Neue",Helvetica,Arial,sans-serif;display:flex;flex-direction:column;overflow:hidden}
      .top{padding:64px 72px 0}
      .k{font:700 24px/1 ui-monospace,Menlo,Consolas,monospace;letter-spacing:.1em;text-transform:uppercase;color:#0f6e73;margin:0 0 20px}
      h1{font-size:68px;line-height:1.04;letter-spacing:-.02em;margin:0 0 22px;font-weight:800}
      p.s{font-size:29px;line-height:1.35;color:#666059;margin:0;max-width:880px}
      .stage{flex:1;display:flex;justify-content:center;align-items:flex-start;padding-top:48px}
      .phone{width:500px;border:12px solid #23211e;border-bottom:0;border-radius:54px 54px 0 0;overflow:hidden;background:#f3f0eb;box-shadow:0 30px 80px -30px rgba(35,33,30,.55)}
      .phone img{display:block;width:100%}
      .foot{position:absolute;left:72px;bottom:40px;font:600 22px/1 ui-monospace,Menlo,Consolas,monospace;color:#23211e;background:#f3f0eb;padding:10px 14px;border-radius:8px;border:1px solid #e0dad0}
    </style>
    <div class="top"><p class="k">${c.kicker}</p><h1>${c.title}</h1><p class="s">${c.sub}</p></div>
    <div class="stage"><div class="phone"><img src="${shots[i]}"></div></div>
    <div class="foot">Prototype · sample numbers</div>`));
    await card.waitForTimeout(200);
    await card.screenshot({ path: path.join(__dirname, 'out', c.file) });
  }
  await browser.close();
  console.log('wrote', CARDS.map((c) => c.file).join(', '));
})();
