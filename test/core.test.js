import { describe, it, expect, vi } from 'vitest';
import core from '../src/core.js';

const {
  pgpsLocale, pgpsT, pgpsStrings, pgpsDeveloperUrl, pgpsErrorText, pgpsIsStoppingError, pgpsNormalizeReference,
  pgpsNormalizeCountry, pgpsToNumber, pgpsParcelRequest, pgpsPointRequest, pgpsParseResponse, pgpsClassifyThrown,
  pgpsPolygonArea, pgpsParcelSummary, pgpsPointSummary, pgpsCreateService, pgpsResultRow, pgpsSingleValue,
  pgpsFlattenColumn, pgpsFormulaSingle, pgpsFormulaRow, pgpsPointFormula, pgpsFillHeaders, pgpsFillChunk,
  pgpsMaskKey, PGPS_MESSAGES, PGPS_INFO_FIELDS, PGPS_CACHE_TTL_SECONDS, PGPS_DEVELOPER_URL, PGPS_DEVELOPER_URL_ES,
} = core;

const MADRID = {
  refCatastral: '9872023VH5797S0001WX',
  pais: 'ES',
  municipio: 'MADRID',
  latitud: 40.4169,
  longitud: -3.7035,
  superficieParcela: 1520,
};

function ok(data) {
  return { status: 200, text: JSON.stringify({ success: true, data }), headers: {} };
}

function failure(status, code, extra) {
  return { status, text: JSON.stringify(Object.assign({ success: false, code, error: 'x' }, extra || {})), headers: {} };
}

function memoryCache() {
  const store = {};
  return {
    store,
    getAll: vi.fn((keys) => {
      const out = {};
      keys.forEach((key) => { if (store[key] !== undefined) out[key] = store[key]; });
      return out;
    }),
    putAll: vi.fn((values, ttl) => {
      expect(ttl).toBe(PGPS_CACHE_TTL_SECONDS);
      Object.assign(store, values);
    }),
  };
}

function serviceWith(responder, options) {
  const settings = Object.assign({ apiKey: 'k_live_1234', cache: memoryCache() }, options || {});
  const transport = { fetchAll: vi.fn((requests) => requests.map(responder)) };
  const service = pgpsCreateService({ transport, cache: settings.cache, getApiKey: () => settings.apiKey });
  return { service, transport, cache: settings.cache };
}

describe('locale and messages', () => {
  it('maps any Spanish locale to es and everything else to en', () => {
    expect(pgpsLocale('es_ES')).toBe('es');
    expect(pgpsLocale('ES-mx')).toBe('es');
    expect(pgpsLocale('fr_FR')).toBe('en');
    expect(pgpsLocale(undefined)).toBe('en');
  });

  it('has the same keys in both dictionaries', () => {
    expect(Object.keys(PGPS_MESSAGES.es).sort()).toEqual(Object.keys(PGPS_MESSAGES.en).sort());
  });

  it('fills template parameters and leaves unknown ones', () => {
    expect(pgpsT('en', 'fillProgress', { done: 3, total: 9 })).toBe('3 of 9 rows');
    expect(pgpsT('es', 'fillProgress', { done: 3 })).toBe('3 de {total} filas');
    expect(pgpsT('en', 'doesNotExist')).toBe('doesNotExist');
  });

  it('always says 29 European countries', () => {
    const all = JSON.stringify(PGPS_MESSAGES);
    expect(all).toContain('29');
    expect(all).not.toMatch(/\b(21|26|31) (European|países)/);
  });

  it('returns every string for the sidebar', () => {
    expect(Object.keys(pgpsStrings('es'))).toEqual(Object.keys(PGPS_MESSAGES.en));
  });

  it('points to the developer portal in the right language', () => {
    expect(pgpsDeveloperUrl('en_US')).toBe(PGPS_DEVELOPER_URL);
    expect(pgpsDeveloperUrl('es')).toBe(PGPS_DEVELOPER_URL_ES);
  });

  it('builds error texts with parameters and a fallback', () => {
    expect(pgpsErrorText('en', { kind: 'rateLimit', retryAfter: 12 })).toContain('12 s');
    expect(pgpsErrorText('en', { kind: 'rateLimit' })).toContain('30 s');
    expect(pgpsErrorText('es', { kind: 'ambiguous', candidates: ['ES', 'PT'] })).toContain('ES, PT');
    expect(pgpsErrorText('en', { kind: 'invalidCountry', country: 'XX' })).toContain('"XX"');
    expect(pgpsErrorText('en', { kind: 'unknownKind' })).toBe(PGPS_MESSAGES.en.errServer);
  });

  it('knows which errors stop a batch', () => {
    expect(pgpsIsStoppingError({ kind: 'quota' })).toBe(true);
    expect(pgpsIsStoppingError({ kind: 'badKey' })).toBe(true);
    expect(pgpsIsStoppingError({ kind: 'notFound' })).toBe(false);
  });
});

