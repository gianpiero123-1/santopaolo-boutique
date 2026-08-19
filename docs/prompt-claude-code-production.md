# Prompt per Claude Code, ricostruzione pagina production

Copia tutto il blocco sotto la riga e incollalo in Claude Code.

---

Ricostruisci la pagina production usando come riferimento visivo il file `docs/mockup-production.html` che trovi nella root del progetto. Leggilo per intero prima di iniziare.

## Regole

Design system invariato: sfondo #0E0E0E, pannelli #1C1C1C, testo #F5F2EC, testo secondario #B5B0AA, grigio marmo #8A8580, bordeaux #6B1F1F, hover #8A2A2A. Fraunces per i titoli, Inter per il corpo, IBM Plex Mono solo per etichette tecniche e occhielli. Zero emoji. Nessun trattino come separatore, si usano virgole o si riformula. Mai la parola lusso o luxury.

Non toccare il link ai font in `BaseLayout.astro`. Rimuovi dal CSS che porti dentro il componente il tag `<link>` verso Google Fonts presente nel mockup, i font sono già caricati globalmente.

Nessun riferimento alla ZTL, in nessuna forma.

## 1. File da riscrivere

`src/components/operations/OperationsProduction.astro`

Riscrivilo da zero replicando struttura, CSS e comportamento del mockup. Sette blocchi nell'ordine:

1. Hero a schermo pieno con i quattro fasci di luce animati e il ticker in mono a fondo sezione
2. Sezione superficie, pannello con gradiente bordeaux, numero 1.000+ e le tre destinazioni in colonna
3. Ambiti operativi, indice sticky a sinistra e tre pannelli a destra con lavaggio bordeaux sul pannello attivo
4. Un solo indirizzo, tre bande sfalsate, la terza campita in bordeaux
5. Griglia foto asimmetrica a cinque slot, resta con i placeholder
6. Dati tecnici, elenco di definizione a due colonne
7. Chiusura, intestazione a piena larghezza più due colonne, recapiti a sinistra e modulo brief a destra, piede con ragione sociale e partita IVA

Porta dentro il componente tutto il CSS del mockup dentro un unico blocco `<style>` scoped, e i due script inline dentro un unico `<script>`: il reveal su IntersectionObserver e l'indice sticky degli ambiti. Entrambi devono rispettare `prefers-reduced-motion`.

## 2. Copy bilingue

Tutte le stringhe vanno in `src/lib/operations.ts`, nessun testo hardcoded nel componente. Mantieni la struttura già presente nel file.

Le stringhe IT sono quelle del mockup, riprendile alla lettera. Queste sono le EN:

**Hero**
- occhiello: Production base, Naples Chiaia
- titolo: Accommodation and vehicle storage
- titolo, seconda riga in grigio marmo: at a single address.
- testo: Eighteen beds across five units and over a thousand covered square metres in the same building. No transfer between crew accommodation and vehicle storage.
- azione: Send a brief

**Ticker**
- Covered surface over 1,000 sqm
- Over 100 parking spaces
- Height limit 3.00 m
- Access 24 hours, 365 days
- Loading and unloading under cover
- Full video surveillance

**Superficie**
- occhiello: Covered surface
- unità: Square metres, garage level
- testo 1: Over a thousand covered square metres beneath the guest units. Covered space in Chiaia is structurally scarce, and an area of this size has no equivalent in the district.
- testo 2: The space is not sold at a daily rate. It is set aside for the actual duration of the production, with formal handover on collection and return.
- etichetta delle tre colonne: Use
- Vehicle storage, Over a hundred covered parking spaces, height limit three metres.
- Enclosed storage, Portions of the floor reserved for the duration of the production.
- Manoeuvring and loading, Carried out indoors, sheltered from the weather.

**Ambiti operativi**
- occhiello: Operational scope
- titolo: Three functions within the same perimeter.
- voci indice: Accommodation, Storage, Handling

