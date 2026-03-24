import { describe, expect, it } from 'vitest';
import { parseLensDisplayConfigRdf, validateLensDisplayConfig } from './lens-display-config';

describe('lens-display config validation', () => {
  it('parses theme and class from RDF config', async () => {
    const rdf = `
      @prefix drdf: <https://cedricdcc.github.io/RDF-webcomponents/ns/lens-display.ttl#> .
      [] a drdf:LensDisplayConfig ;
        drdf:theme "dark" ;
        drdf:class "compact" .
    `;

    const parsed = await parseLensDisplayConfigRdf(rdf, 'turtle', 'test://display-config.ttl');

    expect(parsed.config).toEqual({
      theme: 'dark',
      class: 'compact',
    });
    expect(validateLensDisplayConfig(parsed.config)).toEqual([]);
  });

  it('warns on unknown properties', async () => {
    const rdf = `
      @prefix drdf: <https://cedricdcc.github.io/RDF-webcomponents/ns/lens-display.ttl#> .
      [] a drdf:LensDisplayConfig ;
        drdf:theme "light" ;
        drdf:unused "value" .
    `;

    const parsed = await parseLensDisplayConfigRdf(rdf, 'turtle', 'test://display-config.ttl');
    expect(parsed.warnings).toHaveLength(1);
    expect(parsed.warnings[0]).toMatch(/unknown lens-display property/i);
  });
});
