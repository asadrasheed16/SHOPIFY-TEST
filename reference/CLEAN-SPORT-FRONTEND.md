# Clean Sport frontend transfer

Reference: `Nineties90-Clean-Sport-v1.1.0.zip`, confirmed by the user. Its extracted contents were verified byte-for-byte against the ZIP before use.

The main working folder is `D:\CLIENTS\nineties90\shopify-template\Custom-Shopify-Theme`.

## Presentation

- Imported the reference homepage sections, artwork, bundled fonts, responsive styles, slideshow, menu presentation, and entrance animations under the `n90-clean-` prefix.
- Applied the same visual language to the main theme's existing product, collection, search, cart, and shared interface components. Collection/search presentation uses a sidebar and three desktop product columns.
- Kept the original menu assignment. Its links remain available in the Shop menu; matching sport and Club Shops links retain their configured destinations.
- Kept the original header search, Shopify account component, localization, app block rendering, and cart icon's section-refresh contract.
- Original homepage sections are saved as disabled sections in `templates/index.json`. Their images, products, videos, settings and block IDs remain recoverable in the theme editor. The template contains 25 sections including those disabled sections; remove an unused disabled section before adding a further section.
- The kit enquiry presentation uses Shopify's native contact form. It is an enquiry, not an order or a replacement for the existing bundle page.

## Preserved

351 of 357 original theme files are byte-for-byte unchanged. The six changed original files are:

- `layout/theme.liquid`: added presentation assets, a body class and breadcrumb rendering.
- `sections/header-group.json` and `sections/footer-group.json`: selected the new presentation sections, retaining the existing settings.
- `templates/index.json`: selected the reference homepage presentation and retained the old section settings.
- `templates/collection.json` and `templates/search.json`: changed only filter placement and desktop column count.

Every original JavaScript file, Liquid section, Liquid snippet, global settings file, locale, and original layout script is unchanged. This includes product variants, product forms, inventory handling, cart updates, checkout, account integration, native search/filter logic, Standard Actions, Standard Events, app embeds and route configuration. No reference `commerce.js` or replacement cart implementation was installed. The original bundle page is unchanged.

## Verification

- Shopify Theme Check: **no new findings**. Both the original and updated theme have the same 29 findings, including five pre-existing errors in original files.
- Original integration files and original layout scripts verified against a saved snapshot.
- Local home, product, collection and cart previews checked at 1440, 390 and 375 pixels: no horizontal overflow, broken images or browser JavaScript errors.
- The first homepage content viewport, below the header, matches the reference screenshot pixel-for-pixel at 1440 and 390 pixels under identical local fixtures and reduced-motion settings.
- Desktop and phone checks passed for navigation, predictive search, search/menu coordination, cart drawer, slideshow, FAQ, enquiry validation and step navigation, native quantity controls, add-to-cart error handling, cart-update error handling, and checkout form association.
- JavaScript syntax and Git whitespace checks passed.

Local previews use sample products and simulated Shopify responses. They do not verify live purchases, payment processing, account sessions, contact delivery, third-party apps, or pixel-perfect rendering of every live-store page. Native commerce controls retain their original behavior and can differ visually from the ZIP's replacement commerce implementation. No theme was published or uploaded.

The original snapshot, test reports, fixture previews and screenshots are stored in `.frontend-work/`, excluded from Git and Shopify upload. Original files can be recovered from `.frontend-work/original-theme.zip`.
