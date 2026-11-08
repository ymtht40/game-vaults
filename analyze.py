#!/usr/bin/env python3
"""
fix_imports.py - repair broken import PATHS and broken import NAMES in a JS/TS project.

v2 changes (vs. the regex version)
  * Real tokenizer instead of regexes: comments, strings, template literals, regex
    literals, multi-line / trailing-comma / `type` imports are all handled.
  * Every module's exports are parsed (named, default, `export { a as b }`,
    `export * from`, `export { x } from`, multi-declarator `export const a=1, b=2`).
  * Every imported NAME is checked against the real exports of the target file:
      - `import { Foo } from './Foo'`   but Foo is the DEFAULT export -> `import Foo from`
      - `import Foo from './Foo'`       but Foo is a NAMED export    -> `import { Foo } from`
      - `import { a, b, c } from X`     where a/b/c now live in different files
                                        -> the import is split into several imports
      - broken path + names             -> file is located by the names it exports
  * Wrong letter case, missing '@/' prefix, ./ and ../ -> '@/' are still handled.

Problems it fixes
  1. BROKEN ALIAS    import X from '@/component/Foo'         -> '@/components/ui/Foo'
  2. MISSING ALIAS   import X from 'components/ui/FaqItem'   -> '@/components/ui/FaqItem'
  3. WRONG CASE      import X from '@/components/ui/faqitem' -> '@/components/ui/FaqItem'
  4. RELATIVE        import X from '../../libs/x'            -> '@/libs/x'
  5. WRONG NAMES     default/named mixed up, names moved to another file (see above)

npm packages and node built-ins are never touched.

Usage:
    python fix_imports.py <project_root>                 # dry-run (report only)
    python fix_imports.py <project_root> --diff          # dry-run + show unified diff
    python fix_imports.py <project_root> --write         # apply fixes
    python fix_imports.py <project_root> --write --backup
    python fix_imports.py . --config path/to/jsconfig.json
    python fix_imports.py . --alias "@/" --alias-dir src
    python fix_imports.py . --no-names                   # only fix paths (old behaviour)
    python fix_imports.py . --no-bare                    # skip imports missing alias prefix
    python fix_imports.py . --no-json                    # ignore .json files
    python fix_imports.py . --no-relative                # skip ./x and ../x imports
"""
import argparse
import difflib
import json
import os
import posixpath
import re
import sys
from pathlib import Path

CODE_EXTS = [".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"]
SKIP_DIRS = {"node_modules", ".next", ".git", "dist", "build", "out", ".turbo", "coverage"}
RESOLVE_EXTS = CODE_EXTS + [".json"]
ASSET_EXTS = {".css", ".scss", ".sass", ".less", ".svg", ".png", ".jpg", ".jpeg",
              ".gif", ".webp", ".ico", ".woff", ".woff2", ".ttf", ".md", ".mdx"}
JSON_MAX_BYTES = 512 * 1024
LINE_WIDTH = 100
NODE_BUILTINS = {
    "assert", "async_hooks", "buffer", "child_process", "cluster", "console", "constants",
    "crypto", "dgram", "dns", "domain", "events", "fs", "http", "http2", "https", "inspector",
    "module", "net", "os", "path", "perf_hooks", "process", "punycode", "querystring",
    "readline", "repl", "stream", "string_decoder", "timers", "tls", "tty", "url", "util",
    "v8", "vm", "worker_threads", "zlib",
}


# =====================================================================
# small IO helpers
# =====================================================================
def read_text(path):
    with open(path, encoding="utf-8", newline="") as f:
        return f.read()


def write_text(path, text):
    with open(path, "w", encoding="utf-8", newline="") as f:
        f.write(text)


_DIR_CACHE = {}


def list_dir(d):
    key = str(d)
    if key not in _DIR_CACHE:
        try:
            _DIR_CACHE[key] = set(os.listdir(key))
        except OSError:
            _DIR_CACHE[key] = set()
    return _DIR_CACHE[key]


def _index_in(folder):
    names = list_dir(folder)
    for ext in RESOLVE_EXTS:
        if "index" + ext in names:
            return folder / ("index" + ext)
    return None


def resolve_exact(base, rem):
    """Resolve `rem` under `base` with EXACT letter case (like Linux)."""
    parts = [p for p in rem.split("/") if p not in ("", ".")]
    if not parts or ".." in parts:
        return None
    cur = base
    for part in parts[:-1]:
        if part not in list_dir(cur) or not (cur / part).is_dir():
            return None
        cur = cur / part
    last, names = parts[-1], list_dir(cur)
    if last in names and (cur / last).is_file():
        return cur / last
    for ext in RESOLVE_EXTS:
        if last + ext in names and (cur / (last + ext)).is_file():
            return cur / (last + ext)
    if last in names and (cur / last).is_dir():
        return _index_in(cur / last)
    return None


def resolve_ci(base, rem):
    """Like resolve_exact but ignores letter case (only returns an unambiguous hit)."""
    parts = [p for p in rem.split("/") if p not in ("", ".")]
    if not parts or ".." in parts:
        return None
    cur = base
    for part in parts[:-1]:
        names = list_dir(cur)
        if part in names and (cur / part).is_dir():
            cur = cur / part
            continue
        m = [n for n in names if n.lower() == part.lower() and (cur / n).is_dir()]
        if len(m) != 1:
            return None
        cur = cur / m[0]
    last = parts[-1].lower()
    names = sorted(list_dir(cur))
    hits = []
    for n in names:
        if not (cur / n).is_file():
            continue
        nl = n.lower()
        if nl == last:
            hits.append((0, n))
        else:
            for i, ext in enumerate(RESOLVE_EXTS):
                if nl == last + ext:
                    hits.append((i + 1, n))
    if hits:
        hits.sort()
        top = [n for r, n in hits if r == hits[0][0]]
        return cur / top[0] if len(top) == 1 else None
    dirs = [n for n in names if n.lower() == last and (cur / n).is_dir()]
    if len(dirs) == 1:
        return _index_in(cur / dirs[0])
    return None


def stem_of(path):
    return path.parent.name if path.stem == "index" else path.stem


# =====================================================================
# tokenizer  (comments / strings / templates / regex literals are understood)
# =====================================================================
class Tok(object):
    __slots__ = ("k", "v", "s", "e", "nl")   # kind, value, start, end, newline-before

    def __init__(self, k, v, s, e, nl):
        self.k, self.v, self.s, self.e, self.nl = k, v, s, e, nl


