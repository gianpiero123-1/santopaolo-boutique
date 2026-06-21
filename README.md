# Chiaia Boutique

Sito web per 5 appartamenti boutique nel quartiere Chiaia di Napoli.

**Stack**: Astro · Tailwind CSS v4 · TypeScript · i18n IT+EN

---

## Avvio rapido

```bash
npm install
npm run dev
```

Apri [http://localhost:4321](http://localhost:4321)

---

## Struttura

```
src/
├── components/
│   ├── Navbar.astro
│   ├── Footer.astro
│   ├── ApartmentCard.astro
│   ├── ServiceCard.astro
│   ├── BookingWidget.astro   ← TODO: embed Smoobu
│   ├── WhatsAppFloat.astro
│   └── LanguageSwitcher.astro
├── data/
│   ├── apartments.json       ← 5 appartamenti (valori placeholder)
│   └── services.json         ← catalogo concierge
├── i18n/
│   ├── it.ts                 ← stringhe IT (default)
│   ├── en.ts                 ← stringhe EN
│   └── index.ts              ← utility t(), getLangFromPath()
├── layouts/
│   └── BaseLayout.astro      ← layout base con SEO + OG
├── pages/
│   ├── index.astro           # / (IT home)
│   ├── apartments/index.astro + [slug].astro
│   ├── concierge/index.astro + services.astro
│   ├── chiaia.astro / contact.astro / book.astro
│   ├── privacy.astro / terms.astro / 404.astro
│   └── en/                   # mirror EN di tutte le pagine
└── styles/
    └── global.css            ← Tailwind @theme + utilities
```

---

## Design system

| Token | Valore | Classe |
|-------|--------|--------|
| BG primario | `#0E0E0E` | `bg-brand-bg` |
| BG secondario | `#1C1C1C` | `bg-brand-bg2` |
| Testo | `#F5F2EC` | `text-brand-text` |
| Muted | `#8A8580` | `text-brand-muted` |
| Accento | `#C8553D` | `text-brand-accent` |
| Bordi | `#2A2A2A` | `border-brand-border` |

Font: **Fraunces** (`.font-display`) + **Inter** (default)

---

## i18n

- IT = default, no prefisso (`/`, `/apartments`, ...)
- EN = `/en/` prefix (`/en/`, `/en/apartments`, ...)

---

## Comandi

| Comando | Azione |
|---------|--------|
| `npm run dev` | Dev server `localhost:4321` |
| `npm run build` | Build produzione in `dist/` |
| `npm run preview` | Preview build locale |

---

## TODO pre-lancio

- [ ] Foto reali negli appartamenti (`src/data/apartments.json`)
- [ ] Integrare Smoobu in `src/components/BookingWidget.astro`
- [ ] Collegare form contatti (Resend / Formspree)
- [ ] Aggiornare `site` in `astro.config.mjs`
- [ ] Sostituire numeri telefono placeholder
- [ ] OG image reale (`public/og-default.jpg`)
