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
import struct
import collections
from datetime import date
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
    for s in list(range(6, 11)) + list(range(31, 37)):
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

    # Fallback: also scan loc directly for hero_jj_jj_des_<hid5><lv> (e.g. 675031..6750310)
    for dkey, des_ja in loc.items():
        if not dkey.startswith("hero_jj_jj_des_"):
            continue
        code = dkey[len("hero_jj_jj_des_") :]
        if not code.isdigit() or len(code) < 6 or code in jj_jj_seen:
            continue
        jj_jj_seen.add(code)
        if not des_ja:
            continue
        pref = code[:5]
        lv_str = code[5:]
        cid = f"hero-{pref}"
        if cid not in char_ids:
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
        if c.get("id") in by_char and (c.get("rarity") == "SP" or any(k.startswith(f"hero_jj_jj_des_{c.get('id', '').replace('hero-', '')}") for k in jj_jj_seen)):
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




RARITY_LABELS = {3: "SR", 4: "SSR", 5: "UR", 6: "UR+", 7: "SP"}
CODE_TO_ATTR = {1: "心", 2: "夢", 3: "彩", 4: "幻", 5: "神", 6: "異界", 7: "無上"}


def _decode_id_before_len(buf: bytes, len_pos: int) -> int:
    if len_pos >= 4 and buf[len_pos - 4] == 0xF0 and (buf[len_pos - 3] & 0xC0) == 0xC0:
        b1, b2, b3 = buf[len_pos - 3], buf[len_pos - 2], buf[len_pos - 1]
        return ((b1 & 0x3F) << 16) | (b2 << 8) | b3
    raw = struct.unpack(">H", buf[len_pos - 2 : len_pos])[0]
    return raw - 0x8000 if raw >= 0x8000 else raw


def _parse_heroskill_map(b_skill: bytes, loc: dict) -> dict:
    skill_fields = [
        "activedes1", "passive1des", "passive2des", "passive3des", "passive4des",
        "activename", "passive1name", "passive2name", "passive3name", "passive4name",
    ]
    out = {}
    headers_by_pos = {}
    for hm in re.finditer(rb"\x00{8,}\xc0", b_skill):
        pos = hm.end()
        if pos + 4 <= len(b_skill):
            hid = (
                ((b_skill[pos + 1] & 0x3F) << 16) | (b_skill[pos + 2] << 8) | b_skill[pos + 3]
                if (b_skill[pos] == 0xF0 and (b_skill[pos + 1] & 0xC0) == 0xC0)
                else _decode_id_before_len(b_skill, pos + 2)
            )
            headers_by_pos[pos] = hid
    for m in re.finditer(rb"([\xc1-\xcf]..)[\x01-\x0f]\x01\x01\xf0", b_skill):
        b = m.group(1)
        headers_by_pos.setdefault(m.start(), ((b[0] & 0x3F) << 16) | (b[1] << 8) | b[2])
    for m in re.finditer(rb"([\x80-\xbf].)[\x01-\x0f]\x01\x01[\xd0-\xff]", b_skill):
        b = m.group(1)
        headers_by_pos.setdefault(m.start(), ((b[0] & 0x3F) << 8) | b[1])

    sorted_headers = sorted(headers_by_pos.items())
    for h_idx, (pos, hid) in enumerate(sorted_headers):
        chunk_end = sorted_headers[h_idx + 1][0] if h_idx + 1 < len(sorted_headers) else len(b_skill)
        hero_chunk = b_skill[pos:chunk_end]
        tier_matches = list(re.finditer(rb"hero_hero_skill_activedes1_([0-9_]+)", hero_chunk))
        for t_idx, tm in enumerate(tier_matches):
            klen = hero_chunk[tm.start() - 1]
            full_key = hero_chunk[tm.start() : tm.start() + klen].decode("utf-8", errors="ignore")
            sid_str = full_key[len("hero_hero_skill_activedes1_") :]
            t_start = tm.start()
            t_end = tier_matches[t_idx + 1].start() if t_idx + 1 < len(tier_matches) else len(hero_chunk)
            t_chunk = hero_chunk[t_start:t_end]
            tier_obj = {}
            for sf in skill_fields:
                pat = f"hero_hero_skill_{sf}_{sid_str}".encode("utf-8")
                if pat in t_chunk:
                    key_str = pat.decode("utf-8")
                    val = _strip_tags(loc.get(key_str, ""))
                    if val:
                        tier_obj[sf] = val
            if tier_obj:
                out.setdefault(hid, []).append(tier_obj)
    return out


