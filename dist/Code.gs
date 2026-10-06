const PGPS_API_BASE = 'https://api.parcelgps.com';
const PGPS_DEVELOPER_URL = 'https://www.parcelgps.com/en/developers';
const PGPS_DEVELOPER_URL_ES = 'https://www.parcelgps.com/developers';
const PGPS_USER_AGENT = 'parcelgps-sheets/1.0.0';
const PGPS_CACHE_TTL_SECONDS = 21600;
const PGPS_CACHE_PREFIX = 'pgps1:';
const PGPS_MAX_REFERENCE_LENGTH = 64;
const PGPS_DEFAULT_RETRY_SECONDS = 30;
const PGPS_MAX_RETRY_SECONDS = 120;
const PGPS_EARTH_RADIUS_M = 6371008.8;
const PGPS_COORD_DECIMALS = 7;
const PGPS_MIN_POLYGON_POINTS = 3;
const PGPS_HTTP_OK_MIN = 200;
const PGPS_HTTP_OK_MAX = 299;
const PGPS_HTTP_MULTIPLE_CHOICES = 300;
const PGPS_HTTP_BAD_REQUEST = 400;
const PGPS_HTTP_UNAUTHORIZED = 401;
const PGPS_HTTP_FORBIDDEN = 403;
const PGPS_HTTP_NOT_FOUND = 404;
const PGPS_HTTP_UNPROCESSABLE = 422;
const PGPS_HTTP_TOO_MANY = 429;
const PGPS_HTTP_UNAVAILABLE = 503;
const PGPS_HTTP_SERVER_ERROR = 500;

const PGPS_COUNTRY_CODES = [
  'ES', 'PV', 'NA', 'PT', 'FR', 'IT', 'DE', 'AT', 'CH', 'LI',
  'BE', 'NL', 'LU', 'PL', 'CZ', 'SK', 'SI', 'HR', 'BG', 'GR',
  'CY', 'DK', 'SE', 'NO', 'FI', 'IS', 'EE', 'LV', 'LT', 'IE',
  'UK',
];

const PGPS_COUNTRY_ALIASES = { GB: 'UK', EL: 'GR' };

const PGPS_INFO_FIELDS = ['ref', 'country', 'lat', 'lon', 'area', 'municipality'];
const PGPS_FILL_FIELDS = ['country', 'lat', 'lon', 'area', 'municipality'];

