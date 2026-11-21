#!/usr/bin/env python3
"""
AriRebe Wiki 自動データ更新スクリプト
ゲームサーバー（またはローカルの --local-dir）から最新の build_id / config.<hash>.json / Localize.json
および各種 .bin を自動取得して data/characters.json・data/systems.json を更新する。
依存ライブラリなし（Python 3 標準ライブラリのみ）。
"""
import argparse
import json
import os
import re
import urllib.request

BASE_HOST = "https://arifure.pro.g123-cpp.com"
GAME_PORTAL = "https://h5.g123.jp/game/arifure?lang=ja"
DEFAULT_BUILD_ID = "84237"
DEFAULT_CONFIG_HASH = "0b0bb"
B64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"


def decode_cocos_uuid(u: str) -> str:
    if len(u) != 22:
        return u
    parts = [u[:2]]
    for i in range(2, 22, 2):
        lhs = B64.index(u[i])
        rhs = B64.index(u[i + 1])
        parts.append(f"{(lhs << 6) | rhs:03x}")
    h = "".join(parts)
    return f"{h[:8]}-{h[8:12]}-{h[12:16]}-{h[16:20]}-{h[20:]}"


def fetch_bytes(url: str) -> bytes:
    req = urllib.request.Request(
        url,
        headers={
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            "Referer": "https://h5.g123.jp/",
            "Origin": "https://h5.g123.jp",
        },
    )
    with urllib.request.urlopen(req, timeout=30) as resp:
        return resp.read()


def detect_build_id(fallback: str) -> str:
    try:
        html = fetch_bytes(GAME_PORTAL).decode("utf-8", errors="ignore")
        m = re.search(r"arifure\.pro\.g123-cpp\.com/(\d{4,7})/", html)
        if m:
            print(f"Auto-detected build_id: {m.group(1)}")
            return m.group(1)
    except Exception as e:
        print(f"build_id auto-detect skipped ({e}); using {fallback}")
    return fallback


def detect_config_hash(build_id: str, fallback: str) -> str:
    try:
        idx_url = f"{BASE_HOST}/{build_id}/index.html"
        idx_html = fetch_bytes(idx_url).decode("utf-8", errors="ignore")
        # 1) index.html 内に直接書かれている場合
        m_direct = re.search(r"config\.([0-9a-f]{5,8})\.json", idx_html)
        if m_direct:
            print(f"Auto-detected config_hash from index.html: {m_direct.group(1)}")
            return m_direct.group(1)

        # 2) <script src="..."> や設定JS・JSONを広く探索
        candidates = re.findall(r'["\']([^"\']*(?:settings|main|application|system)[^"\']*\.(?:js|json))["\']', idx_html)
        # よくある Cocos パスも予備候補に追加
        for extra in ["src/settings.json", "src/settings.js", "main.js", "application.js"]:
            if extra not in candidates:
                candidates.append(extra)

        print(f"Inspecting index.html scripts/configs: {candidates[:10]}")
        for rel in candidates:
            rel_clean = rel.lstrip("./")
            js_url = rel if rel.startswith("http") else f"{BASE_HOST}/{build_id}/{rel_clean}"
            try:
                body = fetch_bytes(js_url).decode("utf-8", errors="ignore")
            except Exception:
                continue
            for pat in [
                r'bundleVers\s*[:=]\s*\{[^}]*?["\']?resources["\']?\s*:\s*["\']([0-9a-f]{5,8})["\']',
                r'["\']resources["\']\s*:\s*["\']([0-9a-f]{5,8})["\']',
                r'config\.([0-9a-f]{5,8})\.json',
            ]:
                m_res = re.search(pat, body)
                if m_res:
                    print(f"Auto-detected config_hash from {rel_clean}: {m_res.group(1)}")
                    return m_res.group(1)
            # settings.json / main.js 内にさらに別ファイル参照がある場合
            sub_refs = re.findall(r'["\']([^"\']*(?:settings|application)[^"\']*\.(?:js|json))["\']', body)
            for srel in sub_refs[:5]:
                s_clean = srel.lstrip("./")
                if s_clean not in candidates:
                    candidates.append(s_clean)
    except Exception as e:
        print(f"config_hash auto-detect failed ({e}); using {fallback}")
    return fallback