1. Hospitality, Crew accommodation. Five units from 45 to 90 square metres, available individually or as a whole floor. Kitchen in every unit, shared laundry, gym and steam room on the wellness level. No time restrictions on arrivals and departures. Etichette: 18 beds, Whole floor, Laundry, Wellness
2. Storage, Vehicle and equipment storage. Technical vehicles and set equipment remain under cover for the full length of the shoot, under full video surveillance, with no need to unload onto the street at the end of the day. Height limit three metres, no width restriction. Etichette: Height 3.00 m, Video surveillance, 24 hour access, EV charging
3. Handling, Loading, unloading and storage. Indoor manoeuvring area for loading and unloading, sheltered from the weather. Portions of the floor can be enclosed as storage for the duration of the production, with handover agreed on collection and return. Etichette: Indoor loading, Storage, Site visit

**Un solo indirizzo**
- occhiello: A single address
- titolo: No transfer between accommodation and storage.
- testo: Vico Santa Maria a Cappella Vecchia 8b. Everything the production needs is contained within the same building, with a single point of contact for access, suppliers and schedules.
- bande: Apartment level, 18 beds, Five units, 325 sqm. Wellness level, Gym and steam room, Reserved for guests. Garage level, Over 1,000 sqm, Over 100 parking spaces

**Materiale fotografico**
- occhiello: Photographic material
- titolo: Five frames, in reading order.
- didascalie: Vehicle entrance, with height reference. Central aisle in perspective. Parking space with commercial vehicle. Loading and unloading area. Open floor, configurable as storage.
- nota: Slots awaiting material. Landscape orientation, lights on, with a person or a measuring reference in at least two frames to convey scale.

**Dati tecnici**
- occhiello: Technical data
- titolo: Verified on site.
- Covered surface, Over 1,000 sqm
- Parking spaces, Over 100
- Height limit, 3.00 m
- Vehicle width, No restriction
- Access, 24 hours, 365 days
- Video surveillance, Full
- Loading and unloading, Indoors, under cover
- EV charging, Available
- Beds, 18 across five units

**Chiusura**
- occhiello: Taking on the project
- titolo: Provide dates, vehicles and the space required.
- testo: Site visit by appointment, available same day. Quotation based on the actual perimeter of the production, not on a standard rate card.
- recapiti: Contact, Telephone, Email, Address
- nota recapiti: For productions requiring vehicle storage a preliminary site visit is recommended, as it is the only way to verify height limits and access routes.
- campi modulo: Production or company, Contact, Email, Telephone, Type of production, Dates, Beds required, Vehicles to store, Space requirements and notes
- voci del menu tipo di lavorazione: Feature or series, Advertising, Photo shoot or fashion, Event, Other
- azione: Send the brief
- nota modulo: Response within twenty four working hours. The information provided is used solely to prepare the quotation.

## 3. Modulo

Il modulo della chiusura sostituisce `BriefForm.astro` sulla pagina production. Rimuovi l'import e l'uso di `BriefForm` da `OperationsProduction.astro`, lascia il componente in uso sull'hub senza modificarlo.

Collega il modulo a `POST /api/brief` con `fetch`, invio in JSON con tutti i campi. Gestisci tre stati sul pulsante: pronto, invio in corso, inviato. In caso di errore mostra un messaggio sotto il pulsante, in mono, colore #8A2A2A, testo IT: Trasmissione non riuscita, riprovare o scrivere direttamente. Testo EN: Submission failed, please retry or write to us directly.

Non modificare `src/pages/api/brief.ts` in questa passata.

## 4. Verifiche prima di chiudere

- Nessuna occorrenza di 3.000, di 150, della parola stalli, della parola ZTL, in tutto il progetto
- Il numero corretto è oltre 1.000 metri quadri, i posti auto sono oltre 100
- `src/pages/operations/production.astro` e la versione EN restano wrapper sottili, cambia solo il componente
- Le pagine restano indicizzabili, canonical e hreflang invariati
- Controlla il rendering a 375, 768, 1280 e 1600 pixel di larghezza
- Su mobile il numero della sezione superficie non deve sovrapporsi al testo
- Nessun errore in console

Non fare commit, non fare push. Al termine elencami i file toccati.