_ID_RE = re.compile(r"[^\W\d][\w$]*|\$[\w$]*")
_NUM_RE = re.compile(r"\d[\w.]*")
_REGEX_AFTER_KW = {"return", "typeof", "case", "do", "else", "in", "of", "void",
                   "delete", "new", "throw", "yield", "await", "instanceof"}


def _skip_string(s, i):
    q, n = s[i], len(s)
    i += 1
    while i < n:
        c = s[i]
        if c == "\\":
            i += 2
            continue
        if c == q:
            return i + 1, True
        if c == "\n":
            return i, False
        i += 1
    return n, False


def _skip_template(s, i):
    n = len(s)
    i += 1
    while i < n:
        c = s[i]
        if c == "\\":
            i += 2
            continue
        if c == "`":
            return i + 1
        if c == "$" and s[i + 1:i + 2] == "{":
            i += 2
            depth = 1
            while i < n and depth:
                c = s[i]
                if c in "'\"":
                    i = _skip_string(s, i)[0]
                    continue
                if c == "`":
                    i = _skip_template(s, i)
                    continue
                if c == "{":
                    depth += 1
                elif c == "}":
                    depth -= 1
                i += 1
            continue
        i += 1
    return n


def tokenize(s):
    toks, i, n, nl, prev = [], 0, len(s), False, None
    while i < n:
        c = s[i]
        if c == "\n":
            nl = True
            i += 1
            continue
        if c.isspace():
            i += 1
            continue
        if c == "/" and s.startswith("//", i):
            j = s.find("\n", i)
            i = n if j < 0 else j
            continue
        if c == "/" and s.startswith("/*", i):
            j = s.find("*/", i + 2)
            end = n if j < 0 else j + 2
            if "\n" in s[i:end]:
                nl = True
            i = end
            continue

        start = i
        if c in "'\"":
            end, ok = _skip_string(s, i)
            tok = Tok("str", s[i + 1:end - 1], start, end, nl) if ok else Tok("p", c, start, end, nl)
        elif c == "`":
            end = _skip_template(s, i)
            tok = Tok("tpl", "", start, end, nl)
        else:
            m = _ID_RE.match(s, i)
            if m:
                end = m.end()
                tok = Tok("id", m.group(), start, end, nl)
            elif c.isdigit():
                end = _NUM_RE.match(s, i).end()
                tok = Tok("num", "", start, end, nl)
            elif c == "/":
                is_div = prev is not None and (
                    prev.k in ("num", "str", "tpl", "re")
                    or (prev.k == "id" and prev.v not in _REGEX_AFTER_KW)
                    or (prev.k == "p" and prev.v in (")", "]", "}", "<")))
                tok, end = None, start + 1
                if not is_div:
                    j, in_cls = i + 1, False
                    while j < n:
                        ch = s[j]
                        if ch == "\n":
                            j = -1
                            break
                        if ch == "\\":
                            j += 2
                            continue
                        if ch == "[":
                            in_cls = True
                        elif ch == "]":
                            in_cls = False
                        elif ch == "/" and not in_cls:
                            break
                        j += 1
                    if 0 < j < n and s[j] == "/":
                        j += 1
                        while j < n and s[j].isalpha():
                            j += 1
                        tok, end = Tok("re", "", start, j, nl), j
                if tok is None:
                    tok = Tok("p", "/", start, start + 1, nl)
            else:
                end = start + 1
                tok = Tok("p", c, start, end, nl)
        toks.append(tok)
        prev, nl, i = tok, False, end
    return toks


# =====================================================================
# module model: statements (import-like) + exports
# =====================================================================
class Want(object):
    """One imported binding.  kind = 'default' | 'named'.
    default: name == local == the local identifier.  named: name = exported name."""
    __slots__ = ("kind", "name", "local", "typ", "written")

    def __init__(self, kind, name, local, typ=False):
        self.kind, self.name, self.local, self.typ = kind, name, local, typ
        self.written = kind


class Stmt(object):
    def __init__(self, kw):
        self.kw = kw                # import | export | dynamic | require
        self.start = self.end = 0
        self.spec = ""
        self.spec_start = self.spec_end = 0
        self.quote = "'"
        self.semi = False
        self.base = ""
        self.type_only = False
        self.default = None
        self.members = []
        self.ns = None
        self.star = False
        self.multiline = False
        self.trailing = True
        self.member_indent = "  "

    def wants(self):
        return ([self.default] if self.default else []) + list(self.members)

    def label(self):
        parts = []
        if self.default:
            parts.append(self.default.local)
        if self.members:
            parts.append("{" + ", ".join(
                m.name if m.name == m.local else "%s as %s" % (m.name, m.local)
                for m in self.members) + "}")
        if self.ns:
            parts.append("* as " + self.ns)
        if self.star:
            parts.append("*")
        return ", ".join(parts) or "(side-effect/dynamic)"


class Mod(object):
    def __init__(self):
        self.path = None
        self.stem = ""
        self.own = set()          # names declared / exported by this file itself
        self.reexp = set()        # names re-exported:  export { x } from '...'
        self.stars = []           # export * from '...'
        self.has_default = False
        self.default_name = None
        self.opaque = False       # CommonJS / syntax we could not understand
        self.is_json = False


_STMT_KW = {"export", "const", "let", "var", "function", "class", "import", "type",
            "interface", "enum", "async", "declare", "abstract"}
_NOT_NAMES = {"function", "class", "async", "abstract", "new", "await", "typeof", "void",
              "null", "true", "false", "undefined", "this", "interface", "enum", "type"}
_OPEN, _CLOSE = {"(", "[", "{"}, {")", "]", "}"}


def _parse_braced(T, j):
    """T(j) is '{'.  Returns (items[(typ, name, alias)], next_j, trailing_comma, first_member_pos)."""
    out, j, trailing, first = [], j + 1, False, None
    while True:
        t = T(j)
        if t.k == "eof":
            return None
        if t.k == "p" and t.v == "}":
            return out, j + 1, trailing, first
        trailing = False
        typ = False
        if t.k == "id" and t.v == "type":
            nx = T(j + 1)
            if nx.k in ("id", "str") and not (
                    nx.k == "id" and nx.v == "as" and T(j + 2).k == "id" and T(j + 2).v != "as"):
                typ = True
        if first is None:
            first = t.s
        if typ:
            j += 1
            t = T(j)
        if t.k not in ("id", "str"):
            return None
        name, alias = t.v, None
        j += 1
        if T(j).k == "id" and T(j).v == "as" and T(j + 1).k in ("id", "str"):
            alias = T(j + 1).v
            j += 2
        out.append((typ, name, alias))
        t = T(j)
        if t.k == "p" and t.v == ",":
            j += 1
            nt = T(j)
            trailing = nt.k == "p" and nt.v == "}"
        elif not (t.k == "p" and t.v == "}"):
            return None


