import { afterEach, describe, expect, it, vi } from 'vitest';

describe('fetchRdfWithWrxFallback', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.resetModules();
  });

  it('uses wrx extraction when available', async () => {
    vi.doMock('wrx', () => ({
      extractRDF: vi.fn().mockResolvedValue({
        content: '@prefix ex: <https://example.org/> .',
        format: 'text/turtle',
        url: 'https://example.org/metadata.ttl',
      }),
    }));

    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    const consoleLogMock = vi.spyOn(console, 'log').mockImplementation(() => {});
    const consoleWarnMock = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const { fetchRdfWithWrxFallback } = await import('./source-rdf-fetch');
    const result = await fetchRdfWithWrxFallback('https://example.org/resource', {});

    expect(result).toEqual({
      content: '@prefix ex: <https://example.org/> .',
      contentType: 'text/turtle',
      url: 'https://example.org/metadata.ttl',
    });
    expect(fetchMock).not.toHaveBeenCalled();
    expect(consoleLogMock).toHaveBeenCalledWith(
      expect.stringContaining('wrx extracted RDF from https://example.org/resource'),
    );
    expect(consoleWarnMock).not.toHaveBeenCalled();
  });

  it('falls back to direct fetch when wrx returns null', async () => {
    vi.doMock('wrx', () => ({
      extractRDF: vi.fn().mockResolvedValue(null),
    }));

    const fetchMock = vi.fn().mockResolvedValue(
      new Response('<https://example.org/s> <https://example.org/p> "o" .', {
        status: 200,
        headers: { 'Content-Type': 'application/n-triples' },
      }),
    );
    vi.stubGlobal('fetch', fetchMock);
    const consoleWarnMock = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const { fetchRdfWithWrxFallback } = await import('./source-rdf-fetch');
    const result = await fetchRdfWithWrxFallback('https://example.org/resource', {
      Authorization: 'Bearer token',
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith('https://example.org/resource', {
      headers: expect.objectContaining({
        Accept:
          'text/turtle,application/n-triples,application/n-quads,application/rdf+xml,application/ld+json,text/html',
        Authorization: 'Bearer token',
      }),
    });
    expect(result.contentType).toBe('application/n-triples');
    expect(result.url).toBe('https://example.org/resource');
    expect(consoleWarnMock).toHaveBeenCalledWith(
      expect.stringContaining('wrx returned no RDF content for https://example.org/resource'),
    );
  });

  it('falls back to direct fetch when wrx throws', async () => {
    vi.doMock('wrx', () => ({
      extractRDF: vi.fn().mockRejectedValue(new Error('wrx failed')),
    }));

    const fetchMock = vi.fn().mockResolvedValue(
      new Response('@prefix ex: <https://example.org/> . ex:s ex:p ex:o .', {
        status: 200,
        headers: { 'Content-Type': 'text/turtle' },
      }),
    );
    vi.stubGlobal('fetch', fetchMock);
    const consoleWarnMock = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const { fetchRdfWithWrxFallback } = await import('./source-rdf-fetch');
    const result = await fetchRdfWithWrxFallback('https://example.org/resource', {});

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(result.contentType).toBe('text/turtle');
    expect(consoleWarnMock).toHaveBeenCalledWith(
      expect.stringContaining('wrx extraction threw for https://example.org/resource'),
    );
  });
});