def add_new_heroes(chars: list, b_hero: bytes, b_skill: bytes | None, loc: dict) -> int:
    existing_ids = {c.get("id") for c in chars}
    existing_names = {_norm_name(c.get("name")) for c in chars if c.get("name")}
    skills_map = _parse_heroskill_map(b_skill, loc) if b_skill else {}

    def _find_skills_from_loc(name_ja: str) -> dict:
        norm_target = _norm_name(name_ja)
        if not norm_target:
            return {}
        matched_sids = set()
        for k, v in loc.items():
            if not k.startswith("hero_hero_skill_"):
                continue
            if norm_target in _norm_name(v):
                m_sid = re.search(r"_(\d+)$", k)
                if m_sid:
                    matched_sids.add(m_sid.group(1))
        if len(matched_sids) != 1:
            return {}
        sid_str = next(iter(matched_sids))
        skills_obj = {}
        for slot_key, n_f, d_f in [
            ("main", "activename", "activedes1"),
            ("p1", "passive1name", "passive1des"),
            ("p2", "passive2name", "passive2des"),
            ("p3", "passive3name", "passive3des"),
            ("p4", "passive4name", "passive4des"),
        ]:
            sname = _strip_tags(loc.get(f"hero_hero_skill_{n_f}_{sid_str}", ""))
            sdesc = _strip_tags(loc.get(f"hero_hero_skill_{d_f}_{sid_str}", ""))
            if sname or sdesc:
                skills_obj[slot_key] = {"name": sname, "before": sdesc, "after": sdesc}
        return skills_obj

    h_matches = [m.start() for m in re.finditer(rb"hero_hero_hero_name_", b_hero)]
    added = 0
    for i, pos in enumerate(h_matches):
        nlen = b_hero[pos - 1]
        name_key = b_hero[pos : pos + nlen].decode("utf-8", errors="ignore")
        hid = _decode_id_before_len(b_hero, pos - 1)
        clen = b_hero[pos + nlen]
        end = h_matches[i + 1] - 4 if i + 1 < len(h_matches) else len(b_hero)
        rest = b_hero[pos + nlen + 1 + clen : end]
        rarity_code = rest[0] if len(rest) > 0 else None
        faction_code = rest[1] if len(rest) > 1 else None

        name_ja = (loc.get(name_key) or "").strip()
        if not name_ja or "テスト" in name_ja:
            continue
        cid = f"hero-{hid}"
        if cid in existing_ids or _norm_name(name_ja) in existing_names:
            ex_c = next((c for c in chars if c.get("id") == cid or _norm_name(c.get("name")) == _norm_name(name_ja)), None)
            if ex_c and not ex_c.get("skills"):
                skills_obj = {}
                if hid in skills_map:
                    tiers = skills_map.get(hid, [])
                    first_t, last_t = (tiers[0] if tiers else {}), (tiers[-1] if tiers else {})
                    for slot_key, n_f, d_f in [
                        ("main", "activename", "activedes1"),
                        ("p1", "passive1name", "passive1des"),
                        ("p2", "passive2name", "passive2des"),
                        ("p3", "passive3name", "passive3des"),
                        ("p4", "passive4name", "passive4des"),
                    ]:
                        sname = last_t.get(n_f) or first_t.get(n_f) or ""
                        sbefore = first_t.get(d_f) or ""
                        safter = last_t.get(d_f) or sbefore
                        if sname or safter:
                            skills_obj[slot_key] = {"name": sname, "before": sbefore, "after": safter}
                else:
                    skills_obj = _find_skills_from_loc(name_ja)
                if skills_obj:
                    ex_c["skills"] = skills_obj
                    added += 1
                    print(f"Populated skills for existing character: {cid} ({name_ja})")
            continue

        tiers = skills_map.get(hid, [])
        first_t = tiers[0] if tiers else {}
        last_t = tiers[-1] if tiers else {}
        skills_obj = {}
        for slot_key, n_f, d_f in [
            ("main", "activename", "activedes1"),
            ("p1", "passive1name", "passive1des"),
            ("p2", "passive2name", "passive2des"),
            ("p3", "passive3name", "passive3des"),
            ("p4", "passive4name", "passive4des"),
        ]:
            sname = last_t.get(n_f) or first_t.get(n_f) or ""
            sbefore = first_t.get(d_f) or ""
            safter = last_t.get(d_f) or sbefore
            if sname or safter:
                skills_obj[slot_key] = {"name": sname, "before": sbefore, "after": safter}
        if not skills_obj:
            skills_obj = _find_skills_from_loc(name_ja)

        chars.append({
            "id": cid,
            "name": name_ja,
            "shortName": name_ja,
            "rarity": RARITY_LABELS.get(rarity_code, "-"),
            "attr": CODE_TO_ATTR.get(faction_code, "-"),
            "subAttr": "",
            "type": "-",
            "tier": "-",
            "roles": [],
            "summary": "",
            "recommendedCircles": [],
            "recommendedArtifacts": [],
            "recommendedRerolls": [],
            "skills": skills_obj,
            "evolutions": [],
        })
        existing_ids.add(cid)
        existing_names.add(_norm_name(name_ja))
        added += 1
        print(f"Added new character: {cid} ({name_ja})")
    return added




