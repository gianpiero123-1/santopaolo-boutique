# Chiaia Boutique — Brand Context

## Brand
**Chiaia Boutique** è un progetto di hospitality boutique con 5 appartamenti nel quartiere Chiaia di Napoli.

## Posizionamento
- **Target**: viaggiatori internazionali, coppie, small groups, clientela business premium
- **Tono**: dark luxury, gallerìa d'arte contemporanea, minimal — lontano da rustico/mediterraneo caldo
- **Prezzi**: €120–280/notte
- **USP**: location privilegiata a Chiaia, design curato, servizi concierge su misura

## Identità visiva
- **Palette**: nero profondo `#0E0E0E` + antracite `#1C1C1C`, testo off-white `#F5F2EC`, accento terracotta `#C8553D`
- **Font display**: Fraunces (serif, weight 400–500, tracking stretto)
- **Font body**: Inter (400, line-height 1.6)
- **Dark mode nativo** — nessun toggle light/dark
- **No border radius** pronunciati — max `rounded-sm`
- **Estetica**: gallerie d'arte, loft industriale, minimal luxury

## Appartamenti (placeholder)
1. Suite Posillipo — 1BR, 55mq, 2 ospiti, da €150/notte
2. Penthouse Chiaia — 2BR, 95mq, 4 ospiti, da €280/notte
3. Studio Mergellina — Studio, 42mq, 2 ospiti, da €120/notte
4. Attico Pedigrotta — 2BR, 82mq, 4 ospiti, da €240/notte
5. Loft Via Caracciolo — 1BR, 68mq, 3 ospiti, da €180/notte

## Lingue
- **IT** = default (no prefisso URL)
- **EN** = `/en/...`

## Stack tecnico
- **Framework**: Astro (latest) + TypeScript
- **CSS**: Tailwind CSS v4 con `@theme` personalizzato
- **i18n**: built-in Astro i18n, strings in `src/i18n/`
- **Booking**: Smoobu (TODO — placeholder in `BookingWidget.astro`)
- **Deploy**: Vercel

## TODO prima del lancio
- [ ] Sostituire testi lorem con contenuti reali
- [ ] Inserire foto vere negli appartamenti (`src/data/apartments.json` → `photos`)
- [ ] Integrare widget Smoobu in `src/components/BookingWidget.astro`
- [ ] Collegare form contatti a servizio email (Resend, Formspree, ecc.)
- [ ] Aggiornare `site` in `astro.config.mjs` con dominio reale
- [ ] Aggiornare numeri telefono reali ovunque
- [ ] Aggiungere OG image reale in `public/og-default.jpg`
- [ ] Configurare analytics (Plausible consigliato per privacy)
