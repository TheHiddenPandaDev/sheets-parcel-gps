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

if (typeof module !== 'undefined') {
  module.exports = {
    onOpen: onOpen,
    onInstall: onInstall,
    pgpsDetectLocale: pgpsDetectLocale,
    pgpsReadApiKey: pgpsReadApiKey,
    pgpsCache: pgpsCache,
    pgpsTransport: pgpsTransport,
    PARCEL_COORDS: PARCEL_COORDS,
    PARCEL_AREA: PARCEL_AREA,
    PARCEL_MUNICIPALITY: PARCEL_MUNICIPALITY,
    PARCEL_INFO: PARCEL_INFO,
    PARCEL_AT: PARCEL_AT,
    pgpsShowSidebar: pgpsShowSidebar,
    pgpsSidebarModel: pgpsSidebarModel,
    pgpsSaveKey: pgpsSaveKey,
    pgpsRemoveKey: pgpsRemoveKey,
    pgpsInspectSelection: pgpsInspectSelection,
    pgpsWriteHeaders: pgpsWriteHeaders,
    pgpsFillRows: pgpsFillRows,
  };
}
