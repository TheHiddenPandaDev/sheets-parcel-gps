import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createRequire } from 'module';
import core from '../src/core.js';

const require = createRequire(import.meta.url);
Object.assign(globalThis, core, { SIDEBAR_HTML: '<p>sidebar</p>' });
const code = require('../src/Code.js');

const MADRID = { refCatastral: 'R1', pais: 'ES', municipio: 'MADRID', latitud: 40.4, longitud: -3.7, superficieParcela: 900 };

function httpResponse(status, body, headers) {
  return {
    getResponseCode: () => status,
    getContentText: () => (typeof body === 'string' ? body : JSON.stringify(body)),
    getAllHeaders: () => headers || {},
  };
}

function fakeSheet(name, grid) {
  const writes = [];
  const sheet = {
    writes,
    maxColumns: 3,
    getName: () => name,
    getMaxColumns: () => sheet.maxColumns,
    insertColumnsAfter: vi.fn((after, count) => { sheet.maxColumns += count; }),
    getRange: (row, column, rows, columns) => ({
      getValues: () => {
        const out = [];
        for (let r = 0; r < rows; r += 1) {
          const line = [];
          for (let c = 0; c < columns; c += 1) {
            const cell = grid[row + r - 1] && grid[row + r - 1][column + c - 1];
            line.push(cell === undefined ? '' : cell);
          }
          out.push(line);
        }
        return out;
      },
      setValues: (values) => writes.push({ row, column, values }),
    }),
  };
  return sheet;
}

let properties;
let ui;
let sheet;
let activeRange;

function installGlobals() {
  properties = {};
  ui = { menu: [], sidebar: null };
  const menu = {
    addItem: (label, fn) => { ui.menu.push([label, fn]); return menu; },
    addToUi: vi.fn(),
  };
  sheet = fakeSheet('Data', [['Ref'], ['R1'], [''], ['R2']]);
  activeRange = {
    getNumColumns: () => 1,
    getNumRows: () => 4,
    getRow: () => 1,
    getColumn: () => 1,
    getSheet: () => sheet,
  };
  globalThis.Session = { getActiveUserLocale: () => 'es_ES' };
  globalThis.SpreadsheetApp = {
    getUi: () => ({ createAddonMenu: () => menu, showSidebar: (html) => { ui.sidebar = html; } }),
    getActiveSpreadsheet: () => ({ getSpreadsheetLocale: () => 'en_GB', getSheetByName: () => sheet }),
    getActiveRange: () => activeRange,
  };
  globalThis.PropertiesService = {
    getUserProperties: () => ({
      getProperty: (key) => (key in properties ? properties[key] : null),
      setProperty: (key, value) => { properties[key] = value; },
      deleteProperty: (key) => { delete properties[key]; },
    }),
  };
  const store = {};
  globalThis.CacheService = {
    getDocumentCache: () => ({
      getAll: (keys) => Object.fromEntries(keys.filter((k) => k in store).map((k) => [k, store[k]])),
      putAll: (values) => Object.assign(store, values),
    }),
    getScriptCache: () => null,
  };
  globalThis.UrlFetchApp = {
    fetchAll: vi.fn((params) => params.map(() => httpResponse(200, { success: true, data: MADRID }))),
    fetch: vi.fn(() => httpResponse(200, { success: true, data: MADRID })),
  };
  globalThis.HtmlService = {
    createHtmlOutput: (html) => ({ html, setTitle(title) { this.title = title; return this; } }),
  };
}

beforeEach(installGlobals);

describe('menu and locale', () => {
  it('adds the add-on menu in the user language', () => {
    code.onInstall();
    expect(ui.menu.map((item) => item[0])).toEqual(['Abrir panel', 'Rellenar rango seleccionado']);
  });

  it('falls back to the spreadsheet locale, then to English', () => {
    globalThis.Session = { getActiveUserLocale: () => { throw new Error('no auth'); } };
    expect(code.pgpsDetectLocale()).toBe('en');
    globalThis.SpreadsheetApp.getActiveSpreadsheet = () => ({ getSpreadsheetLocale: () => 'es_ES' });
    expect(code.pgpsDetectLocale()).toBe('es');
    globalThis.SpreadsheetApp.getActiveSpreadsheet = () => { throw new Error('none'); };
    expect(code.pgpsDetectLocale()).toBe('en');
  });

  it('opens the sidebar with the bundled HTML', () => {
    code.pgpsShowSidebar();
    expect(ui.sidebar).toMatchObject({ html: '<p>sidebar</p>', title: 'Parcel GPS' });
  });
});