def _strip_tags_flat(s: str) -> str:
    return re.sub(r"\s*\n+\s*", "", _strip_tags(s)).strip()


def update_magic_circles(circles: list, b_mf: bytes, b_mfs: bytes, loc: dict) -> int:
    STAR_TO_TIER = {1: "2", 2: "4", 3: "6", 4: "10"}
    mf_stars = {}
    star_seen = set()
    for m in re.finditer(rb"skilldes_(\d+)", b_mfs):
        klen = b_mfs[m.start() - 1]
        skey = b_mfs[m.start() : m.start() + klen].decode("utf-8", errors="ignore")
        if not skey.startswith("skilldes_") or skey.endswith("_vice") or skey in star_seen:
            continue
        star_seen.add(skey)
        code = skey[len("skilldes_") :]
        if len(code) < 7 or not code.isdigit():
            continue
        fid, star_lv = code[:-2], int(code[-2:])
        if star_lv not in STAR_TO_TIER:
            continue
        desc = _strip_tags_flat(loc.get(skey, ""))
        vice = _strip_tags_flat(loc.get(f"{skey}_vice", ""))
        if desc:
            txt = f"{desc}\n【副効果】{vice}" if vice else desc
            mf_stars.setdefault(fid, {})[STAR_TO_TIER[star_lv]] = txt

    by_name = {_norm_name(c.get("name")): c for c in circles if c.get("name")}
    mf_seen = set()
    updated = 0
    for m in re.finditer(rb"mofazhen_name_\d+", b_mf):
        klen = b_mf[m.start() - 1]
        nkey = b_mf[m.start() : m.start() + klen].decode("utf-8", errors="ignore")
        if not nkey.startswith("mofazhen_name_") or nkey in mf_seen:
            continue
        mf_seen.add(nkey)
        fid = nkey[len("mofazhen_name_") :]
        name_ja = (loc.get(nkey) or "").strip()
        if not name_ja or "テスト" in name_ja:
            continue
        tiers = mf_stars.get(fid, {})
        if not tiers:
            continue
        existing = by_name.get(_norm_name(name_ja))
        if not existing:
            circles.append({
                "id": f"mf-{fid}",
                "name": name_ja,
                "source": "",
                "statType": "",
                "priority": "",
                "bestStop": "",
                "tags": [],
                "note": "",
                "tiers": tiers,
            })
            by_name[_norm_name(name_ja)] = circles[-1]
            updated += 1
            print(f"Added new magic circle: {name_ja}")
        else:
            def _tkey(d): return {k: re.sub(r"\s+", "", v) for k, v in (d or {}).items()}
            if _tkey(existing.get("tiers")) != _tkey(tiers) and len(tiers) >= len(existing.get("tiers") or {}):
                existing["tiers"] = tiers
                updated += 1
    return updated