const PGPS_MESSAGES = {
  en: {
    menuTitle: 'Parcel GPS',
    menuOpen: 'Open sidebar',
    menuFill: 'Fill selected range',
    sidebarTitle: 'Parcel GPS',
    intro: 'Official cadastral parcels from 29 European countries, right in your sheet.',
    keyLabel: 'API key',
    keyPlaceholder: 'Paste your API key',
    keySave: 'Save key',
    keyRemove: 'Remove key',
    keySaved: 'Key saved (ends in {last}).',
    keyMissing: 'No key saved yet.',
    keyRemoved: 'Key removed.',
    keyEmpty: 'Paste a key first.',
    getKey: 'Get a free key (250 requests a month)',
    fillTitle: 'Fill selected range',
    fillHelp: 'Select a column of cadastral references. Country, latitude, longitude, area (m²) and municipality are written into the 5 columns to its right.',
    countryLabel: 'Country',
    countryAuto: 'Detect from the reference',
    headerLabel: 'First row is a header',
    fillStart: 'Fill',
    fillStop: 'Stop',
    fillOccupied: 'The 5 columns to the right already have data in {count} rows. Overwrite them?',
    fillNoSelection: 'Select one column of references first.',
    fillMultiColumn: 'Select a single column of references.',
    fillProgress: '{done} of {total} rows',
    fillPaused: 'Rate limit reached. Resuming in {seconds} s…',
    fillDone: 'Done: {ok} filled, {failed} with errors.',
    fillStopped: 'Stopped: {reason}',
    fillCancelled: 'Stopped by you.',
    headerCountry: 'Country',
    headerLat: 'Latitude',
    headerLon: 'Longitude',
    headerArea: 'Area (m²)',
    headerMunicipality: 'Municipality',
    helpTitle: 'Formulas',
    helpCoords: 'Latitude and longitude of the parcel centre (2 cells).',
    helpArea: 'Plot area in m².',
    helpMunicipality: 'Municipality of the parcel.',
    helpInfo: 'Reference, country, latitude, longitude, area and municipality in one row.',
    helpAt: 'Cadastral reference of the parcel at a point.',
    helpCountry: 'The country is optional (ES, FR, DE, PT, IT…); it is detected from the reference when left out. Results are cached for 6 hours.',
    errNoKey: 'Parcel GPS: no API key. Open Extensions > Parcel GPS > Open sidebar and save your key.',
    errBadKey: 'Parcel GPS: invalid API key. Check it in the sidebar.',
    errQuota: 'Parcel GPS: monthly quota used up. Upgrade or top up at parcelgps.com/developers.',
    errRateLimit: 'Parcel GPS: too many requests. Retry in {seconds} s.',
    errNotFound: 'Parcel GPS: parcel not found. Check the reference and the country.',
    errCoverage: 'Parcel GPS: country not covered. Coverage: 29 European countries.',
    errAmbiguous: 'Parcel GPS: the reference fits several countries ({candidates}). Add the country code.',
    errPlaceName: 'Parcel GPS: that is a place name, not a cadastral reference.',
    errInvalid: 'Parcel GPS: invalid input. Check the reference format for this country.',
    errInvalidCountry: 'Parcel GPS: unknown country code "{country}".',
    errInvalidRef: 'Parcel GPS: empty or too long reference.',
    errInvalidCoords: 'Parcel GPS: latitude and longitude must be numbers.',
    errUnavailable: 'Parcel GPS: the official cadastre is not responding. Try again later.',
    errServer: 'Parcel GPS: service error. Try again later (failed lookups are free).',
    errTimeout: 'Parcel GPS: the request timed out. Try again.',
    errNetwork: 'Parcel GPS: could not reach the API. Try again.',
    errEmpty: 'Parcel GPS: empty answer from the API. Try again.',
    errNoArea: 'Parcel GPS: no area for this parcel.',
  },
  es: {
    menuTitle: 'Parcel GPS',
    menuOpen: 'Abrir panel',
    menuFill: 'Rellenar rango seleccionado',
    sidebarTitle: 'Parcel GPS',
    intro: 'Parcelas catastrales oficiales de 29 países europeos, en tu hoja de cálculo.',
    keyLabel: 'Clave de API',
    keyPlaceholder: 'Pega tu clave de API',
    keySave: 'Guardar clave',
    keyRemove: 'Quitar clave',
    keySaved: 'Clave guardada (acaba en {last}).',
    keyMissing: 'Todavía no hay clave guardada.',
    keyRemoved: 'Clave eliminada.',
    keyEmpty: 'Pega primero una clave.',
    getKey: 'Consigue una clave gratis (250 consultas al mes)',
    fillTitle: 'Rellenar rango seleccionado',
    fillHelp: 'Selecciona una columna de referencias catastrales. País, latitud, longitud, superficie (m²) y municipio se escriben en las 5 columnas de su derecha.',
    countryLabel: 'País',
    countryAuto: 'Detectar por la referencia',
    headerLabel: 'La primera fila es una cabecera',
    fillStart: 'Rellenar',
    fillStop: 'Parar',
    fillOccupied: 'Las 5 columnas de la derecha ya tienen datos en {count} filas. ¿Sobrescribirlas?',
    fillNoSelection: 'Selecciona primero una columna de referencias.',
    fillMultiColumn: 'Selecciona una sola columna de referencias.',
    fillProgress: '{done} de {total} filas',
    fillPaused: 'Límite de ritmo alcanzado. Se reanuda en {seconds} s…',
    fillDone: 'Hecho: {ok} rellenadas, {failed} con errores.',
    fillStopped: 'Detenido: {reason}',
    fillCancelled: 'Detenido por ti.',
    headerCountry: 'País',
    headerLat: 'Latitud',
    headerLon: 'Longitud',
    headerArea: 'Superficie (m²)',
    headerMunicipality: 'Municipio',
    helpTitle: 'Fórmulas',
    helpCoords: 'Latitud y longitud del centro de la parcela (2 celdas).',
    helpArea: 'Superficie de la parcela en m².',
    helpMunicipality: 'Municipio de la parcela.',
    helpInfo: 'Referencia, país, latitud, longitud, superficie y municipio en una fila.',
    helpAt: 'Referencia catastral de la parcela en un punto.',
    helpCountry: 'El país es opcional (ES, FR, DE, PT, IT…); si falta, se deduce de la referencia. Los resultados se guardan 6 horas.',
    errNoKey: 'Parcel GPS: falta la clave de API. Abre Extensiones > Parcel GPS > Abrir panel y guárdala.',
    errBadKey: 'Parcel GPS: clave de API no válida. Revísala en el panel.',
    errQuota: 'Parcel GPS: cuota mensual agotada. Amplía el plan o recarga saldo en parcelgps.com/developers.',
    errRateLimit: 'Parcel GPS: demasiadas consultas. Reintenta en {seconds} s.',
    errNotFound: 'Parcel GPS: parcela no encontrada. Revisa la referencia y el país.',
    errCoverage: 'Parcel GPS: país sin cobertura. Cubrimos 29 países europeos.',
    errAmbiguous: 'Parcel GPS: la referencia encaja en varios países ({candidates}). Añade el código de país.',
    errPlaceName: 'Parcel GPS: eso es un topónimo, no una referencia catastral.',
    errInvalid: 'Parcel GPS: dato no válido. Revisa el formato de la referencia para ese país.',
    errInvalidCountry: 'Parcel GPS: código de país desconocido "{country}".',
    errInvalidRef: 'Parcel GPS: referencia vacía o demasiado larga.',
    errInvalidCoords: 'Parcel GPS: latitud y longitud deben ser números.',
    errUnavailable: 'Parcel GPS: el catastro oficial no responde. Inténtalo más tarde.',
    errServer: 'Parcel GPS: error del servicio. Inténtalo más tarde (las consultas fallidas no cuentan).',
    errTimeout: 'Parcel GPS: la consulta tardó demasiado. Inténtalo de nuevo.',
    errNetwork: 'Parcel GPS: no se pudo conectar con la API. Inténtalo de nuevo.',
    errEmpty: 'Parcel GPS: la API respondió vacío. Inténtalo de nuevo.',
    errNoArea: 'Parcel GPS: esta parcela no tiene superficie.',
  },
};

const PGPS_ERROR_MESSAGE_KEYS = {
  noKey: 'errNoKey',
  badKey: 'errBadKey',
  quota: 'errQuota',
  rateLimit: 'errRateLimit',
  notFound: 'errNotFound',
  coverage: 'errCoverage',
  ambiguous: 'errAmbiguous',
  placeName: 'errPlaceName',
  invalid: 'errInvalid',
  invalidCountry: 'errInvalidCountry',
  invalidRef: 'errInvalidRef',
  invalidCoords: 'errInvalidCoords',
  unavailable: 'errUnavailable',
  server: 'errServer',
  timeout: 'errTimeout',
  network: 'errNetwork',
  empty: 'errEmpty',
};

const PGPS_STOPPING_ERRORS = ['noKey', 'badKey', 'quota'];

function pgpsLocale(raw) {
  return String(raw || '').toLowerCase().indexOf('es') === 0 ? 'es' : 'en';
}

function pgpsT(locale, key, params) {
  const table = PGPS_MESSAGES[pgpsLocale(locale)];
  const template = table[key] || PGPS_MESSAGES.en[key] || key;
  return template.replace(/\{(\w+)\}/g, function (match, name) {
    return params && params[name] !== undefined ? String(params[name]) : match;
  });
}

function pgpsStrings(locale) {
  const out = {};
  Object.keys(PGPS_MESSAGES.en).forEach(function (key) {
    out[key] = pgpsT(locale, key);
  });
  return out;
}

