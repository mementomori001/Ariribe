#!/usr/bin/env python3
"""
AriRebe Wiki 多言語固有名詞対応表 (data/i18n_glossary.json) 生成スクリプト
日本語・韓国語・英語（将来的に中国語も追加可能）の Localize*.json から
キャラクター・魔法陣・魔獣・アーティファクト・神術・煌霊・武器・神装備・宝石・バフ・迷宮・基本用語を抽出する。
"""
import argparse
import collections
import json
import os
import re
from datetime import date


def norm(s: str) -> str:
    s = str(s or "").strip()
    s = s.replace("（", "(").replace("）", ")").replace("・", "･").replace("　", " ")
    s = re.sub(r"\s+", "", s)
    return s


def load_loc(path: str | None) -> dict:
    if not path or not os.path.exists(path):
        return {}
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--ja", required=True)
    parser.add_argument("--ko", default=None)
    parser.add_argument("--en", default=None)
    parser.add_argument("--zh", default=None)
    parser.add_argument("--data-dir", required=True)
    parser.add_argument("--out", required=True)
    args = parser.parse_args()

    ja = load_loc(args.ja)
    ko = load_loc(args.ko)
    en = load_loc(args.en)
    zh = load_loc(args.zh)

    # Reverse lookup: normalized Japanese -> list of keys
    rev_norm = collections.defaultdict(list)
    rev_exact = collections.defaultdict(list)
    for k, v in ja.items():
        if isinstance(v, str) and v.strip():
            rev_exact[v.strip()].append(k)
            rev_norm[norm(v)].append(k)

    ALIASES = {"リリアーナ（聖なる王女）": "リリアーナ(聖なる女王)"}

    def pick_key(name: str, pref_prefixes: tuple[str, ...]) -> str | None:
        name = ALIASES.get(name, name)
        if not name:
            return None
        keys = rev_exact.get(name.strip(), []) or rev_norm.get(norm(name), [])
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
        ja_val = ja_text.strip()
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

    # 1. Characters
    with open(os.path.join(args.data_dir, "characters.json"), encoding="utf-8") as f:
        chars = json.load(f)
    for c in chars:
        k = pick_key(c["name"], ("hero_hero_hero_name_", "hero_name_", "head_name_"))
        sub = f"{c.get('rarity', '')} / {c.get('attr', '')}属性"
        add_item(c["id"], "キャラクター", sub, c["name"], k, "char-detail", c["id"])

    # 2. Magic Circles
    with open(os.path.join(args.data_dir, "magic_circles.json"), encoding="utf-8") as f:
        circles = json.load(f)
    for m in circles:
        k = pick_key(m["name"], ("mofazhen_name_", "fazhen_name_"))
        src = (m.get("source") or "").split("/")[0].strip()
        add_item(m["id"], "魔法陣", src, m["name"], k, "circle-detail", m["id"])

    # 3. Systems
    with open(os.path.join(args.data_dir, "systems.json"), encoding="utf-8") as f:
        sys_data = json.load(f)

    for idx, b in enumerate(sys_data.get("beasts", [])):
        k = pick_key(b["name"], ("hex_name_", "monster_name_", "pet_name_"))
        add_item(f"beast_{idx}", "魔獣", f"{b.get('rarity', '')} / {b.get('role', '')}", b["name"], k, "beasts")

    for idx, a in enumerate(sys_data.get("artifacts", [])):
        k = pick_key(a["name"], ("artifact_name_",))
        add_item(f"af_{idx}", "アーティファクト", a.get("rarity", ""), a["name"], k, "artifacts")

    for idx, s in enumerate(sys_data.get("spirits", [])):
        k = pick_key(s["name"], ("shenshu_name_",))
        add_item(f"spirit_{idx}", "神術", s.get("cat", ""), s["name"], k, "shinjutsu")

    for idx, kr in enumerate(sys_data.get("kourei", [])):
        k = pick_key(kr["name"], ("yl_name_",))
        add_item(f"kourei_{idx}", "煌霊", kr.get("rarity", ""), kr["name"], k, "kourei")

    for idx, w in enumerate(sys_data.get("weapons", [])):
        k = pick_key(w["name"], ("weapon_name_", "weapon_nihua_name_"))
        add_item(f"weapon_{idx}", "武器", w.get("note", ""), w["name"], k, "weapons")

    for idx, d in enumerate(sys_data.get("divineEquips", [])):
        k = pick_key(d["name"], ("divine_set_name_",))
        add_item(f"divine_{idx}", "神装備", f"{len(d.get('equips', []))}部位", d["name"], k, "divineEquips")

    for idx, bs in enumerate(sys_data.get("baoshi", [])):
        k = pick_key(bs["name"], ("baoshi_name_", "gem_name_", "item_name_"))
        add_item(f"baoshi_{idx}", "宝石", bs.get("cat", ""), bs["name"], k)

    # 4. Buffs & Status Effects (buff_showname_*)
    for k in sorted(ja.keys()):
        if not k.startswith("buff_showname_"):
            continue
        jval = str(ja[k] or "").strip()
        if not jval or len(jval) > 18 or "{" in jval or "}" in jval or "テスト" in jval or k == "buff_showname_Key2ProChkMFZ":
            continue
        add_item(k, "バフ・状態異常", "戦闘効果", jval, k)

    # 5. Labyrinths (Chapter_0..20 unique names)
    seen_lab = set()
    for i in range(0, 30):
        k = f"Chapter_{i}"
        if k not in ja:
            continue
        jval = re.sub(r"^\d+\.", "", ja[k]).strip()
        kval = re.sub(r"^\d+\.", "", ko.get(k, "")).strip()
        eval_ = re.sub(r"^\d+\.", "", en.get(k, "")).strip()
        zval = re.sub(r"^\d+\.", "", zh.get(k, "")).strip()
        if not jval or jval in seen_lab:
            continue
        seen_lab.add(jval)
        if not (kval or eval_ or zval):
            continue
        sig = ("迷宮・コンテンツ", jval)
        if sig not in seen_pairs:
            seen_pairs.add(sig)
            items.append({
                "id": k,
                "category": "迷宮・コンテンツ",
                "sub": "迷宮名",
                "ja": jval,
                "ko": kval,
                "en": eval_,
                "zh": zval,
            })

    # 6. Core Content & System Terms
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

    out_obj = {
        "meta": {
            "updatedAt": date.today().isoformat(),
            "total": len(items),
            "languages": languages,
            "hasZh": bool(zh),
        },
        "items": items,
    }

    os.makedirs(os.path.dirname(args.out), exist_ok=True)
    with open(args.out, "w", encoding="utf-8") as f:
        json.dump(out_obj, f, ensure_ascii=False, indent=2)

    cat_counts = collections.Counter(x["category"] for x in items)
    print(f"Generated {args.out}: total={len(items)} items")
    for c, n in cat_counts.items():
        print(f"  {c}: {n}")


if __name__ == "__main__":
    main()