describe('input normalisation', () => {
  it('trims references and rejects blank or oversized ones', () => {
    expect(pgpsNormalizeReference('  9872023VH5797S0001WX ')).toBe('9872023VH5797S0001WX');
    expect(pgpsNormalizeReference(12345)).toBe('12345');
    expect(pgpsNormalizeReference('')).toBeNull();
    expect(pgpsNormalizeReference(null)).toBeNull();
    expect(pgpsNormalizeReference('x'.repeat(65))).toBeNull();
  });

  it('accepts known countries, aliases and auto', () => {
    expect(pgpsNormalizeCountry('es')).toEqual({ ok: true, value: 'ES' });
    expect(pgpsNormalizeCountry('GB')).toEqual({ ok: true, value: 'UK' });
    expect(pgpsNormalizeCountry('el')).toEqual({ ok: true, value: 'GR' });
    expect(pgpsNormalizeCountry('auto')).toEqual({ ok: true, value: '' });
    expect(pgpsNormalizeCountry(undefined)).toEqual({ ok: true, value: '' });
    expect(pgpsNormalizeCountry('US')).toEqual({ ok: false, error: { kind: 'invalidCountry', country: 'US' } });
  });

  it('parses numbers with dot or comma decimals', () => {
    expect(pgpsToNumber(40.5)).toBe(40.5);
    expect(pgpsToNumber(' 40,5 ')).toBe(40.5);
    expect(pgpsToNumber('abc')).toBeNull();
    expect(pgpsToNumber('')).toBeNull();
    expect(pgpsToNumber(true)).toBeNull();
    expect(pgpsToNumber(Infinity)).toBeNull();
  });

  it('flattens ranges into a single list', () => {
    expect(pgpsFlattenColumn('a')).toEqual(['a']);
    expect(pgpsFlattenColumn([['a'], ['b', 'c']])).toEqual(['a', 'b', 'c']);
    expect(pgpsFlattenColumn(['a', 'b'])).toEqual(['a', 'b']);
  });

  it('shows only the last four characters of a key', () => {
    expect(pgpsMaskKey(' abcdef123456 ')).toBe('3456');
    expect(pgpsMaskKey('')).toBe('');
  });
});

describe('requests', () => {
  it('builds a parcel request with the key header and an encoded reference', () => {
    const request = pgpsParcelRequest('146505_8.0002/12', 'PL', 'secret');
    expect(request.url).toBe('https://api.parcelgps.com/api/catastro/146505_8.0002%2F12?country=PL');
    expect(request.headers['X-API-Key']).toBe('secret');
    expect(request.cacheKey).toBe('pgps1:p:PL:146505_8.0002/12');
    expect(JSON.stringify(request.cacheKey)).not.toContain('secret');
  });

  it('omits the country when it is detected', () => {
    expect(pgpsParcelRequest('ABC', '', 'k').url).toBe('https://api.parcelgps.com/api/catastro/ABC');
    expect(pgpsParcelRequest('ABC', '', 'k').cacheKey).toBe('pgps1:p:-:ABC');
  });

  it('builds a point request rounded to 7 decimals', () => {
    const request = pgpsPointRequest(40.123456789, -3.5, '', 'k');
    expect(request.url).toBe('https://api.parcelgps.com/api/search/coordinates?lat=40.1234568&lng=-3.5000000');
    expect(request.kind).toBe('point');
    expect(pgpsPointRequest(1, 2, 'FR', 'k').url).toContain('&country=FR');
  });
});

