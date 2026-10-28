# Evropa Flooring — independent static website audit

Updated: 2026-10-28

## Objective
The static website must be hosted on Vercel and not depend on the former WordPress origin, evropaflooring.com, for its page assets or gallery functionality.

## Completed
- Fixed malformed `wp-content-no/` and `wp-includes-no/` paths from an earlier bulk replacement.
- Corrected hero images, logo and other local image references; removed broken responsive `srcset` entries.
- Fixed Projects gallery thumbnails and converted its four pages to ordinary local pagination instead of WordPress AJAX.
- Added independent gallery grid and lightbox code in `assets/gallery-lightbox.js`.
- Kept the Swiper script hosted locally for the hero slideshow.
- Removed the missing WordPress emoji-loader dependency.
- Connected the contact form to a Vercel serverless endpoint at `/api/contact`, with an explicit email-compose fallback when automatic delivery is unavailable.
- Source-checked all eight primary/gallery HTML files: zero `evropaflooring.com` strings, zero malformed `wp-content-no/` or `wp-includes-no/` paths.

## Verification
- Isolated Playwright browser audit: **passed** (GitHub Actions run 40702329316). The test blocks requests to the former WordPress origin, runs with a new browser context, loads the homepage, Services, Contact, and four Projects gallery pages, and exercises gallery next-page navigation, lightbox opening, and contact form client handling with mocked email delivery.
- Code merged via pull request #2. Merge commit: `59c39e46af92229d2632e98f5a727601d34fc3fd`.
- GitHub commit status reported a successful Vercel deployment for the merge.

## Important remaining qualifications
- **Automatic contact-form email delivery requires Vercel environment variables:** `RESEND_API_KEY` and `CONTACT_FROM_EMAIL` (from a verified sending domain). `CONTACT_TO_EMAIL` is optional; the default is the public mailbox `Evropaflooring@gmail.com`. Without these, the form displays an explicit email-compose fallback rather than claiming a message was sent.
- Google Maps and Google Fonts are third-party online services. They are independent of the former WordPress host, but the site is not fully offline.
- Some Elementor components can dynamically load additional JS after scrolling or interaction. Previously identified missing chunks (`text-editor.2c35aafbe5bf0e127950.bundle.min.js` and `counter.02cef29c589e742d4c8c.bundle.min.js`) warrant manual regression testing on the live deployment. The test does not certify every possible interaction or production-specific behavior.
- Automated form testing mocked email delivery. No actual email delivery was asserted.
- The Vercel deployment succeeded, but a full production-domain visual and interaction audit has not been independently completed.

## Reproducible tests
Run the workflow `.github/workflows/static-independence.yml`, or run `python tests/audit_runtime.py` after installing Playwright/Chromium. `audit_static.py` provides a supplementary read-only source audit.