function pgpsDeveloperUrl(locale) {
  return pgpsLocale(locale) === 'es' ? PGPS_DEVELOPER_URL_ES : PGPS_DEVELOPER_URL;
}

function pgpsError(kind, extra) {
  const error = { kind: kind };
  Object.keys(extra || {}).forEach(function (key) {
    error[key] = extra[key];
  });
  return error;
}

function pgpsErrorText(locale, error) {
  const key = PGPS_ERROR_MESSAGE_KEYS[error.kind] || 'errServer';
  return pgpsT(locale, key, {
    seconds: error.retryAfter || PGPS_DEFAULT_RETRY_SECONDS,
    country: error.country || '',
    candidates: (error.candidates || []).join(', '),
  });
}

function pgpsIsStoppingError(error) {
  return PGPS_STOPPING_ERRORS.indexOf(error.kind) !== -1;
}

function pgpsIsBlank(value) {
  return value === null || value === undefined || String(value).trim() === '';
}

function pgpsNormalizeReference(raw) {
  if (pgpsIsBlank(raw)) return null;
  const ref = String(raw).trim();
  return ref.length > PGPS_MAX_REFERENCE_LENGTH ? null : ref;
}

function pgpsNormalizeCountry(raw) {
  if (pgpsIsBlank(raw)) return { ok: true, value: '' };
  const upper = String(raw).trim().toUpperCase();
  if (upper === 'AUTO') return { ok: true, value: '' };
  const code = PGPS_COUNTRY_ALIASES[upper] || upper;
  if (PGPS_COUNTRY_CODES.indexOf(code) === -1) return { ok: false, error: pgpsError('invalidCountry', { country: String(raw).trim() }) };
  return { ok: true, value: code };
}

function pgpsToNumber(raw) {
  if (pgpsIsBlank(raw) || typeof raw === 'boolean') return null;
  const value = typeof raw === 'number' ? raw : Number(String(raw).trim().replace(',', '.'));
  return isFinite(value) ? value : null;
}

function pgpsQueryString(params) {
  return Object.keys(params)
    .filter(function (key) { return !pgpsIsBlank(params[key]); })
    .map(function (key) { return encodeURIComponent(key) + '=' + encodeURIComponent(String(params[key])); })
    .join('&');
}

function pgpsHeaders(apiKey) {
  return { 'X-API-Key': apiKey, Accept: 'application/json', 'User-Agent': PGPS_USER_AGENT };
}

function pgpsWithQuery(path, params) {
  const query = pgpsQueryString(params);
  return PGPS_API_BASE + path + (query ? '?' + query : '');
}

function pgpsParcelRequest(ref, country, apiKey) {
  return {
    url: pgpsWithQuery('/api/catastro/' + encodeURIComponent(ref), { country: country }),
    headers: pgpsHeaders(apiKey),
    cacheKey: PGPS_CACHE_PREFIX + 'p:' + (country || '-') + ':' + ref,
    kind: 'parcel',
  };
}

function pgpsPointRequest(lat, lon, country, apiKey) {
  const latText = lat.toFixed(PGPS_COORD_DECIMALS);
  const lonText = lon.toFixed(PGPS_COORD_DECIMALS);
  return {
    url: pgpsWithQuery('/api/search/coordinates', { lat: latText, lng: lonText, country: country }),
    headers: pgpsHeaders(apiKey),
    cacheKey: PGPS_CACHE_PREFIX + 'c:' + (country || '-') + ':' + latText + ',' + lonText,
    kind: 'point',
  };
}

function pgpsHeader(headers, name) {
  const wanted = name.toLowerCase();
  const keys = Object.keys(headers || {});
  for (let i = 0; i < keys.length; i += 1) {
    if (keys[i].toLowerCase() === wanted) return headers[keys[i]];
  }
  return undefined;
}

function pgpsRetryAfter(headers) {
  const value = pgpsToNumber(pgpsHeader(headers, 'Retry-After'));
  if (value === null || value <= 0) return PGPS_DEFAULT_RETRY_SECONDS;
  return Math.min(Math.ceil(value), PGPS_MAX_RETRY_SECONDS);
}