describe('response parsing', () => {
  it('returns data on success', () => {
    expect(pgpsParseResponse(ok(MADRID))).toEqual({ ok: true, data: MADRID });
  });

  it.each([
    [failure(401, 'KEY_AUTH_002'), 'badKey'],
    [failure(401, 'UNAUTHORIZED'), 'badKey'],
    [failure(401, ''), 'badKey'],
    [failure(403, 'PRO_REQUIRED'), 'badKey'],
    [failure(429, 'KEY_AUTH_004'), 'quota'],
    [failure(429, 'KEY_RATE_002'), 'rateLimit'],
    [failure(404, 'NOT_FOUND'), 'notFound'],
    [failure(200, 'NOT_FOUND'), 'notFound'],
    [failure(422, 'CNV_COVERAGE'), 'coverage'],
    [failure(422, 'CNV_PLACE_NAME'), 'placeName'],
    [failure(300, 'CNV_AMBIGUOUS'), 'ambiguous'],
    [failure(400, 'VALIDATION_ERROR'), 'invalid'],
    [failure(503, 'SERVICE_UNAVAILABLE'), 'unavailable'],
    [failure(500, 'INTERNAL_ERROR'), 'server'],
    [failure(502, ''), 'server'],
    [failure(401, 'KEY_AUTH_005'), 'server'],
    [failure(418, ''), 'server'],
  ])('classifies %j', (response, kind) => {
    const parsed = pgpsParseResponse(response);
    expect(parsed.ok).toBe(false);
    expect(parsed.error.kind).toBe(kind);
  });

  it('reads Retry-After case-insensitively and caps it', () => {
    const response = failure(429, 'RATE_LIMIT_EXCEEDED');
    response.headers = { 'retry-after': '7' };
    expect(pgpsParseResponse(response).error.retryAfter).toBe(7);
    response.headers = { 'Retry-After': '9999' };
    expect(pgpsParseResponse(response).error.retryAfter).toBe(120);
    response.headers = { 'Retry-After': '0' };
    expect(pgpsParseResponse(response).error.retryAfter).toBe(30);
    response.headers = null;
    expect(pgpsParseResponse(response).error.retryAfter).toBe(30);
  });

  it('lists ambiguous candidates', () => {
    const parsed = pgpsParseResponse(failure(300, 'CNV_AMBIGUOUS', { data: { candidates: [{ country: 'ES' }, { country: 'PT' }] } }));
    expect(parsed.error.candidates).toEqual(['ES', 'PT']);
    expect(pgpsParseResponse(failure(300, '')).error.candidates).toEqual([]);
  });

  it('treats empty, non-JSON and data-less bodies as empty', () => {
    expect(pgpsParseResponse(null).error.kind).toBe('empty');
    expect(pgpsParseResponse({ status: 200, text: '' }).error.kind).toBe('empty');
    expect(pgpsParseResponse({ status: 200, text: 'not json' }).error.kind).toBe('empty');
    expect(pgpsParseResponse({ status: 200, text: '"string"' }).error.kind).toBe('empty');
    expect(pgpsParseResponse({ status: 200, text: '{"success":true}' }).error.kind).toBe('empty');
    expect(pgpsParseResponse({ status: 500, text: '<html>' }).error.kind).toBe('server');
  });

  it('classifies thrown fetch errors as timeout or network', () => {
    expect(pgpsParseResponse({ thrown: new Error('Timeout: https://api.parcelgps.com') }).error.kind).toBe('timeout');
    expect(pgpsClassifyThrown(new Error('Request timed out'))).toEqual({ kind: 'timeout' });
    expect(pgpsClassifyThrown(new Error('Exceeded deadline'))).toEqual({ kind: 'timeout' });
    expect(pgpsClassifyThrown(new Error('Address unavailable'))).toEqual({ kind: 'network' });
    expect(pgpsClassifyThrown(null)).toEqual({ kind: 'network' });
    expect(pgpsClassifyThrown('DNS error')).toEqual({ kind: 'network' });
  });
});

