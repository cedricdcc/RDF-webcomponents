import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  
  await page.goto('http://localhost:3000/source-rdf/');

  await page.evaluate(async () => {
    const url = 'https://data.emobon.embrc.eu/';
    
    console.log('Testing fallback fetch Accept header...');
    try {
      const res1 = await fetch(url, {
        headers: {
          Accept: 'text/turtle,application/n-triples,application/n-quads,application/rdf+xml,application/ld+json,text/html'
        }
      });
      console.log('Fallback fetch Status:', res1.status);
    } catch (e) {
      console.log('Fallback fetch ERROR:', e.message);
    }

    console.log('Testing wrx.ts Accept header...');
    try {
      const res2 = await fetch(url, {
        headers: {
          Accept: 'text/turtle,application/ld+json,application/rdf+xml,application/n-triples,text/n3,application/n-quads,application/trig'
        }
      });
      console.log('wrx fetch Status:', res2.status);
    } catch (e) {
      console.log('wrx fetch ERROR:', e.message);
    }
  });

  await browser.close();
})();
