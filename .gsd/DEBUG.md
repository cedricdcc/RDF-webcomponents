# Debug Session: emobon-cors-issue-revisited

## Symptom
The error `RDF parsing failed: Invalid IRI on line 1` still occurs when fetching `https://data.emobon.embrc.eu/` after applying the CORS fix.

**When:** Fetching the URI from `http://localhost:3000/source-rdf/`.
**Expected:** The `wrx` extractor uses the shortened `Accept` header and successfully parses the `metadata.ttl`.
**Actual:** The issue persists, indicating `wrx` is still failing and falling back to a direct fetch that returns HTML.
