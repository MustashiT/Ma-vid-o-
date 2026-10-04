# Pocket Studio — Osmo Pocket 3

Site vitrine et boutique en motion design pour la DJI Osmo Pocket 3.

- `index.html` — structure de la page (hero, capteur, écran rotatif, stabilisation, modes, specs, achat, FAQ)
- `css/style.css` — design et animations CSS
- `js/main.js` — animations GSAP/ScrollTrigger, smooth scroll Lenis, panier et tunnel de commande
- `js/vendor/` — GSAP 3.12.5, ScrollTrigger et Lenis embarqués (aucun CDN requis)

## Lancer en local

```bash
python3 -m http.server 8000
# puis ouvrir http://localhost:8000
```

## Paiement

Le formulaire de commande enregistre le panier mais n'encaisse rien : branchez votre
prestataire (Stripe Checkout, Shopify Buy Button, PayPal…) dans le gestionnaire `submit`
de `#checkoutForm` dans `js/main.js`.