describe('summaries', () => {
  it('computes a polygon area close to the real one', () => {
    const side = 0.001;
    const square = [[40, -3], [40, -3 + side], [40 + side, -3 + side], [40 + side, -3]];
    const area = pgpsPolygonArea(square);
    expect(area).toBeGreaterThan(9400);
    expect(area).toBeLessThan(9500);
  });

  it('refuses degenerate polygons', () => {
    expect(pgpsPolygonArea(null)).toBeNull();
    expect(pgpsPolygonArea([[1, 1], [2, 2]])).toBeNull();
    expect(pgpsPolygonArea([[1, 1], [2, 2], ['x', 1], [null]])).toBeNull();
    expect(pgpsPolygonArea([[1, 1], [1, 1], [1, 1]])).toBeNull();
  });

  it('prefers the official area and falls back to the outline', () => {
    expect(pgpsParcelSummary(MADRID, 'r', '').area).toBe(1520);
    const outline = Object.assign({}, MADRID, { superficieParcela: 0, poligono: [[40, -3], [40, -2.999], [40.001, -2.999]] });
    expect(pgpsParcelSummary(outline, 'r', '').area).toBeGreaterThan(4000);
    expect(pgpsParcelSummary({ latitud: 1, longitud: 2 }, 'REF', 'FR')).toEqual({
      ref: 'REF', country: 'FR', lat: 1, lon: 2, area: null, municipality: '',
    });
  });

  it('summarises a point match', () => {
    const summary = pgpsPointSummary({ referenciaCatastral: 'R1', pais: 'FR', municipio: 'Paris', coordenadas: { latitud: 48.8, longitud: 2.3 } }, '');
    expect(summary).toEqual({ ref: 'R1', country: 'FR', lat: 48.8, lon: 2.3, area: null, municipality: 'Paris' });
    expect(pgpsPointSummary({ refCat14: 'R14' }, 'ES')).toMatchObject({ ref: 'R14', country: 'ES', lat: null });
    expect(pgpsPointSummary({}, '').ref).toBe('');
  });
});

describe('service', () => {
  it('returns noKey for every item when no key is saved', () => {
    const { service, transport } = serviceWith(() => ok(MADRID), { apiKey: '  ' });
    expect(service.lookupParcels([{ ref: 'A' }, { ref: 'B' }])).toEqual([
      { ok: false, error: { kind: 'noKey' } },
      { ok: false, error: { kind: 'noKey' } },
    ]);
    expect(transport.fetchAll).not.toHaveBeenCalled();
  });

  it('works without a getApiKey dependency', () => {
    const service = pgpsCreateService({ transport: { fetchAll: vi.fn() }, cache: null });
    expect(service.lookupParcels([{ ref: 'A' }])[0].error.kind).toBe('noKey');
  });

  it('fetches, caches and then serves from cache', () => {
    const { service, transport, cache } = serviceWith(() => ok(MADRID));
    const first = service.lookupParcels([{ ref: '9872023VH5797S0001WX', country: 'es' }]);
    expect(first[0]).toEqual({ ok: true, summary: { ref: MADRID.refCatastral, country: 'ES', lat: 40.4169, lon: -3.7035, area: 1520, municipality: 'MADRID' } });
    expect(Object.keys(cache.store)).toEqual(['pgps1:p:ES:9872023VH5797S0001WX']);
    const second = service.lookupParcels([{ ref: '9872023VH5797S0001WX', country: 'ES' }]);
    expect(second[0].cached).toBe(true);
    expect(transport.fetchAll).toHaveBeenCalledTimes(1);
  });

  it('sends the key in the header and never in the URL', () => {
    const { service, transport } = serviceWith(() => ok(MADRID));
    service.lookupParcels([{ ref: 'A' }]);
    const request = transport.fetchAll.mock.calls[0][0][0];
    expect(request.headers['X-API-Key']).toBe('k_live_1234');
    expect(request.url).not.toContain('k_live_1234');
  });

  it('deduplicates repeated references in one call', () => {
    const { service, transport } = serviceWith(() => ok(MADRID));
    const results = service.lookupParcels([{ ref: 'A' }, { ref: 'A' }, { ref: 'B' }]);
    expect(transport.fetchAll.mock.calls[0][0]).toHaveLength(2);
    expect(results.every((r) => r.ok)).toBe(true);
  });

  it('does not cache failures and keeps input errors local', () => {
    const { service, transport, cache } = serviceWith(() => failure(404, 'NOT_FOUND'));
    const results = service.lookupParcels([{ ref: 'A' }, { ref: '' }, { ref: 'B', country: 'XX' }]);
    expect(results.map((r) => r.error.kind)).toEqual(['notFound', 'invalidRef', 'invalidCountry']);
    expect(transport.fetchAll.mock.calls[0][0]).toHaveLength(1);
    expect(cache.putAll).not.toHaveBeenCalled();
  });

  it('flags a success without usable fields as empty', () => {
    const { service } = serviceWith(() => ok({ pais: 'ES' }));
    expect(service.lookupPoints([{ lat: 1, lon: 2 }])[0].error.kind).toBe('empty');
  });

  it('survives a broken cache', () => {
    const cache = { getAll: () => { throw new Error('boom'); }, putAll: () => { throw new Error('boom'); } };
    const { service } = serviceWith(() => ok(MADRID), { cache });
    expect(service.lookupParcels([{ ref: 'A' }])[0].ok).toBe(true);
  });

  it('ignores corrupt cache entries', () => {
    const cache = memoryCache();
    cache.store['pgps1:p:-:A'] = 'not json';
    const { service, transport } = serviceWith(() => ok(MADRID), { cache });
    expect(service.lookupParcels([{ ref: 'A' }])[0].ok).toBe(true);
    expect(transport.fetchAll).toHaveBeenCalledTimes(1);
  });

  it('looks up points and validates coordinates', () => {
    const { service } = serviceWith(() => ok({ referenciaCatastral: 'P1', coordenadas: { latitud: 1, longitud: 2 } }));
    const results = service.lookupPoints([{ lat: '40,1', lon: -3 }, { lat: 'x', lon: 1 }, { lat: 91, lon: 0 }, { lat: 1, lon: 1, country: 'ZZ' }]);
    expect(results[0]).toMatchObject({ ok: true, summary: { ref: 'P1' } });
    expect(results.slice(1).map((r) => r.error.kind)).toEqual(['invalidCoords', 'invalidCoords', 'invalidCountry']);
  });

  it('maps timeouts from the transport', () => {
    const { service } = serviceWith(() => ({ thrown: new Error('Timeout') }));
    expect(service.lookupParcels([{ ref: 'A' }])[0].error.kind).toBe('timeout');
  });
});