function pgpsParseJson(text) {
  if (pgpsIsBlank(text)) return null;
  try {
    const parsed = JSON.parse(text);
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch (e) {
    return null;
  }
}

function pgpsCandidates(body) {
  const data = body && body.data;
  const list = (data && data.candidates) || [];
  return list.map(function (candidate) { return candidate.country; }).filter(Boolean);
}

function pgpsClassifyFailure(status, body, headers) {
  const code = body && typeof body.code === 'string' ? body.code : '';
  if (code === 'CNV_AMBIGUOUS' || status === PGPS_HTTP_MULTIPLE_CHOICES) return pgpsError('ambiguous', { code: code, candidates: pgpsCandidates(body) });
  if (code === 'CNV_COVERAGE') return pgpsError('coverage', { code: code });
  if (code === 'CNV_PLACE_NAME') return pgpsError('placeName', { code: code });
  if (code === 'KEY_AUTH_004') return pgpsError('quota', { code: code });
  if (code === 'KEY_AUTH_005') return pgpsError('server', { code: code });
  if (code.indexOf('KEY_AUTH_') === 0 || code === 'UNAUTHORIZED') return pgpsError('badKey', { code: code });
  if (status === PGPS_HTTP_TOO_MANY) return pgpsError('rateLimit', { code: code, retryAfter: pgpsRetryAfter(headers) });
  if (status === PGPS_HTTP_UNAUTHORIZED || status === PGPS_HTTP_FORBIDDEN) return pgpsError('badKey', { code: code });
  if (status === PGPS_HTTP_NOT_FOUND || code === 'NOT_FOUND') return pgpsError('notFound', { code: code });
  if (status === PGPS_HTTP_BAD_REQUEST || status === PGPS_HTTP_UNPROCESSABLE) return pgpsError('invalid', { code: code });
  if (status === PGPS_HTTP_UNAVAILABLE) return pgpsError('unavailable', { code: code, retryAfter: pgpsRetryAfter(headers) });
  if (status >= PGPS_HTTP_SERVER_ERROR) return pgpsError('server', { code: code });
  return pgpsError('server', { code: code, status: status });
}

function pgpsParseResponse(response) {
  if (!response) return { ok: false, error: pgpsError('empty') };
  if (response.thrown) return { ok: false, error: pgpsClassifyThrown(response.thrown) };
  const status = Number(response.status);
  const body = pgpsParseJson(response.text);
  const success = status >= PGPS_HTTP_OK_MIN && status <= PGPS_HTTP_OK_MAX;
  if (success && body && body.success !== false && body.data && typeof body.data === 'object') return { ok: true, data: body.data };
  if (success && body && body.success === false) return { ok: false, error: pgpsClassifyFailure(status, body, response.headers) };
  if (success) return { ok: false, error: pgpsError('empty') };
  return { ok: false, error: pgpsClassifyFailure(status, body, response.headers) };
}

function pgpsClassifyThrown(thrown) {
  const message = String((thrown && thrown.message) || thrown || '');
  if (/time(d)?\s*-?out|timeout|deadline/i.test(message)) return pgpsError('timeout');
  return pgpsError('network');
}

function pgpsPolygonArea(points) {
  if (!Array.isArray(points) || points.length < PGPS_MIN_POLYGON_POINTS) return null;
  const valid = points.filter(function (p) { return Array.isArray(p) && isFinite(p[0]) && isFinite(p[1]); });
  if (valid.length < PGPS_MIN_POLYGON_POINTS) return null;
  const meanLat = valid.reduce(function (sum, p) { return sum + p[0]; }, 0) / valid.length;
  const toRad = Math.PI / 180;
  const cosLat = Math.cos(meanLat * toRad);
  let twice = 0;
  for (let i = 0; i < valid.length; i += 1) {
    const a = valid[i];
    const b = valid[(i + 1) % valid.length];
    const ax = a[1] * toRad * PGPS_EARTH_RADIUS_M * cosLat;
    const ay = a[0] * toRad * PGPS_EARTH_RADIUS_M;
    const bx = b[1] * toRad * PGPS_EARTH_RADIUS_M * cosLat;
    const by = b[0] * toRad * PGPS_EARTH_RADIUS_M;
    twice += ax * by - bx * ay;
  }
  const area = Math.abs(twice) / 2;
  return area > 0 ? Math.round(area) : null;
}

function pgpsParcelArea(data) {
  const official = pgpsToNumber(data.superficieParcela);
  if (official !== null && official > 0) return official;
  return pgpsPolygonArea(data.poligono);
}

function pgpsParcelSummary(data, requestedRef, requestedCountry) {
  const lat = pgpsToNumber(data.latitud);
  const lon = pgpsToNumber(data.longitud);
  return {
    ref: data.refCatastral || requestedRef,
    country: data.pais || requestedCountry || '',
    lat: lat,
    lon: lon,
    area: pgpsParcelArea(data),
    municipality: data.municipio || '',
  };
}

function pgpsPointSummary(data, requestedCountry) {
  const coords = data.coordenadas || {};
  return {
    ref: data.referenciaCatastral || data.refCat14 || '',
    country: data.pais || requestedCountry || '',
    lat: pgpsToNumber(coords.latitud),
    lon: pgpsToNumber(coords.longitud),
    area: null,
    municipality: data.municipio || '',
  };
}

function pgpsSummaryIsUsable(summary) {
  return !pgpsIsBlank(summary.ref) || (summary.lat !== null && summary.lon !== null);
}

function pgpsCacheGetAll(cache, keys) {
  if (!cache || keys.length === 0) return {};
  try {
    return cache.getAll(keys) || {};
  } catch (e) {
    return {};
  }
}

function pgpsCachePutAll(cache, values) {
  if (!cache || Object.keys(values).length === 0) return;
  try {
    cache.putAll(values, PGPS_CACHE_TTL_SECONDS);
  } catch (e) {
    return;
  }
}

function pgpsPrepareParcel(item, apiKey) {
  const ref = pgpsNormalizeReference(item.ref);
  if (ref === null) return { error: pgpsError('invalidRef') };
  const country = pgpsNormalizeCountry(item.country);
  if (!country.ok) return { error: country.error };
  return { request: pgpsParcelRequest(ref, country.value, apiKey), ref: ref, country: country.value };
}

function pgpsPreparePoint(item, apiKey) {
  const lat = pgpsToNumber(item.lat);
  const lon = pgpsToNumber(item.lon);
  if (lat === null || lon === null || Math.abs(lat) > 90 || Math.abs(lon) > 180) return { error: pgpsError('invalidCoords') };
  const country = pgpsNormalizeCountry(item.country);
  if (!country.ok) return { error: country.error };
  return { request: pgpsPointRequest(lat, lon, country.value, apiKey), country: country.value };
}

function pgpsSummarize(prepared, data) {
  if (prepared.request.kind === 'point') return pgpsPointSummary(data, prepared.country);
  return pgpsParcelSummary(data, prepared.ref, prepared.country);
}

function pgpsCreateService(deps) {
  function run(items, prepare) {
    const apiKey = deps.getApiKey ? deps.getApiKey() : '';
    if (pgpsIsBlank(apiKey)) return items.map(function () { return { ok: false, error: pgpsError('noKey') }; });
    const prepared = items.map(function (item) { return prepare(item, String(apiKey).trim()); });
    const results = prepared.map(function (p) { return p.error ? { ok: false, error: p.error } : null; });
    const pendingIndexes = [];
    prepared.forEach(function (p, index) { if (!p.error) pendingIndexes.push(index); });
    const uniqueKeys = [];
    pendingIndexes.forEach(function (index) {
      const key = prepared[index].request.cacheKey;
      if (uniqueKeys.indexOf(key) === -1) uniqueKeys.push(key);
    });
    const cached = pgpsCacheGetAll(deps.cache, uniqueKeys);
    const resolved = {};
    uniqueKeys.forEach(function (key) {
      const hit = pgpsParseJson(cached[key]);
      if (hit) resolved[key] = { ok: true, summary: hit, cached: true };
    });
    const toFetch = uniqueKeys.filter(function (key) { return !resolved[key]; });
    const requestByKey = {};
    pendingIndexes.forEach(function (index) { requestByKey[prepared[index].request.cacheKey] = prepared[index]; });
    const responses = toFetch.length > 0 ? deps.transport.fetchAll(toFetch.map(function (key) { return requestByKey[key].request; })) : [];
    const toCache = {};
    toFetch.forEach(function (key, i) {
      const parsed = pgpsParseResponse(responses[i]);
      if (!parsed.ok) {
        resolved[key] = parsed;
        return;
      }
      const summary = pgpsSummarize(requestByKey[key], parsed.data);
      if (!pgpsSummaryIsUsable(summary)) {
        resolved[key] = { ok: false, error: pgpsError('empty') };
        return;
      }
      resolved[key] = { ok: true, summary: summary };
      toCache[key] = JSON.stringify(summary);
    });
    pgpsCachePutAll(deps.cache, toCache);
    pendingIndexes.forEach(function (index) { results[index] = resolved[prepared[index].request.cacheKey]; });
    return results;
  }

  return {
    lookupParcels: function (items) { return run(items, pgpsPrepareParcel); },
    lookupPoints: function (items) { return run(items, pgpsPreparePoint); },
  };
}

function pgpsCellValue(value) {
  return value === null || value === undefined ? '' : value;
}

function pgpsResultRow(result, fields, locale) {
  if (!result.ok) {
    const row = [pgpsErrorText(locale, result.error)];
    for (let i = 1; i < fields.length; i += 1) row.push('');
    return row;
  }
  return fields.map(function (field) { return pgpsCellValue(result.summary[field]); });
}

function pgpsSingleValue(result, field, locale) {
  if (!result.ok) return pgpsErrorText(locale, result.error);
  const value = result.summary[field];
  if (field === 'area' && (value === null || value === undefined)) return pgpsT(locale, 'errNoArea');
  return pgpsCellValue(value);
}

function pgpsIsGrid(value) {
  return Array.isArray(value);
}

function pgpsFlattenColumn(value) {
  if (!pgpsIsGrid(value)) return [value];
  const out = [];
  value.forEach(function (row) {
    if (Array.isArray(row)) row.forEach(function (cell) { out.push(cell); });
    else out.push(row);
  });
  return out;
}

function pgpsPickParam(param, index) {
  if (!pgpsIsGrid(param)) return param;
  const flat = pgpsFlattenColumn(param);
  return flat.length === 1 ? flat[0] : flat[index];
}

function pgpsParcelFormula(service, refInput, countryInput, shape) {
  const refs = pgpsFlattenColumn(refInput);
  const items = refs.map(function (ref, index) { return { ref: ref, country: pgpsPickParam(countryInput, index) }; });
  const blankMask = refs.map(pgpsIsBlank);
  const lookups = items.filter(function (item, index) { return !blankMask[index]; });
  const results = lookups.length > 0 ? service.lookupParcels(lookups) : [];
  let cursor = 0;
  const rows = refs.map(function (ref, index) {
    if (blankMask[index]) return shape.blank();
    const result = results[cursor];
    cursor += 1;
    return shape.format(result);
  });
  return pgpsIsGrid(refInput) ? rows : rows[0];
}

function pgpsPointFormula(service, locale, latInput, lonInput, countryInput) {
  const lats = pgpsFlattenColumn(latInput);
  const items = lats.map(function (lat, index) {
    return { lat: lat, lon: pgpsPickParam(lonInput, index), country: pgpsPickParam(countryInput, index) };
  });
  const blankMask = items.map(function (item) { return pgpsIsBlank(item.lat) && pgpsIsBlank(item.lon); });
  const lookups = items.filter(function (item, index) { return !blankMask[index]; });
  const results = lookups.length > 0 ? service.lookupPoints(lookups) : [];
  let cursor = 0;
  const rows = items.map(function (item, index) {
    if (blankMask[index]) return [''];
    const result = results[cursor];
    cursor += 1;
    return [pgpsSingleValue(result, 'ref', locale)];
  });
  return pgpsIsGrid(latInput) ? rows : rows[0][0];
}

function pgpsShapeSingle(field, locale) {
  return {
    blank: function () { return ['']; },
    format: function (result) { return [pgpsSingleValue(result, field, locale)]; },
  };
}

function pgpsShapeRow(fields, locale) {
  return {
    blank: function () { return fields.map(function () { return ''; }); },
    format: function (result) { return pgpsResultRow(result, fields, locale); },
  };
}

function pgpsFormulaSingle(service, locale, refInput, countryInput, field) {
  const out = pgpsParcelFormula(service, refInput, countryInput, pgpsShapeSingle(field, locale));
  return pgpsIsGrid(refInput) ? out : out[0];
}

function pgpsFormulaRow(service, locale, refInput, countryInput, fields) {
  const out = pgpsParcelFormula(service, refInput, countryInput, pgpsShapeRow(fields, locale));
  return pgpsIsGrid(refInput) ? out : [out];
}

function pgpsFillHeaders(locale) {
  return [
    pgpsT(locale, 'headerCountry'),
    pgpsT(locale, 'headerLat'),
    pgpsT(locale, 'headerLon'),
    pgpsT(locale, 'headerArea'),
    pgpsT(locale, 'headerMunicipality'),
  ];
}

function pgpsFillChunk(service, locale, refs, country) {
  const blankMask = refs.map(pgpsIsBlank);
  const items = [];
  refs.forEach(function (ref, index) { if (!blankMask[index]) items.push({ ref: ref, country: country }); });
  const results = items.length > 0 ? service.lookupParcels(items) : [];
  const rows = [];
  const retryIndexes = [];
  let stop = null;
  let retryAfter = 0;
  let ok = 0;
  let failed = 0;
  let cursor = 0;
  refs.forEach(function (ref, index) {
    if (blankMask[index]) {
      rows.push(null);
      return;
    }
    const result = results[cursor];
    cursor += 1;
    if (!result.ok && result.error.kind === 'rateLimit') {
      retryIndexes.push(index);
      retryAfter = Math.max(retryAfter, result.error.retryAfter || PGPS_DEFAULT_RETRY_SECONDS);
      rows.push(null);
      return;
    }
    if (!result.ok && pgpsIsStoppingError(result.error)) {
      stop = stop || pgpsErrorText(locale, result.error);
      rows.push(null);
      return;
    }
    if (result.ok) ok += 1;
    else failed += 1;
    rows.push(pgpsResultRow(result, PGPS_FILL_FIELDS, locale));
  });
  return { rows: rows, retryIndexes: retryIndexes, retryAfter: retryAfter, stop: stop, ok: ok, failed: failed };
}

function pgpsMaskKey(apiKey) {
  if (pgpsIsBlank(apiKey)) return '';
  const key = String(apiKey).trim();
  return key.slice(-4);
}

const PGPS_PROPERTY_KEY = 'PARCEL_GPS_API_KEY';
const PGPS_FILL_COLUMNS = 5;
const PGPS_SIDEBAR_TITLE = 'Parcel GPS';

function onOpen() {
  const strings = pgpsStrings(pgpsDetectLocale());
  SpreadsheetApp.getUi()
    .createAddonMenu()
    .addItem(strings.menuOpen, 'pgpsShowSidebar')
    .addItem(strings.menuFill, 'pgpsShowSidebar')
    .addToUi();
}

function onInstall() {
  onOpen();
}

function pgpsTry(read, fallback) {
  try {
    return read() || fallback;
  } catch (e) {
    return fallback;
  }
}

function pgpsDetectLocale() {
  const userLocale = pgpsTry(function () { return Session.getActiveUserLocale(); }, '');
  if (userLocale) return pgpsLocale(userLocale);
  return pgpsLocale(pgpsTry(function () { return SpreadsheetApp.getActiveSpreadsheet().getSpreadsheetLocale(); }, 'en'));
}

function pgpsReadApiKey() {
  return pgpsTry(function () { return PropertiesService.getUserProperties().getProperty(PGPS_PROPERTY_KEY); }, '');
}

function pgpsCache() {
  return pgpsTry(function () { return CacheService.getDocumentCache() || CacheService.getScriptCache(); }, null);
}

function pgpsWrapResponse(response) {
  return { status: response.getResponseCode(), text: response.getContentText(), headers: response.getAllHeaders() };
}

function pgpsFetchParams(request) {
  return { url: request.url, method: 'get', headers: request.headers, muteHttpExceptions: true, followRedirects: true };
}

function pgpsFetchOne(params) {
  try {
    return pgpsWrapResponse(UrlFetchApp.fetch(params.url, params));
  } catch (e) {
    return { thrown: e };
  }
}

function pgpsTransport() {
  return {
    fetchAll: function (requests) {
      const params = requests.map(pgpsFetchParams);
      try {
        return UrlFetchApp.fetchAll(params).map(pgpsWrapResponse);
      } catch (e) {
        return params.map(pgpsFetchOne);
      }
    },
  };
}

function pgpsService() {
  return pgpsCreateService({ transport: pgpsTransport(), cache: pgpsCache(), getApiKey: pgpsReadApiKey });
}

/**
 * Latitude and longitude of the parcel centre (spills into 2 cells).
 * @param {string} reference Cadastral reference, or a column of references.
 * @param {string} country Optional ISO country code (ES, FR, DE, PT, IT…).
 * @return Latitude and longitude.
 * @customfunction
 */
function PARCEL_COORDS(reference, country) {
  return pgpsFormulaRow(pgpsService(), pgpsDetectLocale(), reference, country, ['lat', 'lon']);
}

/**
 * Plot area of the parcel in square metres.
 * @param {string} reference Cadastral reference, or a column of references.
 * @param {string} country Optional ISO country code (ES, FR, DE, PT, IT…).
 * @return Area in m².
 * @customfunction
 */
function PARCEL_AREA(reference, country) {
  return pgpsFormulaSingle(pgpsService(), pgpsDetectLocale(), reference, country, 'area');
}

/**
 * Municipality of the parcel.
 * @param {string} reference Cadastral reference, or a column of references.
 * @param {string} country Optional ISO country code (ES, FR, DE, PT, IT…).
 * @return Municipality name.
 * @customfunction
 */
function PARCEL_MUNICIPALITY(reference, country) {
  return pgpsFormulaSingle(pgpsService(), pgpsDetectLocale(), reference, country, 'municipality');
}

/**
 * Reference, country, latitude, longitude, area (m²) and municipality in one row.
 * @param {string} reference Cadastral reference, or a column of references.
 * @param {string} country Optional ISO country code (ES, FR, DE, PT, IT…).
 * @return One row per reference.
 * @customfunction
 */
function PARCEL_INFO(reference, country) {
  return pgpsFormulaRow(pgpsService(), pgpsDetectLocale(), reference, country, PGPS_INFO_FIELDS);
}

/**
 * Cadastral reference of the parcel at a point (WGS84).
 * @param {number} latitude Latitude, or a column of latitudes.
 * @param {number} longitude Longitude, or a column of longitudes.
 * @param {string} country Optional ISO country code; detected from the point when left out.
 * @return Cadastral reference.
 * @customfunction
 */
function PARCEL_AT(latitude, longitude, country) {
  return pgpsPointFormula(pgpsService(), pgpsDetectLocale(), latitude, longitude, country);
}

function pgpsShowSidebar() {
  const html = HtmlService.createHtmlOutput(SIDEBAR_HTML).setTitle(PGPS_SIDEBAR_TITLE);
  SpreadsheetApp.getUi().showSidebar(html);
}

function pgpsSidebarModel() {
  const locale = pgpsDetectLocale();
  return {
    locale: locale,
    strings: pgpsStrings(locale),
    developerUrl: pgpsDeveloperUrl(locale),
    keyEnding: pgpsMaskKey(pgpsReadApiKey()),
    countries: PGPS_COUNTRY_CODES,
  };
}

function pgpsSaveKey(apiKey) {
  const key = String(apiKey || '').trim();
  if (!key) throw new Error(pgpsT(pgpsDetectLocale(), 'keyEmpty'));
  PropertiesService.getUserProperties().setProperty(PGPS_PROPERTY_KEY, key);
  return pgpsSidebarModel();
}

function pgpsRemoveKey() {
  PropertiesService.getUserProperties().deleteProperty(PGPS_PROPERTY_KEY);
  return pgpsSidebarModel();
}

function pgpsCountOccupied(sheet, row, column, rows) {
  const lastColumn = sheet.getMaxColumns();
  const width = Math.min(PGPS_FILL_COLUMNS, lastColumn - column);
  if (width <= 0) return 0;
  const values = sheet.getRange(row, column + 1, rows, width).getValues();
  return values.filter(function (line) {
    return line.some(function (cell) { return cell !== '' && cell !== null; });
  }).length;
}

function pgpsInspectSelection(skipHeader) {
  const strings = pgpsStrings(pgpsDetectLocale());
  const range = SpreadsheetApp.getActiveRange();
  if (!range) return { error: strings.fillNoSelection };
  if (range.getNumColumns() !== 1) return { error: strings.fillMultiColumn };
  const sheet = range.getSheet();
  const headerOffset = skipHeader ? 1 : 0;
  const row = range.getRow() + headerOffset;
  const rows = range.getNumRows() - headerOffset;
  if (rows <= 0) return { error: strings.fillNoSelection };
  const column = range.getColumn();
  return {
    sheetName: sheet.getName(),
    headerRow: skipHeader ? range.getRow() : 0,
    row: row,
    column: column,
    rows: rows,
    occupied: pgpsCountOccupied(sheet, row, column, rows),
  };
}

function pgpsEnsureColumns(sheet, column) {
  const needed = column + PGPS_FILL_COLUMNS - sheet.getMaxColumns();
  if (needed > 0) sheet.insertColumnsAfter(sheet.getMaxColumns(), needed);
}

function pgpsWriteHeaders(job) {
  if (!job.headerRow) return;
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(job.sheetName);
  pgpsEnsureColumns(sheet, job.column);
  sheet.getRange(job.headerRow, job.column + 1, 1, PGPS_FILL_COLUMNS).setValues([pgpsFillHeaders(pgpsDetectLocale())]);
}

function pgpsFillRows(job) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(job.sheetName);
  const offsets = job.offsets.slice().sort(function (a, b) { return a - b; });
  const first = offsets[0];
  const span = offsets[offsets.length - 1] - first + 1;
  const column = sheet.getRange(job.row + first, job.column, span, 1).getValues();
  const refs = offsets.map(function (offset) { return column[offset - first][0]; });
  const chunk = pgpsFillChunk(pgpsService(), pgpsDetectLocale(), refs, job.country);
  pgpsEnsureColumns(sheet, job.column);
  chunk.rows.forEach(function (values, index) {
    if (!values) return;
    sheet.getRange(job.row + offsets[index], job.column + 1, 1, PGPS_FILL_COLUMNS).setValues([values]);
  });
  return {
    ok: chunk.ok,
    failed: chunk.failed,
    stop: chunk.stop,
    retryAfter: chunk.retryAfter,
    retryOffsets: chunk.retryIndexes.map(function (index) { return offsets[index]; }),
  };
}