def _mk_want(typ, name, alias):
    local = alias or name
    if name == "default":
        return Want("default", local, local, typ)
    return Want("named", name, local, typ)


def scan_module(text):
    toks = tokenize(text)
    n = len(toks)
    eof = Tok("eof", "", len(text), len(text), True)
    mod, stmts = Mod(), []

    def T(k):
        return toks[k] if 0 <= k < n else eof

    def P(t, v):
        return t.k == "p" and t.v == v

    def I(t, v):
        return t.k == "id" and t.v == v

    def line_indent(pos):
        ls = text.rfind("\n", 0, pos) + 1
        seg = text[ls:pos]
        return seg if not seg.strip() else ""

    def new_stmt(kw, i, spec_tok, after):
        st = Stmt(kw)
        st.start = toks[i].s
        st.spec = spec_tok.v
        st.spec_start, st.spec_end = spec_tok.s + 1, spec_tok.e - 1
        st.quote = text[spec_tok.s]
        nx = T(after)
        st.semi = P(nx, ";") and not nx.nl
        st.end = nx.e if st.semi else spec_tok.e
        st.base = line_indent(st.start)
        return st

    def fill_members(st, items, trailing, first, clause_from):
        st.members = [_mk_want(*it) for it in items]
        st.trailing = trailing
        st.multiline = "\n" in text[clause_from:st.spec_start]
        if first is not None and st.multiline:
            ind = line_indent(first)
            st.member_indent = ind if ind else st.base + "  "
        else:
            st.member_indent = st.base + "  "

    # ---------------- import ----------------
    def do_import(i):
        a = T(i + 1)
        if a.k == "str":
            stmts.append(new_stmt("import", i, a, i + 2))
            return
        if P(a, "("):
            b = T(i + 2)
            if b.k == "str" and (P(T(i + 3), ")") or P(T(i + 3), ",")):
                st = new_stmt("dynamic", i, b, i + 3)
                st.semi = False
                stmts.append(st)
            return
        if P(a, "."):
            return
        j, type_only = i + 1, False
        if I(a, "type") and not (I(T(j + 1), "from") and T(j + 2).k == "str") and not P(T(j + 1), ","):
            type_only, j = True, j + 1
        default, items, ns, consumed = None, [], None, False
        trailing, first = True, None
        while True:
            t = T(j)
            if consumed and I(t, "from") and T(j + 1).k == "str":
                break
            if t.k == "id" and not consumed:
                default, consumed, j = t.v, True, j + 1
            elif P(t, ","):
                j += 1
            elif P(t, "*") and I(T(j + 1), "as") and T(j + 2).k == "id":
                ns, consumed, j = T(j + 2).v, True, j + 3
            elif P(t, "{"):
                r = _parse_braced(T, j)
                if r is None:
                    return
                items, j, trailing, first = r
                consumed = True
            else:
                return
        spec_tok = T(j + 1)
        st = new_stmt("import", i, spec_tok, j + 2)
        st.type_only = type_only
        if default:
            st.default = Want("default", default, default)
        st.ns = ns
        fill_members(st, items, trailing, first, T(i + 1).s)
        stmts.append(st)

    # ---------------- export ----------------
    def do_default(k):
        mod.has_default = True
        t = T(k)
        if I(t, "async") and I(T(k + 1), "function"):
            k += 1
            t = T(k)
        if I(t, "abstract") and I(T(k + 1), "class"):
            k += 1
            t = T(k)
        if I(t, "function"):
            k += 1
            if P(T(k), "*"):
                k += 1
            if T(k).k == "id":
                mod.default_name = T(k).v
        elif t.k == "id" and t.v in ("class", "interface", "enum"):
            nm = T(k + 1)
            if nm.k == "id" and nm.v not in ("extends", "implements"):
                mod.default_name = nm.v
        elif t.k == "id" and t.v not in _NOT_NAMES:
            nx = T(k + 1)
            if P(nx, "("):
                arg = T(k + 2)
                if arg.k == "id" and arg.v[:1].isupper() and (P(T(k + 3), ")") or P(T(k + 3), ",")):
                    mod.default_name = arg.v
            elif nx.k == "eof" or P(nx, ";") or nx.nl:
                mod.default_name = t.v

    def do_declarators(k):
        while True:
            t = T(k)
            if t.k == "id":
                mod.own.add(t.v)
                k += 1
            elif t.k == "p" and t.v in ("{", "["):
                depth = 0
                while k < n + 1:
                    tk = T(k)
                    if tk.k == "eof":
                        return
                    if tk.k == "p" and tk.v in _OPEN:
                        depth += 1
                    elif tk.k == "p" and tk.v in _CLOSE:
                        depth -= 1
                        if depth == 0:
                            k += 1
                            break
                    elif (tk.k == "id" and depth == 1 and T(k + 1).k == "p"
                          and T(k + 1).v in (",", "}", "]", "=")):
                        mod.own.add(tk.v)
                    k += 1
            else:
                return
            depth, nxt = 0, False
            while True:
                tk = T(k)
                if tk.k == "eof":
                    return
                if tk.k == "p":
                    if tk.v in _OPEN:
                        depth += 1
                    elif tk.v in _CLOSE:
                        depth -= 1
                        if depth < 0:
                            return
                    elif tk.v == ";" and depth == 0:
                        return
                    elif tk.v == "," and depth == 0:
                        nx, nn = T(k + 1), T(k + 2)
                        if (nx.k == "id" and (nn.k == "eof" or nn.nl or (
                                nn.k == "p" and nn.v in ("=", ":", ",", ";")))) \
                                or (nx.k == "p" and nx.v in ("{", "[")):
                            k += 1
                            nxt = True
                            break
                elif tk.nl and depth == 0 and tk.k == "id" and tk.v in _STMT_KW:
                    return
                k += 1
            if not nxt:
                return

    def do_export(i):
        j, type_only = i + 1, False
        if I(T(j), "type") and (P(T(j + 1), "{") or P(T(j + 1), "*")):
            type_only, j = True, j + 1
        a = T(j)

        if P(a, "*"):
            if I(T(j + 1), "from") and T(j + 2).k == "str":
                mod.stars.append(T(j + 2).v)
                st = new_stmt("export", i, T(j + 2), j + 3)
                st.star, st.type_only = True, type_only
                stmts.append(st)
                return
            if I(T(j + 1), "as") and T(j + 2).k == "id" and I(T(j + 3), "from") and T(j + 4).k == "str":
                mod.reexp.add(T(j + 2).v)
                st = new_stmt("export", i, T(j + 4), j + 5)
                st.star, st.type_only = True, type_only
                stmts.append(st)
                return
            mod.opaque = True
            return

        if P(a, "{"):
            r = _parse_braced(T, j)
            if r is None:
                mod.opaque = True
                return
            items, j2, trailing, first = r
            is_from = I(T(j2), "from") and T(j2 + 1).k == "str"
            for typ, name, alias in items:
                exported = alias or name
                if exported == "default":
                    mod.has_default = True
                    mod.default_name = mod.default_name or name
                else:
                    (mod.reexp if is_from else mod.own).add(exported)
            if is_from:
                st = new_stmt("export", i, T(j2 + 1), j2 + 2)
                st.type_only = type_only
                fill_members(st, items, trailing, first, a.s)
                stmts.append(st)
            return

        if I(a, "default"):
            do_default(j + 1)
            return

        k = j
        while T(k).k == "id" and T(k).v in ("declare", "async", "abstract") and T(k + 1).k == "id":
            k += 1
        t = T(k)
        if t.k != "id":
            mod.opaque = True
            return
        v = t.v
        if v == "const" and I(T(k + 1), "enum"):
            k, v = k + 1, "enum"
        if v in ("const", "let", "var"):
            do_declarators(k + 1)
        elif v == "function":
            k += 1
            if P(T(k), "*"):
                k += 1
            if T(k).k == "id":
                mod.own.add(T(k).v)
        elif v in ("class", "enum", "interface", "type", "namespace", "module"):
            nm = T(k + 1)
            if nm.k == "id":
                mod.own.add(nm.v)
            elif nm.k != "str":
                mod.opaque = True
        else:
            mod.opaque = True

    # ---------------- main scan ----------------
    for i in range(n):
        t = toks[i]
        if t.k != "id" or (i and P(toks[i - 1], ".")):
            continue
        v = t.v
        if v == "import":
            do_import(i)
        elif v == "export":
            do_export(i)
        elif v == "require":
            if P(T(i + 1), "(") and T(i + 2).k == "str" and P(T(i + 3), ")"):
                st = new_stmt("require", i, T(i + 2), i + 3)
                st.semi = False
                stmts.append(st)
        elif v == "module" and P(T(i + 1), ".") and I(T(i + 2), "exports"):
            mod.opaque = True
        elif v == "exports" and T(i + 1).k == "p" and T(i + 1).v in (".", "["):
            mod.opaque = True
    return stmts, mod


