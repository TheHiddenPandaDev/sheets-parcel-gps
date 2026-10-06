# Google Workspace Marketplace listing

Everything the Marketplace SDK "Store listing" and "App configuration" pages ask for. Copy field by field.

## Fixed data

| Field | Value |
|---|---|
| App name | Parcel GPS – European cadastral parcels |
| Developer name | The Hidden Panda |
| Developer website | https://www.parcelgps.com/en |
| Developer email / support email | soporte@catastrogps.es |
| Category | Business tools (alternative: Productivity) |
| Pricing | Free with paid features (the add-on is free; the API key has a free plan and paid plans) |
| Terms of service URL | https://www.parcelgps.com/en/terms |
| Privacy policy URL | https://www.parcelgps.com/en/privacy |
| Support URL | https://www.parcelgps.com/en/developers |
| Source code (optional "Report an issue") | https://github.com/TheHiddenPandaDev/sheets-parcel-gps/issues |
| Integration | Sheets add-on (Editor add-on) |
| OAuth scopes | `https://www.googleapis.com/auth/script.external_request`, `https://www.googleapis.com/auth/spreadsheets.currentonly`, `https://www.googleapis.com/auth/script.container.ui` |
| Icons | `icon-32.png`, `icon-48.png`, `icon-96.png`, `icon-128.png` in this folder (512 also included) |
| Card banner (220×140) | To make: logo on blue + "29 European countries in your sheet" |
| Screenshots (1280×800, 1 to 5) | To capture after the test install: formulas filled, sidebar with the key saved, a column filled with progress |

## English

**Short description** (max 200 characters)

Official cadastral parcels from 29 European countries in Google Sheets: coordinates, area and municipality from a cadastral reference, or the reference at a point.

**Detailed description**

Parcel GPS brings official cadastral data from 29 European countries into Google Sheets with five formulas:

- =PARCEL_COORDS(ref, [country]): latitude and longitude of the parcel centre
- =PARCEL_AREA(ref, [country]): plot area in m²
- =PARCEL_MUNICIPALITY(ref, [country]): municipality
- =PARCEL_INFO(ref, [country]): reference, country, latitude, longitude, area and municipality in one row
- =PARCEL_AT(lat, lon, [country]): the cadastral reference of the parcel at a point

Works by cadastral reference in 27 countries and by coordinates in all 29, including Spain (with the Basque Country and Navarre), Portugal, France, Italy, Germany, Austria, Poland, the Netherlands, Belgium, Switzerland and the Nordic and Baltic countries. The country is detected from the reference when you leave it out.

Fill a whole column at once: select your references, click Fill and get country, coordinates, area and municipality in the next five columns, with progress and automatic pauses if you hit your plan's per-minute limit.

Clear messages in the cell instead of #ERROR!: missing key, quota used up, parcel not found, country not covered.

Built for real-estate and land teams, surveyors, appraisers, solar developers, insurers and anyone who keeps parcels in a spreadsheet.

Needs a Parcel GPS API key. The free plan includes 250 requests a month and failed lookups are not charged; paid plans start at 19 € a month. Answers are cached for 6 hours so recalculations do not spend your quota. Your key is stored in your own Google account and is only sent to api.parcelgps.com.

## Español

**Descripción corta** (máx. 200 caracteres)

Parcelas catastrales oficiales de 29 países europeos en Google Sheets: coordenadas, superficie y municipio a partir de la referencia catastral, o la referencia de un punto.

**Descripción detallada**

Parcel GPS lleva los datos catastrales oficiales de 29 países europeos a Google Sheets con cinco fórmulas:

- =PARCEL_COORDS(ref, [país]): latitud y longitud del centro de la parcela
- =PARCEL_AREA(ref, [país]): superficie de la parcela en m²
- =PARCEL_MUNICIPALITY(ref, [país]): municipio
- =PARCEL_INFO(ref, [país]): referencia, país, latitud, longitud, superficie y municipio en una fila
- =PARCEL_AT(lat, lon, [país]): la referencia catastral de la parcela en un punto

Funciona por referencia catastral en 27 países y por coordenadas en los 29, entre ellos España (con País Vasco y Navarra), Portugal, Francia, Italia, Alemania, Austria, Polonia, Países Bajos, Bélgica, Suiza y los países nórdicos y bálticos. Si no indicas el país, se deduce de la referencia.

Rellena una columna entera de una vez: selecciona las referencias, pulsa Rellenar y obtén país, coordenadas, superficie y municipio en las cinco columnas siguientes, con barra de progreso y pausas automáticas si llegas al límite por minuto de tu plan.

Mensajes claros en la celda en lugar de #ERROR!: falta la clave, cuota agotada, parcela no encontrada, país sin cobertura.

Pensado para inmobiliarias, gestión de suelo, topógrafos, tasadores, promotoras solares, aseguradoras y cualquiera que lleve parcelas en una hoja de cálculo.

Necesita una clave de la API de Parcel GPS. El plan gratuito incluye 250 consultas al mes y las consultas fallidas no cuentan; los planes de pago empiezan en 19 € al mes. Las respuestas se guardan 6 horas para que los recálculos no gasten cuota. La clave se guarda en tu propia cuenta de Google y solo se envía a api.parcelgps.com.

## OAuth consent screen: scope justifications

- `script.external_request`: calls the Parcel GPS API (api.parcelgps.com, the only host in the URL fetch allowlist) to look up the parcels the user asks for.
- `spreadsheets.currentonly`: reads the selected column of references and writes the results next to it, only in the spreadsheet where the add-on is used.
- `script.container.ui`: shows the add-on menu and the sidebar where the user saves the API key and runs the batch fill.
