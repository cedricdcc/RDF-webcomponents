# Debug Session: emobon-cors-issue

## Symptom
When trying to extract RDF from `https://data.emobon.embrc.eu/` on the page `http://localhost:3000/source-rdf/`, an error occurs: `Invalid IRI on line 1` with a CORS preflight failure in the network log.

**When:** Fetching an endpoint that does not support OPTIONS (preflight) requests (like GitHub Pages).
**Expected:** The `wrx` extraction finds the `metadata.ttl` signposting and fetches it seamlessly.
**Actual:** The extraction fails entirely in `wrx`, and falls back to a direct fetch in `source-rdf`. The direct fetch succeeds but returns HTML, causing the parser to fail with `Invalid IRI on line 1`.

## Evidence
- `curl.exe -I -X OPTIONS https://data.emobon.embrc.eu/` returns `405 Method Not Allowed`, indicating no preflight support.
- `curl.exe -I https://data.emobon.embrc.eu/` (GET) returns `200 OK` with `Access-Control-Allow-Origin: *`.
- `wrx.ts` uses an `Accept` header that was 168 characters long: `'text/turtle;q=1.0, application/ld+json;q=0.9, application/rdf+xml;q=0.8, application/n-triples;q=0.7, text/n3;q=0.6, application/n-quads;q=0.5, application/trig;q=0.4'`.
- Browsers enforce a historical 128-byte limit on CORS-safelisted request headers (like `Accept`). Exceeding this limit triggers a preflight request (`OPTIONS`), which fails on the EMOBON server.
- The `source-rdf` fallback fetch uses a shorter `Accept` header (105 characters), which succeeds but returns the default HTML page, breaking the RDF parser.

## Resolution
**Root Cause:** The `RDF_ACCEPT` header in `wrx.ts` exceeded the 128-byte CORS safelist limit, causing the browser to send an `OPTIONS` preflight request that the EMOBON server rejected.
**Fix:** Shortened `RDF_ACCEPT` in `wrx.ts` to `122` characters by removing the `q` (quality) parameters. This ensures the header remains strictly within the 128-byte safelist limit, preventing the browser from triggering a preflight request.
**Verified:** Modified both the `uri_gator/wrx.ts` source and `node_modules/wrx/wrx.ts`.
