#!/usr/bin/env python3
"""Read-only static export audit. Run: python audit_static.py"""
from pathlib import Path
import re
from collections import Counter

root = Path(__file__).resolve().parent
extensions = {".html", ".htm", ".css", ".js", ".json", ".xml"}
files = [p for p in root.rglob("*") if p.is_file() and p.suffix.lower() in extensions and ".git" not in p.parts]
old, missing = [], []
asset = re.compile(r"(?:https?:\\?/\\?/[^/'\"\\s<>]+\\?/)?(?:/?)(wp-content|wp-includes)(?:\\?/|/)[a-zA-Z0-9_./%-]+\\?.*", re.I)
path_pattern = re.compile(r"(?:https?:\\?/\\?/[^/\"'<>\s]+\\?/)?/?(?:wp-content|wp-includes)(?:\\?/|/)[a-zA-Z0-9_./%-]+\.(?:js|css|jpe?g|png|webp|gif|svg|woff2?)(?:\?[^\s\"'<>]*)?", re.I)
for path in files:
    raw = path.read_text(encoding="utf-8", errors="replace")
    data = raw.replace("\\/", "/").replace("&amp;", "&")
    for match in re.finditer(r"evropaflooring\.com", data, re.I):
        nearby = data[max(0, match.start()-100):match.end()+100]
        old.append((str(path.relative_to(root)), nearby[:200].replace("\n"," ")))
    for match in path_pattern.finditer(data):
        value = match.group(0)
        value = re.sub(r"^https?://[^/]+/?", "", value).lstrip("/").split("?")[0]
        if not (root/value).is_file():
            missing.append((str(path.relative_to(root)), value))
print(f"Scanned {len(files)} text resources")
print(f"Original-domain text references: {len(old)} (including comments/metadata)")
for source, context in old[:60]: print("OLD", source, context)
print(f"Unresolved local asset candidates: {len(set(missing))}")
for source, value in sorted(set(missing))[:150]: print("MISSING", source, "->", value)
print("WARNING: this static check cannot validate runtime JavaScript, remote responses, or form functionality.")
