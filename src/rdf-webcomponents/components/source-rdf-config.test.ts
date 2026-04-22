import { describe, expect, it } from 'vitest';
import {
  buildCbdConstructQuery,
  buildSparqlQuery,
  parseSourceRdfConfigRdf,
  validateSourceRdfConfig,
} from './source-rdf-config';

describe('source-rdf config validation', () => {
  it('requires url for file strategy', async () => {
    const rdf = `
      @prefix srdf: <https://cedricdcc.github.io/RDF-webcomponents/ns/source-rdf.ttl#> .
      [] a srdf:SourceRdfConfig ;
        srdf:strategy "file" .
    `;

    const parsed = await parseSourceRdfConfigRdf(rdf, 'turtle', 'test://config.ttl');
    expect(() => validateSourceRdfConfig(parsed.config, parsed.providedKeys)).toThrow(/requires a url/i);
  });

  it('requires exactly one selector for sparql', async () => {
    const rdf = `
      @prefix srdf: <https://cedricdcc.github.io/RDF-webcomponents/ns/source-rdf.ttl#> .
      [] a srdf:SourceRdfConfig ;
        srdf:strategy "sparql" ;
        srdf:url <https://example.org/sparql> ;
        srdf:subject <https://example.org/s1> ;
        srdf:subjectClass <https://example.org/Person> .
    `;

    const parsed = await parseSourceRdfConfigRdf(rdf, 'turtle', 'test://config.ttl');

    expect(() => validateSourceRdfConfig(parsed.config, parsed.providedKeys)).toThrow(
      /exactly one of: subject, subject-query, subject-class/i,
    );
  });

  it('enforces DESCRIBE/CONSTRUCT for subject-query', async () => {
    const rdf = `
      @prefix srdf: <https://cedricdcc.github.io/RDF-webcomponents/ns/source-rdf.ttl#> .
      [] a srdf:SourceRdfConfig ;
        srdf:strategy "sparql" ;
        srdf:url <https://example.org/sparql> ;
        srdf:subjectQuery "SELECT ?s WHERE { ?s ?p ?o }" .
    `;

    const parsed = await parseSourceRdfConfigRdf(rdf, 'turtle', 'test://config.ttl');

    expect(() => validateSourceRdfConfig(parsed.config, parsed.providedKeys)).toThrow(
      /must be a DESCRIBE or CONSTRUCT/i,
    );
  });

  it('accepts CONSTRUCT with PREFIX/BASE preamble', async () => {
    const rdf = `
      @prefix srdf: <https://cedricdcc.github.io/RDF-webcomponents/ns/source-rdf.ttl#> .
      [] a srdf:SourceRdfConfig ;
        srdf:strategy "sparql" ;
        srdf:url <https://example.org/sparql> ;
        srdf:subjectQuery """BASE <https://example.org/>
PREFIX ex: <https://example.org/>
CONSTRUCT { ?s ?p ?o }
WHERE { ?s ?p ?o }""" .
    `;

    const parsed = await parseSourceRdfConfigRdf(rdf, 'turtle', 'test://config.ttl');

    expect(() => validateSourceRdfConfig(parsed.config, parsed.providedKeys)).not.toThrow();
  });

  it('requires subject for cbd', async () => {
    const rdf = `
      @prefix srdf: <https://cedricdcc.github.io/RDF-webcomponents/ns/source-rdf.ttl#> .
      [] a srdf:SourceRdfConfig ;
        srdf:strategy "cbd" ;
        srdf:url <https://example.org/sparql> .
    `;

    const parsed = await parseSourceRdfConfigRdf(rdf, 'turtle', 'test://config.ttl');

    expect(() => validateSourceRdfConfig(parsed.config, parsed.providedKeys)).toThrow(/cbd strategy requires subject/i);
  });

  it('rejects removed graph strategy', async () => {
    const rdf = `
      @prefix srdf: <https://cedricdcc.github.io/RDF-webcomponents/ns/source-rdf.ttl#> .
      [] a srdf:SourceRdfConfig ;
        srdf:strategy "graph" ;
        srdf:url <https://example.org/sparql> .
    `;

    const parsed = await parseSourceRdfConfigRdf(rdf, 'turtle', 'test://config.ttl');

    expect(() => validateSourceRdfConfig(parsed.config, parsed.providedKeys)).toThrow(/Unsupported strategy/i);
  });

  it('warns on irrelevant properties for strategy', async () => {
    const rdf = `
      @prefix srdf: <https://cedricdcc.github.io/RDF-webcomponents/ns/source-rdf.ttl#> .
      [] a srdf:SourceRdfConfig ;
        srdf:strategy "file" ;
        srdf:url <https://example.org/data.ttl> ;
        srdf:subject <https://example.org/unused> .
    `;

    const parsed = await parseSourceRdfConfigRdf(rdf, 'turtle', 'test://config.ttl');

    const warnings = validateSourceRdfConfig(parsed.config, parsed.providedKeys);
    expect(warnings).toHaveLength(1);
    expect(warnings[0]).toMatch(/not used by strategy 'file'/i);
  });

  it('parses headers from RDF config', async () => {
    const rdf = `
      @prefix srdf: <https://cedricdcc.github.io/RDF-webcomponents/ns/source-rdf.ttl#> .
      [] a srdf:SourceRdfConfig ;
        srdf:url <https://example.org/data.ttl> ;
        srdf:headers "{\\"Authorization\\":\\"Bearer token123\\"}" .
    `;

    const parsed = await parseSourceRdfConfigRdf(rdf, 'turtle', 'test://config.ttl');
    expect(parsed.config.headers).toEqual({ Authorization: 'Bearer token123' });
  });

  it('normalizes wrapped IRI literals for url and selectors', async () => {
    const rdf = `
      @prefix srdf: <https://cedricdcc.github.io/RDF-webcomponents/ns/source-rdf.ttl#> .
      [] a srdf:SourceRdfConfig ;
        srdf:strategy "sparql" ;
        srdf:url "<https://example.org/sparql>" ;
        srdf:subject "<https://example.org/s1>" .
    `;

    const parsed = await parseSourceRdfConfigRdf(rdf, 'turtle', 'test://config.ttl');
    expect(parsed.config.url).toBe('https://example.org/sparql');
    expect(parsed.config.subject).toBe('https://example.org/s1');
    expect(() => validateSourceRdfConfig(parsed.config, parsed.providedKeys)).not.toThrow();
  });
});