def json_top_keys(path):
    try:
        if path.stat().st_size > JSON_MAX_BYTES:
            return set()
        data = json.loads(path.read_text(encoding="utf-8-sig"))
    except (ValueError, UnicodeDecodeError, OSError):
        return set()
    return set(k for k in data if isinstance(k, str)) if isinstance(data, dict) else set()


# =====================================================================
# jsconfig / tsconfig
# =====================================================================
def strip_jsonc(s):
    out, i, n, in_str = [], 0, len(s), False
    while i < n:
        c = s[i]
        if in_str:
            out.append(c)
            if c == "\\" and i + 1 < n:
                out.append(s[i + 1])
                i += 2
                continue
            if c == '"':
                in_str = False
            i += 1
            continue
        if c == '"':
            in_str = True
            out.append(c)
            i += 1
        elif s.startswith("//", i):
            j = s.find("\n", i)
            i = n if j == -1 else j
        elif s.startswith("/*", i):
            j = s.find("*/", i + 2)
            i = n if j == -1 else j + 2
        else:
            out.append(c)
            i += 1
    return re.sub(r",(\s*[}\]])", r"\1", "".join(out))


def load_config(cfg_path, _seen=None):
    _seen = _seen or set()
    cfg_path = cfg_path.resolve()
    if cfg_path in _seen or not cfg_path.is_file():
        return None, {}, None
    _seen.add(cfg_path)
    try:
        data = json.loads(strip_jsonc(cfg_path.read_text(encoding="utf-8-sig")))
    except (ValueError, OSError) as e:
        print("warning: cannot parse %s: %s" % (cfg_path, e))
        return None, {}, None

    base_url, paths, paths_dir = None, {}, None
    ext = data.get("extends")
    exts = ext if isinstance(ext, list) else ([ext] if isinstance(ext, str) else [])
    for e in exts:
        if not e.startswith("."):
            continue
        parent = cfg_path.parent / e
        if not parent.suffix:
            parent = parent.with_suffix(".json")
        b, p, pd = load_config(parent, _seen)
        if b is not None:
            base_url = b
        if p:
            paths, paths_dir = p, pd

    co = data.get("compilerOptions") or {}
    if isinstance(co.get("baseUrl"), str):
        base_url = (cfg_path.parent / co["baseUrl"]).resolve()
    if isinstance(co.get("paths"), dict):
        paths, paths_dir = co["paths"], cfg_path.parent
    return base_url, paths, paths_dir


class Rule(object):
    def __init__(self, prefix, targets):
        self.prefix = prefix
        self.targets = targets


def rules_from_config(cfg_path):
    base_url, paths, paths_dir = load_config(cfg_path)
    base = base_url or paths_dir
    rules, exacts = [], {}
    if not paths or base is None:
        return rules, exacts, base_url
    for key, targets in paths.items():
        if not isinstance(targets, list):
            continue
        if not key.endswith("*"):
            files = [(base / t).resolve() for t in targets if isinstance(t, str) and "*" not in t]
            if files:
                exacts[key] = files
            continue
        if key == "*":
            continue
        dirs = [(base / t[:-1]).resolve() for t in targets if isinstance(t, str) and t.endswith("*")]
        if dirs:
            rules.append(Rule(key[:-1], dirs))
    return rules, exacts, base_url


def find_config(root):
    for d in [root] + list(root.parents)[:3]:
        for name in ("jsconfig.json", "tsconfig.json"):
            p = d / name
            if p.is_file():
                return p
    return None


