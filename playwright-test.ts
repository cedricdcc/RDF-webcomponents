import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  page.on('request', req => {
    console.log(`REQ: ${req.method()} ${req.url()} - Headers:`, req.headers());
  });

  page.on('response', res => {
    console.log(`RES: ${res.status()} ${res.url()} - Headers:`, res.headers());
  });

  page.on('console', msg => {
    console.log(`CONSOLE [${msg.type()}]: ${msg.text()}`);
  });

  await page.goto('http://localhost:3000/source-rdf/');

  // Wait for the component to be ready
  await page.waitForTimeout(2000);

  // Set the URI in the input field
  // The structure is roughly <div id="demo"> ... <input id="uri-input"> ... <button id="load-btn">
  // Since we don't know the exact IDs, let's find the input with value matching 'http' and the button next to it.
  // Wait, let's just evaluate a script to do it.
  await page.evaluate(async () => {
    const url = 'https://data.emobon.embrc.eu/';
    const headersToTest = [
      { name: 'No headers', headers: {} },
      { name: 'Fallback Accept', headers: { Accept: 'text/turtle,application/n-triples,application/n-quads,application/rdf+xml,application/ld+json,text/html' } },
      { name: 'Wrx Accept (short)', headers: { Accept: 'text/turtle,application/ld+json,application/rdf+xml,application/n-triples,text/n3,application/n-quads,application/trig' } },
      { name: 'Wrx Linkset Accept', headers: { Accept: 'application/linkset+json;q=1.0, application/ld+json;q=0.9, application/linkset;q=0.8' } }
    ];

    for (const t of headersToTest) {
      console.log(`TESTING: ${t.name}`);
      try {
        const res = await fetch(url, { headers: t.headers, redirect: 'follow' });
        console.log(`  Success! Status: ${res.status}`);
      } catch (e) {
        console.log(`  Error! ${e.message}`);
      }
    }
  });

  await page.waitForTimeout(2000);
  await browser.close();
})();