describe('api key', () => {
  it('saves, masks and removes the key', () => {
    expect(code.pgpsSidebarModel().keyEnding).toBe('');
    const model = code.pgpsSaveKey('  my-secret-key-9876 ');
    expect(properties.PARCEL_GPS_API_KEY).toBe('my-secret-key-9876');
    expect(model.keyEnding).toBe('9876');
    expect(JSON.stringify(model)).not.toContain('my-secret');
    expect(code.pgpsRemoveKey().keyEnding).toBe('');
  });

  it('refuses an empty key', () => {
    expect(() => code.pgpsSaveKey('  ')).toThrow('Pega primero una clave.');
    expect(() => code.pgpsSaveKey(undefined)).toThrow();
  });

  it('reads no key when properties are not available', () => {
    globalThis.PropertiesService = { getUserProperties: () => { throw new Error('no access'); } };
    expect(code.pgpsReadApiKey()).toBe('');
  });
});

describe('custom functions', () => {
  beforeEach(() => { properties.PARCEL_GPS_API_KEY = 'key-1234'; });

  it('answer every formula through UrlFetchApp with the key header', () => {
    expect(code.PARCEL_COORDS('R1')).toEqual([[40.4, -3.7]]);
    expect(code.PARCEL_AREA('R1', 'ES')).toBe(900);
    expect(code.PARCEL_MUNICIPALITY('R2')).toBe('MADRID');
    expect(code.PARCEL_INFO('R3', 'es')).toEqual([['R1', 'ES', 40.4, -3.7, 900, 'MADRID']]);
    const params = UrlFetchApp.fetchAll.mock.calls[0][0][0];
    expect(params).toMatchObject({ method: 'get', muteHttpExceptions: true });
    expect(params.headers['X-API-Key']).toBe('key-1234');
  });

  it('returns the reference at a point', () => {
    UrlFetchApp.fetchAll = vi.fn(() => [httpResponse(200, { success: true, data: { referenciaCatastral: 'PT1', coordenadas: { latitud: 1, longitud: 2 } } })]);
    expect(code.PARCEL_AT(38.7, -9.1, 'PT')).toBe('PT1');
  });

  it('serves repeated formulas from the document cache', () => {
    code.PARCEL_AREA('R1');
    code.PARCEL_AREA('R1');
    expect(UrlFetchApp.fetchAll).toHaveBeenCalledTimes(1);
  });

  it('shows a clear message for a missing key', () => {
    delete properties.PARCEL_GPS_API_KEY;
    expect(code.PARCEL_AREA('R1')).toContain('falta la clave');
    expect(UrlFetchApp.fetchAll).not.toHaveBeenCalled();
  });

  it('shows clear messages for a bad key, the quota, not found and coverage', () => {
    const cases = [
      [401, 'KEY_AUTH_002', 'clave de API no válida'],
      [429, 'KEY_AUTH_004', 'cuota mensual agotada'],
      [404, 'NOT_FOUND', 'no encontrada'],
      [422, 'CNV_COVERAGE', '29 países europeos'],
    ];
    cases.forEach(([status, errorCode, text], index) => {
      UrlFetchApp.fetchAll = vi.fn(() => [httpResponse(status, { success: false, code: errorCode, error: 'x' })]);
      expect(code.PARCEL_MUNICIPALITY('X' + index)).toContain(text);
    });
  });

  it('falls back to one fetch per request when fetchAll throws, and reports timeouts', () => {
    UrlFetchApp.fetchAll = vi.fn(() => { throw new Error('Timeout'); });
    UrlFetchApp.fetch = vi.fn((url) => {
      if (url.includes('/SLOW')) throw new Error('Timeout: request took too long');
      return httpResponse(200, { success: true, data: MADRID });
    });
    expect(code.PARCEL_AREA([['OK'], ['SLOW']])).toEqual([[900], [code.PARCEL_AREA('SLOW')]]);
    expect(code.PARCEL_AREA('SLOW')).toContain('tardó demasiado');
  });

  it('works without any cache', () => {
    globalThis.CacheService = { getDocumentCache: () => { throw new Error('no cache'); } };
    expect(code.pgpsCache()).toBeNull();
    expect(code.PARCEL_AREA('R1')).toBe(900);
  });
});