const SIDEBAR_HTML = "<!DOCTYPE html>\n<html>\n<head>\n<base target=\"_top\">\n<link rel=\"stylesheet\" href=\"https://ssl.gstatic.com/docs/script/css/add-ons1.css\">\n<style>\nbody { padding: 12px; }\nsection { margin-bottom: 18px; }\nh3 { margin: 0 0 6px; font-size: 14px; }\ninput[type=password], select { width: 100%; box-sizing: border-box; }\n.row { margin-top: 8px; }\n.muted { color: #5f6368; font-size: 12px; }\n.status { margin-top: 8px; font-size: 12px; min-height: 16px; }\n.error { color: #c5221f; }\nprogress { width: 100%; margin-top: 8px; }\ncode { font-size: 12px; }\ndt { margin-top: 8px; }\ndd { margin: 2px 0 0; color: #5f6368; font-size: 12px; }\n</style>\n</head>\n<body>\n<p id=\"intro\" class=\"muted\"></p>\n\n<section>\n  <h3 id=\"keyLabel\"></h3>\n  <input type=\"password\" id=\"keyInput\" autocomplete=\"off\">\n  <div class=\"row\">\n    <button class=\"action\" id=\"keySave\"></button>\n    <button id=\"keyRemove\"></button>\n  </div>\n  <div class=\"status\" id=\"keyStatus\"></div>\n  <div class=\"row\"><a id=\"getKey\" target=\"_blank\" rel=\"noopener\"></a></div>\n</section>\n\n<section>\n  <h3 id=\"fillTitle\"></h3>\n  <p class=\"muted\" id=\"fillHelp\"></p>\n  <label id=\"countryLabel\" for=\"country\"></label>\n  <select id=\"country\"></select>\n  <div class=\"row\">\n    <input type=\"checkbox\" id=\"header\"><label for=\"header\" id=\"headerLabel\"></label>\n  </div>\n  <div class=\"row\">\n    <button class=\"action\" id=\"fillStart\"></button>\n    <button id=\"fillStop\" disabled></button>\n  </div>\n  <progress id=\"progress\" value=\"0\" max=\"1\" hidden></progress>\n  <div class=\"status\" id=\"fillStatus\"></div>\n</section>\n\n<section>\n  <h3 id=\"helpTitle\"></h3>\n  <dl>\n    <dt><code>=PARCEL_COORDS(ref, [country])</code></dt><dd id=\"helpCoords\"></dd>\n    <dt><code>=PARCEL_AREA(ref, [country])</code></dt><dd id=\"helpArea\"></dd>\n    <dt><code>=PARCEL_MUNICIPALITY(ref, [country])</code></dt><dd id=\"helpMunicipality\"></dd>\n    <dt><code>=PARCEL_INFO(ref, [country])</code></dt><dd id=\"helpInfo\"></dd>\n    <dt><code>=PARCEL_AT(lat, lon, [country])</code></dt><dd id=\"helpAt\"></dd>\n  </dl>\n  <p class=\"muted\" id=\"helpCountry\"></p>\n</section>\n\n<script>\nvar CHUNK_SIZE = 10;\nvar MS_PER_SECOND = 1000;\nvar model = null;\nvar job = null;\n\nfunction el(id) { return document.getElementById(id); }\n\nfunction format(template, params) {\n  return template.replace(/\\{(\\w+)\\}/g, function (match, name) {\n    return params[name] !== undefined ? String(params[name]) : match;\n  });\n}\n\nfunction setStatus(id, text, isError) {\n  var node = el(id);\n  node.textContent = text || '';\n  node.className = 'status' + (isError ? ' error' : '');\n}\n\nfunction applyModel(next) {\n  model = next;\n  var s = model.strings;\n  ['intro', 'keyLabel', 'keySave', 'keyRemove', 'getKey', 'fillTitle', 'fillHelp', 'countryLabel', 'headerLabel',\n    'fillStart', 'fillStop', 'helpTitle', 'helpCoords', 'helpArea', 'helpMunicipality', 'helpInfo', 'helpAt',\n    'helpCountry'].forEach(function (id) { el(id).textContent = s[id]; });\n  el('keyInput').placeholder = s.keyPlaceholder;\n  el('getKey').href = model.developerUrl;\n  setStatus('keyStatus', model.keyEnding ? format(s.keySaved, { last: model.keyEnding }) : s.keyMissing, false);\n  var select = el('country');\n  if (!select.options.length) {\n    select.appendChild(new Option(s.countryAuto, ''));\n    model.countries.forEach(function (code) { select.appendChild(new Option(code, code)); });\n  }\n}\n\nfunction fail(id) {\n  return function (error) { setStatus(id, error && error.message ? error.message : String(error), true); };\n}\n\nel('keySave').onclick = function () {\n  var value = el('keyInput').value.trim();\n  if (!value) { setStatus('keyStatus', model.strings.keyEmpty, true); return; }\n  google.script.run.withSuccessHandler(function (next) {\n    el('keyInput').value = '';\n    applyModel(next);\n  }).withFailureHandler(fail('keyStatus')).pgpsSaveKey(value);\n};\n\nel('keyRemove').onclick = function () {\n  google.script.run.withSuccessHandler(function (next) {\n    applyModel(next);\n    setStatus('keyStatus', model.strings.keyRemoved, false);\n  }).withFailureHandler(fail('keyStatus')).pgpsRemoveKey();\n};\n\nfunction setRunning(running) {\n  el('fillStart').disabled = running;\n  el('fillStop').disabled = !running;\n  el('progress').hidden = !running && !job;\n}\n\nfunction finish(text, isError) {\n  job = null;\n  setRunning(false);\n  setStatus('fillStatus', text, isError);\n}\n\nfunction updateProgress() {\n  el('progress').max = job.total;\n  el('progress').value = job.done;\n  setStatus('fillStatus', format(model.strings.fillProgress, { done: job.done, total: job.total }), false);\n}\n\nfunction nextChunk() {\n  if (!job) return;\n  if (job.cancelled) { finish(model.strings.fillCancelled, false); return; }\n  if (!job.queue.length) {\n    finish(format(model.strings.fillDone, { ok: job.ok, failed: job.failed }), false);\n    return;\n  }\n  var offsets = job.queue.splice(0, CHUNK_SIZE);\n  google.script.run.withSuccessHandler(function (result) {\n    job.ok += result.ok;\n    job.failed += result.failed;\n    job.done += offsets.length - result.retryOffsets.length;\n    updateProgress();\n    if (result.stop) {\n      finish(format(model.strings.fillStopped, { reason: result.stop }), true);\n      return;\n    }\n    if (result.retryOffsets.length) {\n      job.queue = result.retryOffsets.concat(job.queue);\n      setStatus('fillStatus', format(model.strings.fillPaused, { seconds: result.retryAfter }), false);\n      setTimeout(nextChunk, result.retryAfter * MS_PER_SECOND);\n      return;\n    }\n    nextChunk();\n  }).withFailureHandler(function (error) {\n    finish(error && error.message ? error.message : String(error), true);\n  }).pgpsFillRows({\n    sheetName: job.sheetName, row: job.row, column: job.column, offsets: offsets, country: job.country\n  });\n}\n\nfunction start(selection) {\n  if (selection.error) { setStatus('fillStatus', selection.error, true); return; }\n  if (selection.occupied > 0 && !window.confirm(format(model.strings.fillOccupied, { count: selection.occupied }))) return;\n  var queue = [];\n  for (var i = 0; i < selection.rows; i += 1) queue.push(i);\n  job = {\n    sheetName: selection.sheetName, row: selection.row, column: selection.column, country: el('country').value,\n    queue: queue, total: selection.rows, done: 0, ok: 0, failed: 0, cancelled: false\n  };\n  setRunning(true);\n  updateProgress();\n  google.script.run.withSuccessHandler(nextChunk).withFailureHandler(function (error) {\n    finish(error && error.message ? error.message : String(error), true);\n  }).pgpsWriteHeaders({\n    sheetName: selection.sheetName, headerRow: selection.headerRow, column: selection.column\n  });\n}\n\nel('fillStart').onclick = function () {\n  setStatus('fillStatus', '', false);\n  google.script.run.withSuccessHandler(start).withFailureHandler(fail('fillStatus'))\n    .pgpsInspectSelection(el('header').checked);\n};\n\nel('fillStop').onclick = function () { if (job) job.cancelled = true; };\n\ngoogle.script.run.withSuccessHandler(applyModel).withFailureHandler(fail('keyStatus')).pgpsSidebarModel();\n</script>\n</body>\n</html>\n";
