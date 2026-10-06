# Parcel GPS for Google Sheets

Spreadsheet functions for the [Parcel GPS API](https://www.parcelgps.com/en/developers): official cadastral parcels from **29 European countries** (by cadastral reference in 27, by coordinates in all 29), straight into Google Sheets.

| Formula | Returns |
|---|---|
| `=PARCEL_COORDS(ref, [country])` | Latitude and longitude of the parcel centre (spills into 2 cells) |
| `=PARCEL_AREA(ref, [country])` | Plot area in m² |
| `=PARCEL_MUNICIPALITY(ref, [country])` | Municipality |
| `=PARCEL_INFO(ref, [country])` | One row: reference, country, latitude, longitude, area, municipality |
| `=PARCEL_AT(lat, lon, [country])` | Cadastral reference of the parcel at a point |

`country` is optional (`ES`, `FR`, `DE`, `PT`, `IT`, `PL`, `NL`…): when you leave it out it is detected from the reference or the point. It is required for Greece (`GR`), Latvia (`LV`) and Ireland (`IE`) references. Every formula also takes a whole column, e.g. `=PARCEL_INFO(A2:A200)`, and sends the lookups in one parallel batch.

## Example

| | A | B | C |
|---|---|---|---|
| 1 | Reference | Country | |
| 2 | `9872023VH5797S0001WX` | `ES` | `=PARCEL_INFO(A2, B2)` |
| 3 | `0745901TG4304N0002KH` | | `=PARCEL_AREA(A3)` |
| 4 | `40.41998` | `-3.70377` | `=PARCEL_AT(A4, B4)` |

Row 2 fills `C2:H2` with the reference, `ES`, latitude, longitude, area in m² and municipality.

## Install in 2 minutes (copy and paste)

1. Get a free API key (250 requests a month, failed lookups are not charged) at [parcelgps.com/developers](https://www.parcelgps.com/en/developers).
2. Open your Google Sheet and go to **Extensions → Apps Script**.
3. Rename the project (top left) to **Parcel GPS**.
4. Delete everything in `Code.gs` and paste the whole content of [`dist/Code.gs`](https://raw.githubusercontent.com/TheHiddenPandaDev/sheets-parcel-gps/main/dist/Code.gs). Click **Save**.
5. Go back to the sheet and reload the page. Open **Extensions → Parcel GPS → Open sidebar**, accept the permissions, paste your API key and click **Save key**.
6. Type `=PARCEL_AREA("9872023VH5797S0001WX")` in any cell.

Google asks for three permissions: connect to an external service (the Parcel GPS API, and nothing else), see and edit **this** spreadsheet only (to fill a selected range), and show the sidebar.

## Fill a whole column

Select a column of references, open the sidebar and click **Fill**. Country, latitude, longitude, area (m²) and municipality are written into the 5 columns to the right, 10 rows at a time, with a progress bar. If the per-minute limit of your plan is hit, it pauses for the time the API asks and carries on by itself. A bad key or a used-up monthly quota stops the run with a clear message. If those columns already contain data, you are asked before anything is overwritten.

## Errors in the cell

Instead of `#ERROR!`, the cell explains what happened: missing or invalid key, monthly quota used up, too many requests (with the seconds to wait), parcel not found, country not covered, a reference that fits several countries (add the country code), the official cadastre not responding, timeouts. Messages are in Spanish when your Google account language is Spanish, in English otherwise.

## Usage and caching

Sheets recalculates custom functions often, so every successful answer is cached for 6 hours in the document cache: reopening the sheet or copying a formula does not spend your quota again. Failed lookups are not cached and are not charged by the API. Blank cells never call the API.

## Privacy

The key is stored in your Google account's user properties for this script, never written to the sheet and never logged. Only the reference or the coordinates you ask about are sent to `api.parcelgps.com`. Note that Google runs custom functions with the **spreadsheet owner's** user properties, so in a shared sheet the formulas use the owner's key. See the [privacy policy](https://www.parcelgps.com/en/privacy) and [terms](https://www.parcelgps.com/en/terms).

## Development

```bash
npm install
npm test                 # vitest
npm run test:coverage    # coverage report, fails under 80 %
npm run build            # bundles src/ into dist/Code.gs and dist/appsscript.json
```

- `src/core.js`: HTTP requests, response parsing, errors, caching and cell formatting. Plain functions, no Google services, tested in Node.
- `src/Code.js`: the Apps Script layer (custom functions, menu, sidebar endpoints, `UrlFetchApp`, `CacheService`, `PropertiesService`).
- `src/sidebar.html`: the sidebar, embedded into `dist/Code.gs` by the build so the copy-paste install is a single file.
- `src/appsscript.json`: minimal scopes (`script.external_request`, `spreadsheets.currentonly`, `script.container.ui`) and a URL fetch allowlist for `https://api.parcelgps.com/`.

With [clasp](https://github.com/google/clasp): copy `.clasp.json.example` to `.clasp.json`, set your `scriptId` and run `npm run push`.

## Other ways to use the API

[JavaScript](https://www.npmjs.com/package/parcelgps), [Python](https://pypi.org/project/parcelgps/) and Go SDKs, an [MCP server](https://github.com/TheHiddenPandaDev/catastro_gps_mcp) for AI assistants, and the [OpenAPI spec](https://api.parcelgps.com/api/openapi.json).

## License

MIT. Data © the official cadastre of each country; see the attribution returned by the API.