describe('fill selected range', () => {
  beforeEach(() => { properties.PARCEL_GPS_API_KEY = 'key-1234'; });

  it('rejects a missing or multi-column selection', () => {
    globalThis.SpreadsheetApp.getActiveRange = () => null;
    expect(code.pgpsInspectSelection(false).error).toBe('Selecciona primero una columna de referencias.');
    globalThis.SpreadsheetApp.getActiveRange = () => Object.assign({}, activeRange, { getNumColumns: () => 2 });
    expect(code.pgpsInspectSelection(false).error).toBe('Selecciona una sola columna de referencias.');
    globalThis.SpreadsheetApp.getActiveRange = () => Object.assign({}, activeRange, { getNumRows: () => 1 });
    expect(code.pgpsInspectSelection(true).error).toBeDefined();
  });

  it('describes the selection and counts occupied rows to the right', () => {
    sheet = fakeSheet('Data', [['Ref', 'h'], ['R1', 'x'], [''], ['R2']]);
    const selection = code.pgpsInspectSelection(true);
    expect(selection).toEqual({ sheetName: 'Data', headerRow: 1, row: 2, column: 1, rows: 3, occupied: 1 });
    expect(code.pgpsInspectSelection(false)).toMatchObject({ headerRow: 0, row: 1, rows: 4 });
  });

  it('counts nothing when there are no columns to the right', () => {
    sheet.maxColumns = 1;
    expect(code.pgpsInspectSelection(false).occupied).toBe(0);
  });

  it('writes headers, adding columns when needed', () => {
    code.pgpsWriteHeaders({ sheetName: 'Data', headerRow: 1, column: 1 });
    expect(sheet.insertColumnsAfter).toHaveBeenCalledWith(3, 3);
    expect(sheet.writes[0]).toEqual({ row: 1, column: 2, values: [['País', 'Latitud', 'Longitud', 'Superficie (m²)', 'Municipio']] });
    code.pgpsWriteHeaders({ sheetName: 'Data', headerRow: 0, column: 1 });
    expect(sheet.writes).toHaveLength(1);
  });

  it('fills rows next to the references and skips blanks', () => {
    const result = code.pgpsFillRows({ sheetName: 'Data', row: 2, column: 1, offsets: [2, 0, 1], country: '' });
    expect(result).toEqual({ ok: 2, failed: 0, stop: null, retryAfter: 0, retryOffsets: [] });
    expect(sheet.writes.map((w) => w.row)).toEqual([2, 4]);
    expect(sheet.writes[0].values).toEqual([['ES', 40.4, -3.7, 900, 'MADRID']]);
  });

  it('hands rate-limited rows back with the pause length', () => {
    UrlFetchApp.fetchAll = vi.fn((params) => params.map((p) => (p.url.includes('/R2')
      ? httpResponse(429, { success: false, code: 'KEY_RATE_002', error: 'x' }, { 'Retry-After': '20' })
      : httpResponse(200, { success: true, data: MADRID }))));
    const result = code.pgpsFillRows({ sheetName: 'Data', row: 2, column: 1, offsets: [0, 2], country: 'ES' });
    expect(result).toMatchObject({ ok: 1, retryAfter: 20, retryOffsets: [2] });
  });

  it('stops the run on a bad key', () => {
    UrlFetchApp.fetchAll = vi.fn((params) => params.map(() => httpResponse(401, { success: false, code: 'KEY_AUTH_003', error: 'x' })));
    const result = code.pgpsFillRows({ sheetName: 'Data', row: 2, column: 1, offsets: [0], country: '' });
    expect(result.stop).toContain('clave de API no válida');
    expect(sheet.writes).toHaveLength(0);
  });
});