def update_beasts(systems: dict, b_ms: bytes, loc: dict) -> int:
    beasts = systems.setdefault("beasts", [])
    by_name = {_norm_name(b.get("name")): b for b in beasts if b.get("name")}
    ms_seen = set()
    added = 0
    for m in re.finditer(rb"moshou_name_\d+", b_ms):
        klen = b_ms[m.start() - 1]
        nkey = b_ms[m.start() : m.start() + klen].decode("utf-8", errors="ignore")
        if not nkey.startswith("moshou_name_") or nkey in ms_seen:
            continue
        ms_seen.add(nkey)
        mid = nkey[len("moshou_name_") :]
        name_ja = (loc.get(nkey) or "").strip()
        base_name = re.sub(r"\((?:SR|SSR|UR\+?)\)$", "", name_ja).strip()
        if not name_ja or "テスト" in name_ja or _norm_name(name_ja) in by_name or _norm_name(base_name) in by_name:
            continue
        sk_name = _strip_tags(loc.get(f"moshou_skillname_{mid}", ""))
        sk_desc = _strip_tags(loc.get(f"moshou_skilldesc_{mid}", ""))
        note = f"{sk_name}: {sk_desc}" if sk_name and sk_desc else sk_desc
        beasts.append({
            "name": name_ja,
            "rarity": "-",
            "attr": "-",
            "role": "",
            "note": note,
            "skillName": sk_name,
            "skillDesc": sk_desc,
        })
        by_name[_norm_name(name_ja)] = beasts[-1]
        added += 1
        print(f"Added new beast: {name_ja}")
    return added


ARTIFACT_RARITY_LABELS = {2: "R", 3: "SR", 4: "SSR", 5: "UR", 6: "UR+", 7: "SP"}
ARTIFACT_ID_PREFIX_RARITY = {"1": "R", "2": "SR", "3": "SSR", "4": "UR", "5": "UR+", "6": "SP"}