def collect_packages(root):
    names, nm_dirs, trusted = set(), [], False
    for d in [root] + list(root.parents)[:3]:
        pj = d / "package.json"
        if pj.is_file():
            try:
                data = json.loads(pj.read_text(encoding="utf-8-sig"))
            except (ValueError, OSError):
                data = {}
            trusted = True
            for k in ("dependencies", "devDependencies", "peerDependencies", "optionalDependencies"):
                if isinstance(data.get(k), dict):
                    names.update(data[k].keys())
            if isinstance(data.get("name"), str):
                names.add(data["name"])
        nm = d / "node_modules"
        if nm.is_dir():
            nm_dirs.append(nm)
            trusted = True
    return names, nm_dirs, trusted


# =====================================================================
# name matching helpers
# =====================================================================
def satisfy(proj, mod, w, strict=False):
    """How can `mod` provide binding `w`?  -> 'named' | 'default' | 'asis' | None
    'asis' = cannot verify (CommonJS / unknown re-export) -> leave as written.
    strict=True never returns 'asis' (used when searching for candidate files)."""
    names, complete = proj.exports_of(mod.path)
    unknown = None if strict else "asis"
    if w.kind == "default":
        if mod.is_json or mod.has_default:
            return "default"
        if w.local in names:
            return "named"
        return None if complete else unknown
    if w.name in names:
        return "named"
    if mod.has_default and (w.name == mod.default_name or
                            (mod.default_name is None and w.name.lower() == mod.stem.lower())):
        return "default"
    return None if complete else unknown


def weight(mod, w, mode):
    """How strong is the evidence that `mod` is the file `w` came from?"""
    if mode is None:
        return 0
    if w.kind == "named":
        if mode == "named":
            return 3 if w.name in mod.own else 2.5
        return 2
    ln = w.local
    if mode == "default":
        if mod.default_name == ln:
            return 3
        if mod.stem == ln:
            return 2
        if mod.stem.lower() == ln.lower():
            return 1.5
        return 0
    return 3 if ln in mod.own else 2.5


class Ctx(object):
    def __init__(self, kind, rule, rem, bases):
        self.kind, self.rule, self.rem, self.bases = kind, rule, rem, bases