describe('cell formatting', () => {
  const good = { ok: true, summary: { ref: 'R', country: 'ES', lat: 1, lon: 2, area: null, municipality: 'M' } };
  const bad = { ok: false, error: { kind: 'notFound' } };

  it('formats rows with blanks for missing values and errors in the first cell', () => {
    expect(pgpsResultRow(good, PGPS_INFO_FIELDS, 'en')).toEqual(['R', 'ES', 1, 2, '', 'M']);
    expect(pgpsResultRow(bad, ['lat', 'lon'], 'es')).toEqual([PGPS_MESSAGES.es.errNotFound, '']);
  });

  it('formats single values and explains a missing area', () => {
    expect(pgpsSingleValue(good, 'municipality', 'en')).toBe('M');
    expect(pgpsSingleValue(good, 'area', 'en')).toBe(PGPS_MESSAGES.en.errNoArea);
    expect(pgpsSingleValue(bad, 'area', 'en')).toBe(PGPS_MESSAGES.en.errNotFound);
  });
});

describe('formulas', () => {
  it('returns a scalar for a single reference', () => {
    const { service } = serviceWith(() => ok(MADRID));
    expect(pgpsFormulaSingle(service, 'en', 'A', '', 'area')).toBe(1520);
  });

  it('returns a column for a range and skips blank cells without calling the API', () => {
    const { service, transport } = serviceWith(() => ok(MADRID));
    expect(pgpsFormulaSingle(service, 'en', [['A'], [''], ['B']], 'ES', 'municipality')).toEqual([['MADRID'], [''], ['MADRID']]);
    expect(transport.fetchAll.mock.calls[0][0]).toHaveLength(2);
  });

  it('does not call the API when the whole range is blank', () => {
    const { service, transport } = serviceWith(() => ok(MADRID));
    expect(pgpsFormulaRow(service, 'en', [[''], ['']], '', ['lat', 'lon'])).toEqual([['', ''], ['', '']]);
    expect(transport.fetchAll).not.toHaveBeenCalled();
  });

  it('spills coordinates into two cells', () => {
    const { service } = serviceWith(() => ok(MADRID));
    expect(pgpsFormulaRow(service, 'en', 'A', '', ['lat', 'lon'])).toEqual([[40.4169, -3.7035]]);
  });

  it('pairs a country range with a reference range', () => {
    const { service, transport } = serviceWith(() => ok(MADRID));
    pgpsFormulaRow(service, 'en', [['A'], ['B']], [['ES'], ['PT']], PGPS_INFO_FIELDS);
    const urls = transport.fetchAll.mock.calls[0][0].map((r) => r.url);
    expect(urls[0]).toContain('country=ES');
    expect(urls[1]).toContain('country=PT');
  });

  it('uses a single-cell country range for every row', () => {
    const { service, transport } = serviceWith(() => ok(MADRID));
    pgpsFormulaRow(service, 'en', [['A'], ['B']], [['FR']], PGPS_INFO_FIELDS);
    expect(transport.fetchAll.mock.calls[0][0].every((r) => r.url.endsWith('country=FR'))).toBe(true);
  });

  it('returns the reference at a point, scalar and range', () => {
    const { service } = serviceWith(() => ok({ referenciaCatastral: 'P9', coordenadas: { latitud: 1, longitud: 2 } }));
    expect(pgpsPointFormula(service, 'en', 40.4, -3.7, '')).toBe('P9');
    expect(pgpsPointFormula(service, 'en', [[40.4], [''], ['bad']], [[-3.7], [''], [1]], '')).toEqual([
      ['P9'], [''], [PGPS_MESSAGES.en.errInvalidCoords],
    ]);
  });

  it('shows the quota error in the cell', () => {
    const { service } = serviceWith(() => failure(429, 'KEY_AUTH_004'));
    expect(pgpsFormulaSingle(service, 'es', 'A', '', 'area')).toBe(PGPS_MESSAGES.es.errQuota);
  });
});

