import os,re,json
ROOT="./"
SRC=os.path.join(ROOT,"src")
exts=(".js",".jsx",".ts",".tsx",".mjs",".json",".css")
files=[]
for d,_,fs in os.walk(SRC):
    for f in fs:
        if f.endswith(exts): files.append(os.path.join(d,f))
# ---- 1. existing routes from app dir
routes=set()
for f in files:
    rel=os.path.relpath(f,os.path.join(SRC,"app"))
    if rel.startswith(".."): continue
    base=os.path.basename(f)
    if base in("page.jsx","page.js","page.tsx"):
        parts=[p for p in os.path.dirname(rel).split(os.sep) if p and not(p.startswith("(") and p.endswith(")"))]
        routes.add("/"+"/".join(p for p in parts if p!="."))
routes={r.replace("//","/") for r in routes}
routes={("/" if r=="/" else r.rstrip("/")) for r in routes}
# ---- 2. link targets used in code
used=set()
pat=re.compile(r"""(?:href|push|replace|redirect)\s*[=(:]\s*\{?\s*[`'"](/[^`'"?#\s$}]*)""")
for f in files:
    txt=open(f,encoding="utf-8",errors="ignore").read()
    for m in pat.finditer(txt):
        p=m.group(1).rstrip("/") or "/"
        used.add(p)
# ---- print
print("EXISTING ROUTES:", len(routes))
for r in sorted(routes): print("  ",r)
missing=[u for u in sorted(used) if u not in routes and not u.startswith(("/api","/_next","/relay","/static","/fonts","/imgs")) and "." not in u.split("/")[-1]]
print("\nLINKED BUT NO page.jsx:", len(missing))
for m in missing: print("  ",m)
# ---- 3. import graph for unused files
… (+32 more rows)