# =====================================================================
# project
# =====================================================================
class Project(object):
    def __init__(self, root, rules, exacts=None, base_url=None, bare=True,
                 json_enabled=True, relative=True, names=True):
        self.root = root
        self.rules = rules
        self.exacts = exacts or {}
        self.bare_enabled = bare and bool(rules)
        self.json_enabled = json_enabled
        self.relative_enabled = relative
        self.names_enabled = names
        self.asset_exts = ASSET_EXTS if json_enabled else ASSET_EXTS | {".json"}
        self.files = {}
        self.json_files = {}
        self.parsed = {}
        self._exp_cache = {}

        self.primary_rule = next((r for r in rules if r.prefix == "@/"), rules[0] if rules else None)
        self.bare_roots = []
        for d in ([base_url] if base_url else []) + (self.primary_rule.targets if self.primary_rule else []):
            if d and d.is_dir() and d not in self.bare_roots:
                self.bare_roots.append(d)

        self.pkg_names, self.nm_dirs, self.pkgs_trusted = collect_packages(root)
        self._scan()
        self.top_level = self._top_level_names()

    # ----- scanning -----
    def _scan(self):
        dirs = [self.root]
        for r in self.rules:
            for t in r.targets:
                if t.is_dir() and not any(d == t or d in t.parents for d in dirs):
                    dirs.append(t)
        seen = set()
        for p in (q for d in dirs for q in d.rglob("*")):
            if not p.is_file() or p.suffix not in RESOLVE_EXTS:
                continue
            if any(part in SKIP_DIRS for part in p.parts):
                continue
            rp = p.resolve()
            if rp in seen:
                continue
            seen.add(rp)
            if p.suffix == ".json":
                if not self.json_enabled:
                    continue
                m = Mod()
                m.path, m.stem, m.is_json, m.opaque = rp, stem_of(p), True, True
                m.own = json_top_keys(p)
                self.json_files[rp] = m
                continue
            try:
                text = read_text(p)
            except (UnicodeDecodeError, OSError):
                continue
            stmts, m = scan_module(text)
            m.path, m.stem = rp, stem_of(p)
            self.files[rp] = m
            self.parsed[rp] = (text, stmts)

    def _top_level_names(self):
        names = set()
        for r in self.bare_roots:
            for n in list_dir(r):
                if n.startswith(".") or n in SKIP_DIRS:
                    continue
                names.add(Path(n).stem if (r / n).is_file() else n)
        return names

    def mod(self, path):
        return (self.files.get(path) or self.json_files.get(path)
                or self.files.get(path.resolve()) or self.json_files.get(path.resolve()))

    def _mods(self):
        for item in self.files.items():
            yield item
        for item in self.json_files.items():
            yield item

    # ----- exports (follows `export * from`) -----
    def exports_of(self, path, _stack=None):
        if path in self._exp_cache:
            return self._exp_cache[path]
        m = self.files.get(path) or self.json_files.get(path)
        if m is None:
            return set(), False
        names, complete = set(m.own) | set(m.reexp), not m.opaque
        stack = _stack if _stack is not None else set()
        if path in stack:
            return names, True
        stack.add(path)
        for spec in m.stars:
            tgt = self.resolve_spec(spec, path)
            if tgt is None or tgt not in self.files:
                complete = False
                continue
            n2, c2 = self.exports_of(tgt, stack)
            names |= n2
            complete = complete and c2
        stack.discard(path)
        self._exp_cache[path] = (names, complete)
        return names, complete

    # ----- classification -----
    def is_external(self, spec):
        if spec.startswith((".", "/", "~", "#", "@", "node:", "data:", "virtual:")) or "://" in spec:
            return True
        pkg = spec.split("/")[0]
        if pkg in NODE_BUILTINS or pkg in self.pkg_names:
            return True
        return any((nm / pkg).exists() for nm in self.nm_dirs)

    def bare_ok(self, spec):
        return (self.bare_enabled and not self.is_external(spec)
                and Path(spec).suffix not in self.asset_exts)

    def is_top_level(self, spec):
        return spec.split("/")[0] in self.top_level

    def match(self, spec):
        best = None
        for r in self.rules:
            if spec.startswith(r.prefix) and (best is None or len(r.prefix) > len(best.prefix)):
                best = r
        return (best, spec[len(best.prefix):]) if best else None

    @staticmethod
    def _relative_base(spec, importer):
        norm = posixpath.normpath(spec)
        cur = importer.parent
        while norm == ".." or norm.startswith("../"):
            cur = cur.parent
            norm = norm[3:] if norm.startswith("../") else ""
        return cur, ("" if norm == "." else norm)

    def classify(self, spec, importer):
        if spec.startswith(("./", "../")):
            if not self.relative_enabled or Path(spec).suffix in self.asset_exts or not self.primary_rule:
                return None
            cur, rem = self._relative_base(spec, importer)
            return Ctx("relative", self.primary_rule, rem, [cur]) if rem else None
        m = self.match(spec)
        if m:
            rule, rem = m
            if Path(spec).suffix in self.asset_exts or not rem:
                return None
            return Ctx("alias", rule, rem, rule.targets)
        if not self.bare_ok(spec):
            return None
        return Ctx("bare", self.primary_rule, spec, self.bare_roots)

    def resolve(self, ctx):
        for b in ctx.bases:
            hit = resolve_exact(b, ctx.rem)
            if hit:
                return hit, "exact"
        for b in ctx.bases:
            hit = resolve_ci(b, ctx.rem)
            if hit:
                return hit, "case"
        return None, None

    def resolve_spec(self, spec, importer):
        """Plain resolution of any spec to a project file (used for `export *`)."""
        if spec in self.exacts:
            for f in self.exacts[spec]:
                if f.is_file():
                    return f.resolve()
            return None
        if spec.startswith(("./", "../")):
            cur, rem = self._relative_base(spec, importer)
            return resolve_exact(cur, rem) if rem else None
        m = self.match(spec)
        if m:
            for t in m[0].targets:
                hit = resolve_exact(t, m[1])
                if hit:
                    return hit
            return None
        if self.bare_enabled and not self.is_external(spec):
            return self.resolve_bare(spec)
        return None

    def resolve_bare(self, spec):
        for r in self.bare_roots:
            hit = resolve_exact(r, spec)
            if hit:
                return hit
        return None

    # ----- spec building -----
    def rel_key(self, path, rule):
        try:
            rel = path.relative_to(rule.targets[0])
        except ValueError:
            rel = path
        rel = rel.with_suffix("")
        if rel.name == "index" and rel.parent != Path("."):
            rel = rel.parent
        return rel.as_posix().lower()

    def rel_key_from(self, path, importer):
        r = os.path.relpath(str(path.with_suffix("")), str(importer.parent)).replace(os.sep, "/")
        if r.endswith("/index"):
            r = r[:-6]
        if not r.startswith("."):
            r = "./" + r
        return r.lower()

    def to_spec(self, path, rule, orig_spec):
        others = sorted((r for r in self.rules if r is not rule),
                        key=lambda r: max(len(t.parts) for t in r.targets), reverse=True)
        for r in [rule] + others:
            for t in r.targets:
                try:
                    rel = path.relative_to(t)
                except ValueError:
                    continue
                if Path(orig_spec).suffix not in RESOLVE_EXTS:
                    rel = rel.with_suffix("")
                    if rel.name == "index" and rel.parent != Path("."):
                        rel = rel.parent
                return r.prefix + rel.as_posix()
        return None

    def to_rel_spec(self, path, importer, orig_spec):
        target = path
        if Path(orig_spec).suffix not in RESOLVE_EXTS:
            target = target.with_suffix("")
            if target.name == "index":
                target = target.parent
        r = os.path.relpath(str(target), str(importer.parent)).replace(os.sep, "/")
        return r if r.startswith(".") else "./" + r

    def spec_for(self, target, ctx, orig_spec, importer):
        ns = self.to_spec(target, ctx.rule, orig_spec)
        if ns:
            return ns
        if ctx.kind == "relative":
            return self.to_rel_spec(target, importer, orig_spec)
        return None

    def canonical(self, hit, ctx, spec, how, importer):
        """Spec to use for a file that the original spec already resolves to."""
        if ctx.kind == "alias" and how == "exact":
            return spec
        ns = self.spec_for(hit, ctx, spec, importer)
        return ns or spec

    # ----- locating files -----
    @staticmethod
    def _wrong(ctx, spec):
        wrong = (spec if ctx.kind == "relative" else ctx.rem).lower()
        want_json = wrong.endswith(".json")
        return (wrong[:-5] if want_json else wrong), want_json

    def _key_fn(self, ctx, importer):
        if ctx.kind == "relative":
            return lambda p: self.rel_key_from(p, importer)
        return lambda p: self.rel_key(p, ctx.rule)

    def bare_filter(self, ctx):
        key = ctx.rem.lower()
        if key.endswith(".json"):
            key = key[:-5]

        def f(p):
            k = self.rel_key(p, ctx.rule)
            return k == key or k.endswith("/" + key)
        return f

    def assign(self, mod, wants):
        """Check `wants` against an existing target file -> (keep[(want, mode)], missing[want])."""
        keep, missing, default_taken = [], [], False
        for w in wants:
            mode = satisfy(self, mod, w)
            if mode == "default":
                if default_taken:
                    mode = None
                default_taken = True
            if mode is None:
                missing.append(w)
            else:
                keep.append((w, mode))
        return keep, missing

    def locate(self, wants, importer, ctx, spec, filt=None):
        """Find the file(s) exporting `wants` (greedy set cover).
        -> (groups[(path, [(want, mode)])], leftover wants, ambiguous candidates|None)"""
        wrong, want_json = self._wrong(ctx, spec)
        key_fn = self._key_fn(ctx, importer)
        remaining, groups, ambiguous = list(wants), [], None
        while remaining:
            scored = []
            for p, m in self._mods():
                if p == importer or (want_json and not m.is_json) or (filt and not filt(p)):
                    continue
                items, tot, default_taken = [], 0.0, False
                for w in remaining:
                    mode = satisfy(self, m, w, strict=True)
                    if mode == "default" and default_taken:
                        continue
                    wt = weight(m, w, mode)
                    if wt:
                        default_taken = default_taken or mode == "default"
                        items.append((w, mode))
                        tot += wt
                if not items:
                    continue
                sim = difflib.SequenceMatcher(None, wrong, key_fn(p)).ratio()
                scored.append((tot, sim, p, items))
            if not scored:
                break
            scored.sort(key=lambda r: (r[0], r[1]), reverse=True)
            top = scored[0]
            if len(scored) > 1 and scored[1][0] == top[0] and abs(scored[1][1] - top[1]) < 0.05:
                ambiguous = [s[2] for s in scored[:4]]
                break
            groups.append((top[2], top[3]))
            done = set(id(w) for w, _ in top[3])
            remaining = [w for w in remaining if id(w) not in done]
        return groups, remaining, ambiguous

    def stem_locate(self, importer, ctx, spec, filt=None):
        """No names to go by (side-effect / namespace / dynamic import): match by file name."""
        wrong, want_json = self._wrong(ctx, spec)
        stem = posixpath.basename(wrong)
        key_fn = self._key_fn(ctx, importer)
        scored = []
        for p, m in self._mods():
            if p == importer or (want_json and not m.is_json) or (filt and not filt(p)):
                continue
            if m.stem.lower() != stem:
                continue
            scored.append((difflib.SequenceMatcher(None, wrong, key_fn(p)).ratio(), p))
        if not scored:
            return None, None
        scored.sort(key=lambda r: r[0], reverse=True)
        if len(scored) > 1 and abs(scored[0][0] - scored[1][0]) < 0.05:
            return None, [s[1] for s in scored[:4]]
        return scored[0][1], None