def update_artifacts(systems: dict, b_art: bytes, b_attr: bytes | None, loc: dict) -> int:
    artifacts = systems.setdefault("artifacts", [])
    by_name = {_norm_name(a.get("name")): a for a in artifacts if a.get("name")}
    known_attrs = {m.group(1).decode("ascii") for m in re.finditer(rb"intr_([a-z0-9_]+)", b_attr)} if b_attr else set()

    def _read_var_int(buf, idx):
        b0 = buf[idx]
        if b0 < 0x80: return b0, idx + 1
        if b0 < 0xC0: return ((b0 & 0x3F) << 8) | buf[idx + 1], idx + 2
        return ((b0 & 0x3F) << 16) | (buf[idx + 1] << 8) | buf[idx + 2], idx + 3

    art_matches = list(re.finditer(rb"artifact_name_\d+", b_art))
    art_chunks = {}
    art_rarities = {}
    for i, m in enumerate(art_matches):
        klen = b_art[m.start() - 1]
        nkey = b_art[m.start() : m.start() + klen].decode("utf-8", errors="ignore")
        if not nkey.startswith("artifact_name_"):
            continue
        aid = nkey[len("artifact_name_") :]
        if aid not in art_rarities and m.start() >= 2:
            rcode = b_art[m.start() - 2]
            if rcode in ARTIFACT_RARITY_LABELS:
                art_rarities[aid] = ARTIFACT_RARITY_LABELS[rcode]
        end = art_matches[i + 1].start() if i + 1 < len(art_matches) else len(b_art)
        art_chunks.setdefault(aid, []).append(b_art[m.start() : end])

    def _build_jz_note(aid: str) -> str:
        parts = []
        s_names = [loc.get(f"artifact_jz_name_{aid}00{i}", "").strip() for i in range(1, 6)]
        s_names = [s for s in s_names if s]
        for slot_idx in ("04", "05"):
            texts = []
            for lv in range(2, 7):
                t = _strip_tags(loc.get(f"artifact_jz_text_{aid}{slot_idx}00{lv}", ""))
                if t and t != "なし":
                    texts.append(t)
            if texts:
                sname = s_names[int(slot_idx) - 1] if len(s_names) >= int(slot_idx) else f"スキル{int(slot_idx)}"
                parts.append(f"【{sname}】{texts[-1]}")
        return " / ".join(parts)

    def _combine_note(aid: str) -> str:
        des_ja = _strip_tags(loc.get(f"artifact_des_{aid}", ""))
        jz_note = _build_jz_note(aid)
        if des_ja and jz_note and jz_note not in des_ja:
            return f"{des_ja} / {jz_note}"
        return des_ja or jz_note

    added = 0
    for aid, chunks in art_chunks.items():
        name_ja = (loc.get(f"artifact_name_{aid}") or "").strip()
        if not name_ja or "テスト" in name_ja:
            continue
        rarity = art_rarities.get(aid) or (ARTIFACT_ID_PREFIX_RARITY.get(aid[0], "-") if len(aid) >= 4 else "-")
        note_ja = _combine_note(aid)
        attr_by_key = {}
        for ch in chunks:
            for m_tok in re.finditer(rb"[a-z][a-z0-9_]{1,20}", ch):
                t = m_tok.group(0).decode("ascii", errors="ignore")
                if t not in known_attrs or (m_tok.start() > 0 and ch[m_tok.start() - 1] != len(t)):
                    continue
                if m_tok.end() < len(ch):
                    rv, _ = _read_var_int(ch, m_tok.end())
                    attr_by_key.setdefault(t, []).append(rv)
        attrs_out = []
        eff_parts = []
        for k, vals in attr_by_key.items():
            base_k = k[:-1] if k.endswith("x") and k[:-1] in known_attrs else k
            k_ja = loc.get(f"intr_{base_k}") or loc.get(f"attr_name_{base_k}") or base_k
            fmt = (lambda v: f"{v/10.0:g}%") if "pro" in k else str
            attrs_out.append({"key": k, "name_ja": k_ja, "base": fmt(vals[0]), "max": fmt(vals[-1]), "values": [fmt(v) for v in vals]})
            eff_parts.append(f"{k_ja} {fmt(vals[0])}〜{fmt(vals[-1])}")
        existing_art = by_name.get(_norm_name(name_ja))
        if existing_art:
            art_changed = False
            if existing_art.get("rarity") in ("", "-", None) and rarity != "-":
                existing_art["rarity"] = rarity
                art_changed = True
            if not existing_art.get("attributes") and attrs_out:
                existing_art["attributes"] = attrs_out
                art_changed = True
            if not existing_art.get("effect") and eff_parts:
                existing_art["effect"] = " / ".join(eff_parts)
                art_changed = True
            if not existing_art.get("note") and note_ja:
                existing_art["note"] = note_ja
                art_changed = True
            if art_changed:
                added += 1
            continue
        artifacts.append({
            "name": name_ja,
            "rarity": rarity,
            "cost": "-",
            "effect": " / ".join(eff_parts),
            "note": note_ja,
            "attributes": attrs_out,
        })
        by_name[_norm_name(name_ja)] = artifacts[-1]
        added += 1
        print(f"Added new artifact: {name_ja} ({rarity})")

    # Fallback: also scan Localize.json for artifact_name_<aid> not yet in artifact.bin (e.g. 6022)
    for k in sorted(loc.keys()):
        if not k.startswith("artifact_name_"):
            continue
        aid = k[len("artifact_name_") :]
        if not aid.isdigit():
            continue
        name_ja = (loc.get(k) or "").strip()
        if not name_ja or "テスト" in name_ja:
            continue
        rarity = ARTIFACT_ID_PREFIX_RARITY.get(aid[0], "-") if len(aid) >= 4 else "-"
        note_ja = _combine_note(aid)
        existing_art = by_name.get(_norm_name(name_ja))
        if existing_art:
            art_changed = False
            if existing_art.get("rarity") in ("", "-", None) and rarity != "-":
                existing_art["rarity"] = rarity
                art_changed = True
            if not existing_art.get("note") and note_ja:
                existing_art["note"] = note_ja
                art_changed = True
            if art_changed:
                added += 1
                print(f"Updated artifact (from Localize): {name_ja} ({rarity})")
            continue
        artifacts.append({
            "name": name_ja,
            "rarity": rarity,
            "cost": "-",
            "effect": "",
            "note": note_ja,
            "attributes": [],
        })
        by_name[_norm_name(name_ja)] = artifacts[-1]
        added += 1
        print(f"Added new artifact (from Localize): {name_ja} ({rarity})")
    return added




def fetch_optional_localize(build_id: str, candidates: list[str]) -> dict:
    for lang_code in candidates:
        url = f"{BASE_HOST}/{build_id}/g123/i18n/{lang_code}/texts/Localize.json"
        try:
            data = json.loads(fetch_bytes(url).decode("utf-8"))
            if isinstance(data, dict) and data:
                print(f"Fetched {lang_code} Localize.json ({len(data)} keys)")
                return data
        except Exception:
            continue
    return {}


