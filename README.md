# PicDropNFC MVP (GitHub Pages)

Static, no-build MVP for NFC tag -> product page -> Dropbox view/upload flows.

## Required structure

- `/product1/` (duplicate for each product)
  - `index.html`
  - `styles.css`
  - `script.js`
  - `config.js` (product-specific settings only)
- `/assets/`
  - `/shared/` shared reset/components/analytics hook
  - `/themes/theme-01 ... theme-10/` theme CSS and assets

## Where to paste Dropbox links

Edit `product1/config.js`:

- `dropboxViewUrl`: your Dropbox shared **view** link
- `dropboxUploadUrl`: your Dropbox **file request/upload** link

No API tokens or secrets are used/stored.

## Duplicate product1 into product2

1. Copy folder:
   - `cp -R product1 product2`
2. Edit `product2/config.js`:
   - `productDisplayName`
   - `themeId`
   - Dropbox URLs
   - optional event fields (`coupleName`, `eventName`, `date`)
3. NFC tag should point to `/product2/`.

## Change theme per product

Set `themeId` in that product's `config.js`, e.g.:

```js
window.PICDROP_PRODUCT_CONFIG = {
  themeId: "theme-05"
}
```

Optional dev preview (does not change config):

- `https://<your-pages-domain>/product1/?theme=theme-03`

## GitHub Pages deployment

1. Push this repo to GitHub (repo name can be `PicDropNFC`).
2. In GitHub: **Settings -> Pages**.
3. Source: **Deploy from a branch**.
4. Branch: `main` (or your default), folder: `/ (root)`.
5. Save and wait for the Pages URL.

## Video upload limitation (important)

Because this MVP is static, it **cannot** inspect files before Dropbox receives them.

Best practical path:

1. Prefer Dropbox **File Requests** and check if Dropbox currently offers file-type restrictions in your plan/UI.
2. Keep clear UI guidance: "Photos only, no videos" (included on page).
3. If strict enforcement is required, add a serverless upload endpoint (Cloudflare Workers / Netlify Functions / AWS Lambda) that validates MIME/type then forwards accepted files.