# =====================================================================
# rendering
# =====================================================================
def render_group(st, spec, items, eol):
    default, members = None, []
    for w, mode in items:
        eff = w.written if mode == "asis" else mode
        if st.kw == "import" and eff == "default" and default is None:
            default = w.local
            continue
        if eff == "default":
            imported = "default"
        else:
            imported = w.name if w.kind == "named" else w.local
        members.append((imported, w.local, w.typ and not st.type_only))

    def fmt(m):
        imported, local, typ = m
        body = imported if imported == local else "%s as %s" % (imported, local)
        return ("type " if typ else "") + body

    head = st.kw + (" type" if st.type_only else "")
    tail = " from %s%s%s%s" % (st.quote, spec, st.quote, ";" if st.semi else "")
    inner = [fmt(m) for m in members]
    prefix = (default + ", ") if default else ""
    if not inner:
        return "%s %s%s" % (head, default, tail)
    one = "%s %s{ %s }%s" % (head, prefix, ", ".join(inner), tail)
    if len(inner) > 1 and (st.multiline or len(one) > LINE_WIDTH) or len(one) > LINE_WIDTH:
        comma = "," if st.trailing or not st.multiline else ""
        lines = [st.member_indent + x + "," for x in inner]
        if not comma:
            lines[-1] = lines[-1][:-1]
        return ("%s %s{" % (head, prefix) + eol + eol.join(lines) + eol + st.base + "}" + tail)
    return one


def render_statement(st, placements, eol):
    out = [render_group(st, sp, items, eol) for sp, items in placements if items]
    return (eol + st.base).join(out)


# =====================================================================
# per-file processing
# =====================================================================
def process_file(proj, path, text, stmts, report):
    edits = []
    eol = "\r\n" if "\r\n" in text else "\n"

    def rep(kind, st, extra):
        lab = {"export": "export ", "import": "import "}.get(st.kw, "import ") + st.label()
        report.append((kind, path, text.count("\n", 0, st.start) + 1, st.spec, lab, extra))

    for st in stmts:
        spec = st.spec
        if spec in proj.exacts:
            if not any(f.is_file() for f in proj.exacts[spec]):
                rep("NOTFOUND", st, ["mapped file missing: %s" % f for f in proj.exacts[spec]])
            continue
        ctx = proj.classify(spec, path)
        if ctx is None:
            continue
        wants = st.wants() if (proj.names_enabled and not st.ns) else []
        hit, how = proj.resolve(ctx)
        placements, leftover, ambiguous = [], [], None
        silent_if_empty = False

        def groups_to_placements(groups):
            res, lost = [], []
            for p, items in groups:
                sp = proj.spec_for(p, ctx, spec, path)
                if sp is None:
                    lost.extend(w for w, _ in items)
                else:
                    res.append((sp, items))
            return res, lost

        if hit:
            hmod = proj.mod(hit)
            new_spec = proj.canonical(hit, ctx, spec, how, path)
            if hmod is None:
                keep, missing = [(w, "asis") for w in wants], []
            else:
                keep, missing = proj.assign(hmod, wants)
            if missing:
                groups, leftover, ambiguous = proj.locate(missing, path, ctx, spec)
                moved, lost = groups_to_placements(groups)
                leftover = leftover + lost
                placements = ([(new_spec, keep)] if keep else []) + moved
            else:
                placements = [(new_spec, keep)]
            if leftover:
                stay = [(w, "asis") for w in leftover]
                if placements and placements[0][0] == new_spec:
                    placements[0] = (new_spec, placements[0][1] + stay)
                else:
                    placements.insert(0, (new_spec, stay))
                rep("MISSING", st, ["not exported by '%s' nor by any other file: %s"
                                    % (new_spec, ", ".join(w.name if w.kind == "named" else "default(%s)" % w.local
                                                           for w in leftover))])
        else:
            filt = None
            if ctx.kind == "bare" and not proj.is_top_level(spec):
                if not proj.pkgs_trusted or "/" not in spec:
                    continue
                filt = proj.bare_filter(ctx)
                silent_if_empty = True
            if wants:
                groups, leftover, ambiguous = proj.locate(wants, path, ctx, spec, filt)
                placements, lost = groups_to_placements(groups)
                leftover = leftover + lost
            else:
                cand, ambiguous = proj.stem_locate(path, ctx, spec, filt)
                if cand:
                    sp = proj.spec_for(cand, ctx, spec, path)
                    if sp:
                        placements = [(sp, [])]
            if leftover and placements:
                placements.append((spec, [(w, "asis") for w in leftover]))
                rep("MISSING", st, ["still unresolved (path '%s' not found): %s"
                                    % (spec, ", ".join(w.name if w.kind == "named" else w.local for w in leftover))])
            if not placements:
                if ambiguous:
                    rep("AMBIGUOUS", st, ambiguous)
                elif not silent_if_empty:
                    if ctx.kind == "relative":
                        tried = [str(ctx.bases[0] / ctx.rem)]
                    else:
                        tried = ["%s(.js|.jsx|.ts|.tsx|.json|/index.*)" % (b / ctx.rem) for b in ctx.bases]
                    rep("NOTFOUND", st, tried)
                continue

        if ambiguous and hit:
            rep("AMBIGUOUS", st, ambiguous)
        elif ambiguous and placements:
            rep("AMBIGUOUS", st, ambiguous)

        changes = len(placements) > 1 or any(
            mode != "asis" and mode != w.written for _, items in placements for w, mode in items)
        if not changes:
            new_spec = placements[0][0]
            if new_spec != spec:
                edits.append((st.spec_start, st.spec_end, new_spec))
                rep("FIXED", st, [new_spec])
            continue
        repl = render_statement(st, placements, eol)
        edits.append((st.start, st.end, repl))
        rep("REWRITTEN", st, repl.split(eol))

    if not edits:
        return text
    for start, end, new in sorted(edits, key=lambda e: e[0], reverse=True):
        text = text[:start] + new + text[end:]
    return text


