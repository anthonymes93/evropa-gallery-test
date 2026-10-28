#!/usr/bin/env python3
"""Runtime independence test against a locally served static export.

Usage:
  pip install playwright
  python -m playwright install chromium
  python tests/audit_runtime.py

Blocks the original WP host, bypasses browser cache, and tests four main routes.
"""
import asyncio, functools, http.server, threading
from pathlib import Path
from urllib.parse import urlsplit
from playwright.async_api import async_playwright

ROOT = Path(__file__).resolve().parents[1]
PORT = 8765
PAGES = ["/", "/projects/", "/projects/index2822.html", "/projects/index43dd.html", "/projects/indexb76e.html", "/services/", "/contact-us/"]
BLOCKED = {"evropaflooring.com", "www.evropaflooring.com"}

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)
    def log_message(self, *args):
        pass

async def run():
    server = http.server.ThreadingHTTPServer(("127.0.0.1", PORT), Handler)
    threading.Thread(target=server.serve_forever, daemon=True).start()
    problems = []
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(service_workers="block")
        await context.route("**/*", lambda route: route.abort("blockedbyclient") if (urlsplit(route.request.url).hostname or "").lower() in BLOCKED else route.continue_())
        for path in PAGES:
            page = await context.new_page()
            issues = []
            page.on("request", lambda req: issues.append(("ORIGINAL_DOMAIN", req.url)) if (urlsplit(req.url).hostname or "").lower() in BLOCKED else None)
            page.on("response", lambda res: issues.append((str(res.status), res.url)) if res.status >= 400 and urlsplit(res.url).hostname in {"127.0.0.1", "localhost"} else None)
            page.on("requestfailed", lambda req: issues.append(("FAILED", req.url)) if urlsplit(req.url).hostname in {"127.0.0.1", "localhost"} else None)
            await page.goto(f"http://127.0.0.1:{PORT}{path}", wait_until="domcontentloaded", timeout=30000)
            await page.wait_for_timeout(4500)
            for item in await page.locator("img").evaluate_all("(images) => images.filter(i => i.complete && !i.naturalWidth && i.getAttribute('src') !== '#').map(i => i.currentSrc || i.src)"):
                issues.append(("BROKEN_IMG", item))
            print(path, "PASS" if not issues else f"{len(issues)} issue(s)")
            for kind, url in sorted(set(issues)):
                print(" ", kind, url)
            problems.extend((path, *item) for item in set(issues))
            await page.close()
        await browser.close()
    server.shutdown()
    if problems:
        raise SystemExit(f"FAIL: {len(problems)} issues. Not yet independent and complete.")
    print("PASS: No requests to original host or failed local assets on tested routes.")

if __name__ == "__main__":
    asyncio.run(run())
