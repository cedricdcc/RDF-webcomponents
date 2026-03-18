import { describe, expect, it } from 'vitest';
import { parseRdfLensConfigRdf, validateRdfLensConfig } from './rdf-lens-config';

describe('rdf-lens config validation', () => {
  it('requires shapeFile or shapes', async () => {
    const rdf = `
      @prefix lrdf: <https://cedricdcc.github.io/RDF-webcomponents/ns/rdf-lens.ttl#> .
      [] a lrdf:RdfLensConfig ;
        lrdf:shapeClass <https://example.org/Person> .
    `;

    const parsed = await parseRdfLensConfigRdf(rdf, 'turtle', 'test://config.ttl');
    expect(() => validateRdfLensConfig(parsed.config)).toThrow(/requires either shapeFile or shapes/i);
  });

  it('parses boolean and iri properties', async () => {
    const rdf = `
      @prefix lrdf: <https://cedricdcc.github.io/RDF-webcomponents/ns/rdf-lens.ttl#> .
      [] a lrdf:RdfLensConfig ;
        lrdf:shapeFile <https://example.org/shapes.ttl> ;
        lrdf:shapeClass <https://example.org/Person> ;
        lrdf:multiple true ;
        lrdf:strict false ;
        lrdf:subject <https://example.org/person/1> .
    `;

    const parsed = await parseRdfLensConfigRdf(rdf, 'turtle', 'test://config.ttl');

    expect(parsed.config).toEqual({
      shapeFile: 'https://example.org/shapes.ttl',
      shapeClass: 'https://example.org/Person',
      multiple: true,
      strict: false,
      subject: 'https://example.org/person/1',
    });
    expect(validateRdfLensConfig(parsed.config)).toEqual([]);
  });

  it('warns on unknown properties including validate', async () => {
    const rdf = `
      @prefix lrdf: <https://cedricdcc.github.io/RDF-webcomponents/ns/rdf-lens.ttl#> .
      [] a lrdf:RdfLensConfig ;
        lrdf:shapeFile <https://example.org/shapes.ttl> ;
        lrdf:validate true ;
        lrdf:extra "ignored" .
    `;

    const parsed = await parseRdfLensConfigRdf(rdf, 'turtle', 'test://config.ttl');

    expect(parsed.warnings).toHaveLength(2);
    expect(parsed.warnings.join(' ')).toMatch(/validate/i);
    expect(parsed.warnings.join(' ')).toMatch(/extra/i);
  });
});
