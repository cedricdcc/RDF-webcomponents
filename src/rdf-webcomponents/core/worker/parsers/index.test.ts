import { describe, expect, it } from 'vitest';
import { getMimeType, getAcceptHeader } from './index';

describe('Parsers Utils', () => {
  describe('getMimeType', () => {
    it('returns text/turtle for turtle', () => {
      expect(getMimeType('turtle')).toBe('text/turtle');
    });

    it('returns application/n-triples for n-triples', () => {
      expect(getMimeType('n-triples')).toBe('application/n-triples');
    });

    it('returns application/n-quads for n-quads', () => {
      expect(getMimeType('n-quads')).toBe('application/n-quads');
    });

    it('returns application/rdf+xml for rdf-xml', () => {
      expect(getMimeType('rdf-xml')).toBe('application/rdf+xml');
    });

    it('returns application/ld+json for json-ld', () => {
      expect(getMimeType('json-ld')).toBe('application/ld+json');
    });

    it('returns text/html for rdfa', () => {
      expect(getMimeType('rdfa')).toBe('text/html');
    });

    it('returns application/sparql-results+json for sparql-results', () => {
      expect(getMimeType('sparql-results')).toBe('application/sparql-results+json');
    });

    it('defaults to text/turtle for unknown format', () => {
      // @ts-expect-error testing fallback behavior for runtime robustness
      expect(getMimeType('unknown-format')).toBe('text/turtle');
    });
  });

  describe('getAcceptHeader', () => {
    it('returns specific mime type when format is provided', () => {
      expect(getAcceptHeader('turtle')).toBe('text/turtle');
      expect(getAcceptHeader('json-ld')).toBe('application/ld+json');
    });

    it('returns comprehensive default header when no format is provided', () => {
      const defaultHeader = getAcceptHeader();
      expect(defaultHeader).toContain('text/turtle');
      expect(defaultHeader).toContain('application/n-triples');
      expect(defaultHeader).toContain('application/n-quads');
      expect(defaultHeader).toContain('application/rdf+xml');
      expect(defaultHeader).toContain('application/ld+json');
      expect(defaultHeader).toContain('application/sparql-results+json');
      expect(defaultHeader).toContain('application/sparql-results+xml');
    });
  });
});