def resolve_bin_map(cfg: dict) -> dict:
    uuids = cfg.get("uuids", [])
    paths = cfg.get("paths", {})
    native_list = cfg.get("versions", {}).get("native", [])
    native_ver = {}
    for i in range(0, len(native_list) - 1, 2):
        native_ver[native_list[i]] = native_list[i + 1]

    out = {}
    for idx_str, val in paths.items():
        p = val[0] if isinstance(val, list) else str(val)
        if not p.startswith("gameConfigBin/"):
            continue
        idx = int(idx_str)
        raw_uuid = uuids[idx]
        full_uuid = decode_cocos_uuid(raw_uuid)
        h = native_ver.get(idx) or native_ver.get(raw_uuid) or ""
        out[p.replace("gameConfigBin/", "")] = (full_uuid, h)
    return out


def load_bin(name: str, bin_map: dict, build_id: str, local_dir: str | None) -> bytes | None:
    if name not in bin_map:
        return None
    full_uuid, h = bin_map[name]
    if local_dir:
        for fn in os.listdir(local_dir):
            if fn.startswith(full_uuid) and fn.endswith(".bin"):
                return open(os.path.join(local_dir, fn), "rb").read()
        return None
    if not h:
        return None
    url = f"{BASE_HOST}/{build_id}/assets/resources/native/{full_uuid[:2]}/{full_uuid}.{h}.bin"
    return fetch_bytes(url)


def update_sp_jj(chars: list, b_jj: bytes, loc: dict) -> int:
    SP_JJ_ID_MAP = {}
    for s in list(range(1, 6)) + list(range(26, 31)):
        SP_JJ_ID_MAP[s] = "hero-67501"
    for s in list(range(6, 10)) + list(range(31, 36)):
        SP_JJ_ID_MAP[s] = "hero-1765"
    for s in range(11, 16):
        SP_JJ_ID_MAP[s] = "hero-67201"
    for s in range(16, 26):
        SP_JJ_ID_MAP[s] = "hero-1565"
    for s in range(675021, 6750210):
        SP_JJ_ID_MAP[s] = "hero-1966"
    SP_JJ_ID_MAP[6750210] = "hero-1966"

    NAME_HINTS = [
        ("アルベド", "hero-67501"),
        ("シャルティア", "hero-1765"),
        ("アウラ", "hero-67201"),
        ("マーレ", "hero-67201"),
        ("パートナー", "hero-67201"),
        ("双子", "hero-67201"),
        ("ティオ", "hero-1565"),
        ("雫", "hero-1966"),
    ]

    jj_seen = set()
    by_char = {}
    unmapped = []
    for m in re.finditer(rb"hero_jj_des_(\d+)", b_jj):
        klen = b_jj[m.start() - 1]
        dkey = b_jj[m.start() : m.start() + klen].decode("utf-8", errors="ignore")
        if not dkey.startswith("hero_jj_des_"):
            continue
        sid_str = dkey[len("hero_jj_des_") :]
        if not sid_str.isdigit() or sid_str in jj_seen:
            continue
        jj_seen.add(sid_str)
        des_ja = loc.get(dkey, "")
        if not des_ja:
            continue
        sid = int(sid_str)
        cid = SP_JJ_ID_MAP.get(sid)
        if not cid:
            zb_ja = loc.get(f"hero_jj_zb_name_{sid_str}", "")
            combined = f"{zb_ja} {des_ja}"
            for kw, target_cid in NAME_HINTS:
                if kw in combined:
                    cid = target_cid
                    break
        if not cid:
            unmapped.append((sid_str, des_ja[:40]))
            continue
        lst = by_char.setdefault(cid, [])
        lst.append({"lv": len(lst) + 1, "desc": des_ja})

    # Also parse hero_jj_jj_des_<hid5><lv> (e.g. hero_jj_jj_des_672015..6720110 for Aura & Mare)
    char_ids = {c.get("id") for c in chars}
    jj_jj_seen = set()
    for m in re.finditer(rb"hero_jj_jj_des_(\d+)", b_jj):
        klen = b_jj[m.start() - 1]
        dkey = b_jj[m.start() : m.start() + klen].decode("utf-8", errors="ignore")
        if not dkey.startswith("hero_jj_jj_des_"):
            continue
        code = dkey[len("hero_jj_jj_des_") :]
        if not code.isdigit() or len(code) < 6 or code in jj_jj_seen:
            continue
        jj_jj_seen.add(code)
        des_ja = loc.get(dkey, "")
        if not des_ja:
            continue
        pref = code[:5]
        lv_str = code[5:]
        cid = f"hero-{pref}"
        if cid not in char_ids:
            unmapped.append((code, des_ja[:40]))
            continue
        lv_num = int(lv_str)
        lst = by_char.setdefault(cid, [])
        if all(item["lv"] != lv_num for item in lst):
            lst.append({"lv": lv_num, "desc": des_ja})
        else:
            for item in lst:
                if item["lv"] == lv_num:
                    item["desc"] = des_ja
                    break

    for cid, lst in by_char.items():
        lst.sort(key=lambda x: x["lv"])

    if unmapped:
        print(f"Unmapped hero_jj entries ({len(unmapped)}): {unmapped[:10]}")

    updated = 0
    for c in chars:
        if c.get("rarity") == "SP" and c.get("id") in by_char:
            new_ev = by_char[c["id"]]
            if len(new_ev) >= len(c.get("evolutions") or []) and new_ev != c.get("evolutions"):
                c["evolutions"] = new_ev
                updated += 1
    return updated