describe('batch fill', () => {
  it('has localized headers', () => {
    expect(pgpsFillHeaders('es')).toEqual(['País', 'Latitud', 'Longitud', 'Superficie (m²)', 'Municipio']);
  });

  it('fills rows, skips blanks and counts results', () => {
    const responder = (request) => (request.url.includes('/MISSING') ? failure(404, 'NOT_FOUND') : ok(MADRID));
    const { service } = serviceWith(responder);
    const chunk = pgpsFillChunk(service, 'en', ['A', '', 'MISSING'], '');
    expect(chunk.rows[0]).toEqual(['ES', 40.4169, -3.7035, 1520, 'MADRID']);
    expect(chunk.rows[1]).toBeNull();
    expect(chunk.rows[2][0]).toBe(PGPS_MESSAGES.en.errNotFound);
    expect(chunk).toMatchObject({ ok: 1, failed: 1, stop: null, retryIndexes: [], retryAfter: 0 });
  });

  it('returns rate-limited rows for a retry after a pause', () => {
    const responder = (request) => {
      if (!request.url.includes('/SLOW')) return ok(MADRID);
      const response = failure(429, 'KEY_RATE_002');
      response.headers = { 'Retry-After': '15' };
      return response;
    };
    const { service } = serviceWith(responder);
    const chunk = pgpsFillChunk(service, 'en', ['A', 'SLOW', 'SLOW2'], '');
    expect(chunk.retryIndexes).toEqual([1, 2]);
    expect(chunk.retryAfter).toBe(15);
    expect(chunk.rows[1]).toBeNull();
    expect(chunk.ok).toBe(1);
  });

  it('stops on quota and on a bad key without writing those rows', () => {
    const quota = pgpsFillChunk(serviceWith(() => failure(429, 'KEY_AUTH_004')).service, 'en', ['A', 'B'], '');
    expect(quota.stop).toBe(PGPS_MESSAGES.en.errQuota);
    expect(quota.rows).toEqual([null, null]);
    const noKey = pgpsFillChunk(serviceWith(() => ok(MADRID), { apiKey: '' }).service, 'en', ['A'], '');
    expect(noKey.stop).toBe(PGPS_MESSAGES.en.errNoKey);
  });

  it('handles an all-blank chunk', () => {
    const { service, transport } = serviceWith(() => ok(MADRID));
    expect(pgpsFillChunk(service, 'en', ['', null], '').rows).toEqual([null, null]);
    expect(transport.fetchAll).not.toHaveBeenCalled();
  });
});