describe('source-rdf query builders', () => {
  it('builds DESCRIBE query for sparql subject', () => {
    const query = buildSparqlQuery('sparql', {
      url: 'https://example.org/sparql',
      subject: 'https://example.org/s1',
    });

    expect(query).toContain('DESCRIBE <https://example.org/s1>');
  });

  it('avoids double-wrapping bracketed subject values', () => {
    const query = buildSparqlQuery('sparql', {
      url: 'https://example.org/sparql',
      subject: '<https://example.org/s1>',
    });

    expect(query).toContain('DESCRIBE <https://example.org/s1>');
    expect(query).not.toContain('<<https://example.org/s1>>');
  });

  it('rejects invalid IRI characters in subject values', () => {
    expect(() =>
      buildSparqlQuery('sparql', {
        url: 'https://example.org/sparql',
        subject: 'https://example.org/s1> . ?x ?y ?z',
      }),
    ).toThrow(/subject must be a valid absolute IRI/i);
  });

  it('builds CONSTRUCT query for class extraction', () => {
    const query = buildSparqlQuery('sparql', {
      url: 'https://example.org/sparql',
      subjectClass: 'https://example.org/Person',
    });

    expect(query).toContain('CONSTRUCT');
    expect(query).toContain('<https://example.org/Person>');
  });

  it('builds cbd construct query with depth', () => {
    const query = buildCbdConstructQuery('https://example.org/s1', 3);
    expect(query).toContain('CONSTRUCT');
    expect(query).toContain('?p3');
    expect(query).toContain('https://example.org/s1');
  });
});