# =====================================================================
# main
# =====================================================================
def main():
    ap = argparse.ArgumentParser(description="Auto-fix broken import paths and import names")
    ap.add_argument("root", nargs="?", default=".", help="project root")
    ap.add_argument("--config", default=None,
                    help="path to jsconfig.json / tsconfig.json (default: auto-detect in root)")
    ap.add_argument("--alias", default=None,
                    help="manual alias prefix, e.g. '@/' (ignores jsconfig; needs --alias-dir)")
    ap.add_argument("--alias-dir", default=None,
                    help="directory the manual alias points to (relative to root)")
    ap.add_argument("--no-names", action="store_true",
                    help="do NOT check imported names (default/named mismatch, moved names)")
    ap.add_argument("--no-bare", action="store_true",
                    help="do NOT fix imports that are missing the alias prefix (e.g. 'components/x')")
    ap.add_argument("--no-json", action="store_true", help="ignore .json files")
    ap.add_argument("--no-relative", action="store_true",
                    help="do NOT check relative imports (./x, ../x)")
    ap.add_argument("--write", action="store_true", help="apply changes (default is dry-run)")
    ap.add_argument("--backup", action="store_true", help="write a .bak copy of each changed file")
    ap.add_argument("--diff", action="store_true", help="print a unified diff of every change")
    args = ap.parse_args()

    root = Path(args.root).resolve()

    rules, exacts, base_url, source = [], {}, None, ""
    if args.alias:
        d = (root / args.alias_dir).resolve() if args.alias_dir else (
            root / "src" if (root / "src").is_dir() else root)
        rules, source = [Rule(args.alias, [d])], "command line"
    else:
        cfg = Path(args.config).resolve() if args.config else find_config(root)
        if cfg:
            rules, exacts, base_url = rules_from_config(cfg)
            source = str(cfg)
        if not rules:
            d = root / "src" if (root / "src").is_dir() else root
            rules = [Rule("@/", [d])]
            source = "default fallback (no usable 'paths' found in config)"

    def short(p):
        try:
            r = os.path.relpath(str(p), str(root))
        except ValueError:
            return str(p)
        return "." if r == "." else r

    def shorten_text(t):
        return t.replace(str(root) + os.sep, "")

    proj = Project(root, rules, exacts, base_url, bare=not args.no_bare,
                   json_enabled=not args.no_json, relative=not args.no_relative,
                   names=not args.no_names)

    print("root   : %s" % root.name)
    print("source : %s" % (short(source) if os.path.isabs(source) else source))
    print("aliases:")
    for r in rules:
        print("  %s*  ->  %s" % (r.prefix, ", ".join(short(t) for t in r.targets)))
    for k, v in exacts.items():
        print("  %s  ->  %s   (exact)" % (k, ", ".join(short(f) for f in v)))
    if proj.bare_enabled:
        print("bare   : ON  (adds '%s' to imports like 'components/x'; roots: %s)"
              % (proj.primary_rule.prefix, ", ".join(short(r) for r in proj.bare_roots) or "-"))
        if not proj.pkgs_trusted:
            print("         note: no package.json / node_modules found -> only top-level folders "
                  "(components, hooks, lib ...) are fixed, nested ones are skipped")
    else:
        print("bare   : OFF")
    print("json   : %s" % ("ON" if proj.json_enabled else "OFF"))
    print("relative: %s" % ("ON" if proj.relative_enabled else "OFF"))
    print("names  : %s" % ("ON" if proj.names_enabled else "OFF"))
    print("mode   : %s\n" % ("WRITE" if args.write else "DRY-RUN"))
    print("scanned %d code files%s\n" % (
        len(proj.files),
        " + %d json files" % len(proj.json_files) if proj.json_enabled else ""))

    report, changed_files = [], 0
    for path in list(proj.files):
        text, stmts = proj.parsed[path]
        new_text = process_file(proj, path, text, stmts, report)
        if new_text != text:
            changed_files += 1
            if args.diff:
                rel_p = short(path)
                sys.stdout.writelines(difflib.unified_diff(
                    text.splitlines(True), new_text.splitlines(True),
                    fromfile="a/" + rel_p, tofile="b/" + rel_p))
                print()
            if args.write:
                if args.backup:
                    write_text(path.with_suffix(path.suffix + ".bak"), text)
                write_text(path, new_text)

    def rel(p):
        try:
            return p.relative_to(root)
        except ValueError:
            return p

    for kind in ("FIXED", "REWRITTEN", "AMBIGUOUS", "MISSING", "NOTFOUND"):
        rows = [r for r in report if r[0] == kind]
        if not rows:
            continue
        print("== %s (%d) ==" % (kind, len(rows)))
        for _, f, line, spec, label, extra in rows:
            print("  %s:%d\n    %s from '%s'" % (rel(f), line, label, spec))
            if kind == "FIXED":
                print("    -> '%s'" % extra[0])
            elif kind == "REWRITTEN":
                for ln in extra:
                    print("    -> %s" % ln.strip())
            elif kind == "AMBIGUOUS":
                for c in extra:
                    print("    ? %s" % rel(c))
            elif kind == "MISSING":
                print("    ! %s" % extra[0])
            else:
                for c in extra:
                    print("    looked in: %s" % shorten_text(str(c)))
        print()

    n = lambda k: sum(1 for r in report if r[0] == k)
    print("summary: fixed=%d, rewritten=%d, ambiguous=%d, missing=%d, notfound=%d, files changed=%d%s" % (
        n("FIXED"), n("REWRITTEN"), n("AMBIGUOUS"), n("MISSING"), n("NOTFOUND"), changed_files,
        "" if args.write else "  (dry-run - add --write to apply)"))


if __name__ == "__main__":
    sys.exit(main())