def update_help_docs(systems: dict, b_help: bytes, loc: dict) -> int:
    seen = set()
    docs = []
    for m in re.finditer(rb"help_name_(\d+)", b_help):
        klen = b_help[m.start() - 1]
        nkey = b_help[m.start() : m.start() + klen].decode("utf-8", errors="ignore")
        if not nkey.startswith("help_name_"):
            continue
        hid = nkey[len("help_name_") :]
        if not hid.isdigit() or hid in seen:
            continue
        seen.add(hid)
        title = loc.get(nkey, "").strip()
        desc = loc.get(f"help_doc_{hid}", "").strip()
        if title and desc:
            docs.append({"id": int(hid), "title": title, "desc": desc})
    if docs and docs != systems.get("helpDocs"):
        systems["helpDocs"] = docs
        return len(docs)
    return 0




def _norm_name(s: str) -> str:
    s = str(s or "").strip()
    s = s.replace("（", "(").replace("）", ")").replace("・", "･").replace("　", " ")
    return re.sub(r"\s+", "", s)


def _strip_tags(s: str) -> str:
    return re.sub(r"<[^>]+>", "", str(s or "")).strip()


def update_element_resonance(chars: list, loc: dict) -> int:
    # Build lookup from hero_id (5 digits) -> normalized name & character object
    by_id = {c.get("id"): c for c in chars if c.get("id")}
    by_norm = {_norm_name(c.get("name")): c for c in chars if c.get("name")}

    grouped = {}
    for k in sorted(loc.keys()):
        if not k.startswith("hero_element_skill_name_"):
            continue
        code = k[len("hero_element_skill_name_") :]
        if not code.isdigit() or len(code) < 6:
            continue
        hid = code[:-1]
        slot = code[-1]
        grouped.setdefault(hid, []).append((int(slot), k))

    updated = 0
    for hid, slots in grouped.items():
        target = by_id.get(f"hero-{hid}")
        if not target:
            jname = loc.get(f"hero_hero_hero_name_{hid}") or loc.get(f"hero_name_{hid}") or ""
            target = by_norm.get(_norm_name(jname))
        if not target:
            continue

        slots.sort(key=lambda x: x[0])
        el_list = []
        for slot_num, name_key in slots:
            skill_name = _strip_tags(loc.get(name_key, ""))
            if not skill_name:
                continue
            for lv in range(1, 10):
                doc_key = f"hero_element_skill_doc_{hid}{slot_num}{lv}"
                if doc_key not in loc:
                    continue
                desc = _strip_tags(loc.get(doc_key, ""))
                if desc:
                    el_list.append({"name": skill_name, "desc": desc})

        if el_list and len(el_list) >= len(target.get("elementResonance") or []) and el_list != target.get("elementResonance"):
            target["elementResonance"] = el_list
            updated += 1
    return updated


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--build-id", default="", help="G123 ビルド番号 (空なら自動検出/既定84237)")
    ap.add_argument("--config-hash", default="", help="config.<hash>.json のハッシュ (空なら自動検出)")
    ap.add_argument("--data-dir", default="data", help="Wiki の data ディレクトリ")
    ap.add_argument("--local-dir", default=None, help="ローカルテスト用ディレクトリ")
    args = ap.parse_args()

    if args.local_dir:
        loc = json.load(open(os.path.join(args.local_dir, "Localize.json"), encoding="utf-8"))
        cfg_fn = next(f for f in os.listdir(args.local_dir) if f.startswith("config.") and f.endswith(".json"))
        cfg = json.load(open(os.path.join(args.local_dir, cfg_fn), encoding="utf-8"))
        build_id = DEFAULT_BUILD_ID
    else:
        build_id = args.build_id.strip() or detect_build_id(DEFAULT_BUILD_ID)
        cfg_hash = args.config_hash.strip() or detect_config_hash(build_id, DEFAULT_CONFIG_HASH)
        loc_url = f"{BASE_HOST}/{build_id}/g123/i18n/ja/texts/Localize.json"
        cfg_url = f"{BASE_HOST}/{build_id}/assets/resources/config.{cfg_hash}.json"
        print(f"Fetching {loc_url}")
        loc = json.loads(fetch_bytes(loc_url).decode("utf-8"))
        print(f"Fetching {cfg_url}")
        cfg = json.loads(fetch_bytes(cfg_url).decode("utf-8"))

    bin_map = resolve_bin_map(cfg)
    print(f"Resolved {len(bin_map)} bin entries from config.")

    chars_path = os.path.join(args.data_dir, "characters.json")
    sys_path = os.path.join(args.data_dir, "systems.json")
    chars = json.load(open(chars_path, encoding="utf-8"))
    systems = json.load(open(sys_path, encoding="utf-8"))

    changed = False
    b_jj = load_bin("hero_jj", bin_map, build_id, args.local_dir)
    if b_jj:
        n_sp = update_sp_jj(chars, b_jj, loc)
        if n_sp:
            print(f"Updated SP evolutions for {n_sp} characters.")
            changed = True

    n_el = update_element_resonance(chars, loc)
    if n_el:
        print(f"Updated elementResonance for {n_el} characters.")
        changed = True

    b_help = load_bin("help", bin_map, build_id, args.local_dir)
    if b_help:
        n_help = update_help_docs(systems, b_help, loc)
        if n_help:
            print(f"Updated helpDocs: {n_help} entries.")
            changed = True

    if changed:
        with open(chars_path, "w", encoding="utf-8") as f:
            json.dump(chars, f, ensure_ascii=False, indent=2)
        with open(sys_path, "w", encoding="utf-8") as f:
            json.dump(systems, f, ensure_ascii=False, indent=2)
        print("Saved updated JSON files.")
    else:
        print("No changes detected.")


if __name__ == "__main__":
    main()