def update_i18n_glossary(data_dir: str, chars: list, circles: list, systems: dict, ja: dict, ko: dict, en: dict, zh: dict) -> bool:
    if not (ko or en or zh):
        return False

    rev_norm = collections.defaultdict(list)
    rev_exact = collections.defaultdict(list)
    for k, v in ja.items():
        if isinstance(v, str) and v.strip():
            rev_exact[v.strip()].append(k)
            rev_norm[_norm_name(v)].append(k)

    ALIASES = {"リリアーナ（聖なる王女）": "リリアーナ(聖なる女王)"}

    def pick_key(name: str, pref_prefixes: tuple[str, ...]) -> str | None:
        name = ALIASES.get(name, name)
        if not name:
            return None
        keys = rev_exact.get(name.strip(), []) or rev_norm.get(_norm_name(name), [])
        if not keys:
            return None
        for pref in pref_prefixes:
            for k in keys:
                if k.startswith(pref):
                    return k
        return keys[0]

    items = []
    seen_pairs = set()

    def add_item(item_id: str, category: str, sub: str, ja_text: str, key: str | None, link_view: str = "", link_id: str = ""):
        ja_val = str(ja_text or "").strip()
        if not ja_val:
            return
        ko_val = ko.get(key, "").strip() if key else ""
        en_val = en.get(key, "").strip() if key else ""
        zh_val = zh.get(key, "").strip() if key else ""
        if not (ko_val or en_val or zh_val):
            return
        sig = (category, ja_val)
        if sig in seen_pairs:
            return
        seen_pairs.add(sig)
        obj = {
            "id": item_id,
            "category": category,
            "sub": sub,
            "ja": ja_val,
            "ko": ko_val.replace("\n", " "),
            "en": en_val.replace("\n", " "),
            "zh": zh_val.replace("\n", " "),
        }
        if link_view:
            obj["linkView"] = link_view
        if link_id:
            obj["linkId"] = link_id
        items.append(obj)

    for c in chars:
        k = pick_key(c["name"], ("hero_hero_hero_name_", "hero_name_", "head_name_"))
        add_item(c["id"], "キャラクター", f"{c.get('rarity', '')} / {c.get('attr', '')}属性", c["name"], k, "char-detail", c["id"])

    for m in circles:
        k = pick_key(m["name"], ("mofazhen_name_", "fazhen_name_"))
        src_str = (m.get("source") or "").split("/")[0].strip()
        add_item(m["id"], "魔法陣", src_str, m["name"], k, "circle-detail", m["id"])

    for idx, b in enumerate(systems.get("beasts", [])):
        k = pick_key(b["name"], ("hex_name_", "monster_name_", "pet_name_"))
        add_item(f"beast_{idx}", "魔獣", f"{b.get('rarity', '')} / {b.get('role', '')}", b["name"], k, "beasts")

    for idx, a in enumerate(systems.get("artifacts", [])):
        k = pick_key(a["name"], ("artifact_name_",))
        add_item(f"af_{idx}", "アーティファクト", a.get("rarity", ""), a["name"], k, "artifacts")

    for idx, s in enumerate(systems.get("spirits", [])):
        k = pick_key(s["name"], ("shenshu_name_",))
        add_item(f"spirit_{idx}", "神術", s.get("cat", ""), s["name"], k, "shinjutsu")

    for idx, kr in enumerate(systems.get("kourei", [])):
        k = pick_key(kr["name"], ("yl_name_",))
        add_item(f"kourei_{idx}", "煌霊", kr.get("rarity", ""), kr["name"], k, "kourei")

    for idx, w in enumerate(systems.get("weapons", [])):
        k = pick_key(w["name"], ("weapon_name_", "weapon_nihua_name_"))
        add_item(f"weapon_{idx}", "武器", w.get("note", ""), w["name"], k, "weapons")

    for idx, d in enumerate(systems.get("divineEquips", [])):
        k = pick_key(d["name"], ("divine_set_name_",))
        add_item(f"divine_{idx}", "神装備", f"{len(d.get('equips', []))}部位", d["name"], k, "divineEquips")

    for idx, bs in enumerate(systems.get("baoshi", [])):
        k = pick_key(bs["name"], ("baoshi_name_", "gem_name_", "item_name_"))
        add_item(f"baoshi_{idx}", "宝石", bs.get("cat", ""), bs["name"], k)

    for k in sorted(ja.keys()):
        if not k.startswith("buff_showname_"):
            continue
        jval = str(ja[k] or "").strip()
        if not jval or len(jval) > 18 or "{" in jval or "}" in jval or "テスト" in jval or k == "buff_showname_Key2ProChkMFZ":
            continue
        add_item(k, "バフ・状態異常", "戦闘効果", jval, k)

    seen_lab = set()
    for i in range(0, 30):
        k = f"Chapter_{i}"
        if k not in ja:
            continue
        jval = re.sub(r"^\d+\.", "", ja[k]).strip()
        kval = re.sub(r"^\d+\.", "", ko.get(k, "")).strip()
        eval_ = re.sub(r"^\d+\.", "", en.get(k, "")).strip()
        zval = re.sub(r"^\d+\.", "", zh.get(k, "")).strip()
        if not jval or jval in seen_lab or not (kval or eval_ or zval):
            continue
        seen_lab.add(jval)
        sig = ("迷宮・コンテンツ", jval)
        if sig not in seen_pairs:
            seen_pairs.add(sig)
            items.append({"id": k, "category": "迷宮・コンテンツ", "sub": "迷宮名", "ja": jval, "ko": kval, "en": eval_, "zh": zval})

    core_terms = [
        ("魔物迎撃戦", "コンテンツ", ("adou",)),
        ("魔獣戦争", "コンテンツ", ("moshou_", "hex_", "war_")),
        ("競技場", "コンテンツ", ("arena", "jjc")),
        ("栄光の戦場", "コンテンツ", ("glory", "rongyao")),
        ("ギルド", "コンテンツ", ("guild", "union", "gonghui")),
        ("アーティファクト", "システム", ("artifact",)),
        ("魔法陣", "システム", ("mofazhen", "fazhen")),
        ("神術", "システム", ("shenshu",)),
        ("煌霊", "システム", ("yl_", "yingling")),
        ("神装備", "システム", ("divine", "shenzhuang")),
        ("適正石", "システム", ("aptitude", "zizhi")),
        ("攻撃力", "ステータス", ("atk", "attr_")),
        ("生命値", "ステータス", ("hp", "life")),
        ("防御力", "ステータス", ("def",)),
        ("速度", "ステータス", ("speed", "spd")),
        ("会心率", "ステータス", ("crit", "baoji")),
        ("会心ダメージ", "ステータス", ("baoshang", "crit")),
        ("ダメージ軽減", "ステータス", ("jianshang",)),
        ("効果命中", "ステータス", ("mingzhong", "hit")),
        ("効果抵抗", "ステータス", ("dikang", "res")),
    ]
    for term_ja, sub, prefs in core_terms:
        k = pick_key(term_ja, prefs)
        if k:
            add_item(f"core_{k}", "迷宮・コンテンツ", sub, term_ja, k)

    languages = [
        {"code": "ja", "label": "日本語"},
        {"code": "ko", "label": "한국어 (韓国語)"},
        {"code": "en", "label": "English (英語)"},
    ]
    if zh:
        languages.append({"code": "zh", "label": "中文 (中国語)"})

    gl_path = os.path.join(data_dir, "i18n_glossary.json")
    old_gl = json.load(open(gl_path, encoding="utf-8")) if os.path.exists(gl_path) else {}
    if old_gl.get("items") == items and old_gl.get("meta", {}).get("languages") == languages:
        return False

    # Preserve existing zh/ko/en if one language temporarily failed to fetch
    if not zh and old_gl.get("meta", {}).get("hasZh"):
        old_zh = {x["id"]: x.get("zh", "") for x in old_gl.get("items", [])}
        for it in items:
            if not it["zh"] and old_zh.get(it["id"]):
                it["zh"] = old_zh[it["id"]]
        if any(it["zh"] for it in items):
            languages.append({"code": "zh", "label": "中文 (中国語)"})

    out_obj = {
        "meta": {
            "updatedAt": date.today().isoformat(),
            "total": len(items),
            "languages": languages,
            "hasZh": any(l["code"] == "zh" for l in languages),
        },
        "items": items,
    }
    with open(gl_path, "w", encoding="utf-8") as f:
        json.dump(out_obj, f, ensure_ascii=False, indent=2)
    print(f"Updated i18n_glossary.json: {len(items)} items (hasZh={out_obj['meta']['hasZh']})")
    return True




def update_spirits(systems: dict, b_shenshu: bytes, loc: dict) -> int:
    CAT_MAP = {"2": "中級", "3": "高級", "4": "特級", "5": "超級", "6": "超級"}
    spirits = systems.setdefault("spirits", [])
    by_name = {_norm_name(s.get("name")): s for s in spirits if s.get("name")}
    by_rank = {s.get("rank"): s for s in spirits if s.get("rank")}
    seen = set()
    added = 0
    for m in re.finditer(rb"shenshu_name_\d+", b_shenshu):
        klen = b_shenshu[m.start() - 1]
        nkey = b_shenshu[m.start() : m.start() + klen].decode("utf-8", errors="ignore")
        if not nkey.startswith("shenshu_name_") or nkey in seen:
            continue
        seen.add(nkey)
        sid = nkey[len("shenshu_name_") :]
        name_ja = (loc.get(nkey) or "").strip()
        if not name_ja or "テスト" in name_ja:
            continue
        rank_str = f"ID:{sid}"
        if rank_str in by_rank or _norm_name(name_ja) in by_name:
            continue
        levels = []
        for lv in range(1, 6):
            desc = _strip_tags(loc.get(f"skill_des_30{sid}{lv}") or loc.get(f"skill_des_30{sid}{lv}03") or "")
            if desc:
                levels.append({"label": f"{lv}凸", "desc": desc})
        if not levels:
            continue
        cat = CAT_MAP.get(sid[2] if len(sid) >= 3 else "", "その他")
        spirits.append({
            "name": name_ja,
            "cat": cat,
            "rank": rank_str,
            "note": levels[0]["desc"],
            "levels": levels,
        })
        by_name[_norm_name(name_ja)] = spirits[-1]
        by_rank[rank_str] = spirits[-1]
        added += 1
        print(f"Added new spirit: {name_ja} ({rank_str})")
    return added


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
    b_hero = load_bin("hero", bin_map, build_id, args.local_dir)
    b_skill = load_bin("heroskill", bin_map, build_id, args.local_dir)
    if b_hero:
        n_new = add_new_heroes(chars, b_hero, b_skill, loc)
        if n_new:
            print(f"Added {n_new} new characters.")
            changed = True

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

    mc_path = os.path.join(args.data_dir, "magic_circles.json")
    circles = json.load(open(mc_path, encoding="utf-8")) if os.path.exists(mc_path) else []
    b_mf = load_bin("mofazhen", bin_map, build_id, args.local_dir)
    b_mfs = load_bin("mofazhen_star", bin_map, build_id, args.local_dir)
    if b_mf and b_mfs and circles:
        n_mc = update_magic_circles(circles, b_mf, b_mfs, loc)
        if n_mc:
            print(f"Updated magic_circles: {n_mc} entries.")
            changed = True

    b_ms = load_bin("moshou", bin_map, build_id, args.local_dir)
    if b_ms:
        n_ms = update_beasts(systems, b_ms, loc)
        if n_ms:
            print(f"Added {n_ms} new beasts.")
            changed = True

    b_art = load_bin("artifact", bin_map, build_id, args.local_dir)
    b_attr = load_bin("heroattr", bin_map, build_id, args.local_dir)
    if b_art:
        n_art = update_artifacts(systems, b_art, b_attr, loc)
        if n_art:
            print(f"Added {n_art} new artifacts.")
            changed = True

    b_shenshu = load_bin("shenshu", bin_map, build_id, args.local_dir)
    if b_shenshu:
        n_sp_art = update_spirits(systems, b_shenshu, loc)
        if n_sp_art:
            print(f"Added {n_sp_art} new spirits.")
            changed = True

    if changed:
        with open(chars_path, "w", encoding="utf-8") as f:
            json.dump(chars, f, ensure_ascii=False, indent=2)
        with open(sys_path, "w", encoding="utf-8") as f:
            json.dump(systems, f, ensure_ascii=False, indent=2)
        if circles:
            with open(mc_path, "w", encoding="utf-8") as f:
                json.dump(circles, f, ensure_ascii=False, indent=2)
        print("Saved updated JSON files.")
    else:
        print("No core data changes detected.")

    if not args.local_dir:
        ko_loc = fetch_optional_localize(build_id, ["ko"])
        en_loc = fetch_optional_localize(build_id, ["en"])
        zh_loc = fetch_optional_localize(build_id, ["zh-TW", "zh-Hant", "zh", "zh_tw"])
        update_i18n_glossary(args.data_dir, chars, circles, systems, loc, ko_loc, en_loc, zh_loc)


if __name__ == "__main__":
    main()