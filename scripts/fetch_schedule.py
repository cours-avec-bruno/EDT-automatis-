#!/usr/bin/env python3
"""
Fetche les Google Sheets d'inscription aux oraux,
recherche les créneaux de Bruno RICCI,
et sauvegarde data/oraux_ricci.json.

Appelé par le workflow GitHub Actions update-data.yml.
"""
import urllib.request
import csv
import json
import io
import unicodedata
import re
import os
from datetime import datetime, timezone

# ── Config ────────────────────────────────────────────────────────────────────

STUDENT = "Ricci"

SHEETS = [
    {
        "matiere": "Physique-Chimie",
        "url": "https://docs.google.com/spreadsheets/d/15cvkVWTclQPy8co2s73uO0KZm5J6lKjx3Z2dOKsPAOI/export?format=csv",
    },
    {
        "matiere": "Mathématiques",
        "url": "https://docs.google.com/spreadsheets/d/11DOsXVwuxY5KP0ip8NEYdFn04egmbvKYEJ77TjXEUmY/export?format=csv",
    },
]

DAYS = ["lundi", "mardi", "mercredi", "jeudi", "vendredi"]

MONTH_MAP = {
    "janvier": 1, "février": 2, "mars": 3, "avril": 4,
    "mai": 5, "juin": 6, "juillet": 7, "août": 8,
    "septembre": 9, "octobre": 10, "novembre": 11, "décembre": 12,
}

# ── Helpers ───────────────────────────────────────────────────────────────────

def norm(text: str) -> str:
    t = str(text).strip().lower()
    return "".join(c for c in unicodedata.normalize("NFD", t) if unicodedata.category(c) != "Mn")

def c(row, idx, default="") -> str:
    return str(row[idx]).strip() if idx < len(row) else default

def row_text(row) -> str:
    return " ".join(str(x).strip() for x in row if str(x).strip())

def extract_teacher(text: str) -> str:
    m = re.search(r"Inscription oral\s+(.+?)\s*[\(\-—]", text)
    if m: return m.group(1).strip()
    m = re.search(r"Inscription oral\s+(.+)", text)
    if m: return m.group(1).strip()
    return "Prof"

def clean_date(s: str) -> str:
    return re.sub(r'[^\w\sàâäéèêëïîôùûüçÀÂÄÉÈÊËÏÎÔÙÛÜÇ\-]', '', s).strip()

def is_date_row(row) -> bool:
    d = c(row, 1).lower()
    return any(day in d for day in DAYS) or bool(re.match(r'^\d{1,2}$', c(row, 1)))

def parse_date_to_iso(date_str: str) -> str:
    """Convert 'Mardi 19 mai' or '19 mai' to ISO date."""
    s = date_str.lower().strip()
    for day in DAYS:
        s = s.replace(day, "").strip()
    # e.g. "19 mai"
    parts = s.split()
    day_num = None
    month_num = None
    for p in parts:
        if p.isdigit():
            day_num = int(p)
        if p in MONTH_MAP:
            month_num = MONTH_MAP[p]
    if day_num and month_num:
        year = 2026
        return f"{year}-{month_num:02d}-{day_num:02d}"
    return ""

def parse_time_range(time_str: str):
    """Parse '13h30-14h00' → ('13:30', '14:00')"""
    m = re.match(r'(\d+)h(\d*)[–\-](\d+)h(\d*)', time_str)
    if m:
        h1, m1, h2, m2 = m.groups()
        return (f"{int(h1):02d}:{int(m1 or 0):02d}", f"{int(h2):02d}:{int(m2 or 0):02d}")
    return (None, None)

def fmt_date_label(iso: str) -> str:
    try:
        from datetime import date
        d = date.fromisoformat(iso)
        months = ['', 'jan', 'fév', 'mars', 'avr', 'mai', 'juin',
                  'juil', 'août', 'sep', 'oct', 'nov', 'déc']
        days_fr = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']
        return f"{days_fr[d.weekday()]} {d.day} {months[d.month]}"
    except:
        return iso

# ── Parsers ───────────────────────────────────────────────────────────────────

def parse_td(rows, prenom_n: str, matiere: str) -> list:
    results = []
    i = 0
    while i < len(rows):
        date_str = c(rows[i], 1)
        if any(m in date_str for m in MONTH_MAP):
            session_type = "🧑‍🏫 Passage TD" if "🧑" in date_str else "🔍 Recherche TD"
            date = clean_date(date_str)
            groups = [c(rows[i], j) for j in range(4, 8)]
            if i + 1 < len(rows):
                name_row = rows[i + 1]
                names = [c(name_row, j) for j in range(4, 8)]
                for idx, name in enumerate(names):
                    if name and "pas de presentation" not in norm(name) and prenom_n in norm(name):
                        iso = parse_date_to_iso(date)
                        results.append({
                            "matiere": matiere,
                            "type": session_type,
                            "date_label": fmt_date_label(iso) if iso else date,
                            "date_iso": iso,
                            "heure": "—",
                            "heure_start": None,
                            "heure_end": None,
                            "groupe": groups[idx] if idx < len(groups) else "—",
                            "salle": "—",
                            "professeur": "—",
                        })
        i += 1
    return results


def parse_oral(rows, teacher: str, prenom_n: str, matiere: str) -> list:
    results = []
    time_header = {}
    for row in rows:
        if c(row, 1).lower() == "jour":
            candidate = {j: c(row, j) for j in range(4, len(row))
                         if re.match(r'\d+h', c(row, j))}
            if candidate:
                time_header = candidate
            continue
        if not time_header or not is_date_row(row):
            continue
        day   = c(row, 1)
        month = c(row, 2)
        salle = c(row, 3) or "—"
        date  = clean_date(f"{day} {month}")
        iso   = parse_date_to_iso(date)
        for col, time in time_header.items():
            val = c(row, col)
            if val and prenom_n in norm(val):
                start, end = parse_time_range(time)
                results.append({
                    "matiere": matiere,
                    "type": "Oral",
                    "date_label": fmt_date_label(iso) if iso else date,
                    "date_iso": iso,
                    "heure": time,
                    "heure_start": start,
                    "heure_end": end,
                    "groupe": "—",
                    "salle": salle,
                    "professeur": teacher,
                })
    return results


def parse_tp(rows, prenom_n: str, matiere: str) -> list:
    if not rows:
        return []
    header = rows[0]
    student_col = None
    for j in range(10, len(header)):
        if c(header, j) and prenom_n in norm(c(header, j)):
            student_col = j
            break
    if student_col is None:
        return []
    results = []
    for row in rows[1:]:
        if not is_date_row(row):
            continue
        day = c(row, 1); month = c(row, 2)
        salle = c(row, 3) or "—"; horaire = c(row, 4) or "—"
        programme = c(row, 5) or "TP"
        date = clean_date(f"{day} {month}"); iso = parse_date_to_iso(date)
        start, end = parse_time_range(horaire)
        results.append({
            "matiere": matiere,
            "type": f"TP — {programme}",
            "date_label": fmt_date_label(iso) if iso else date,
            "date_iso": iso,
            "heure": horaire,
            "heure_start": start,
            "heure_end": end,
            "groupe": c(row, student_col) or "—",
            "salle": salle,
            "professeur": "—",
        })
    return results


def parse_generic(all_values, prenom_n: str, matiere: str) -> list:
    """Fallback: scan all cells for the student's name."""
    results = []
    for i, row in enumerate(all_values):
        for j, cell in enumerate(row):
            val = str(cell).strip()
            if not val or len(val) > 60:
                continue
            if prenom_n in norm(val):
                # Find date in nearby rows (search upward)
                date_str = ""
                for di in range(i, max(i-10, -1), -1):
                    r = all_values[di]
                    for dj in [1, 0, 2]:
                        cval = c(r, dj)
                        if any(m in cval for m in MONTH_MAP):
                            date_str = cval
                            break
                    if date_str:
                        break
                # Find time in column headers
                heure = ""
                for hi in range(i, max(i-10, -1), -1):
                    hv = c(all_values[hi], j)
                    if re.match(r'\d+h', hv):
                        heure = hv
                        break
                iso = parse_date_to_iso(date_str) if date_str else ""
                start, end = parse_time_range(heure) if heure else (None, None)
                results.append({
                    "matiere": matiere,
                    "type": "Oral/Colle",
                    "date_label": fmt_date_label(iso) if iso else (date_str or "—"),
                    "date_iso": iso,
                    "heure": heure or "—",
                    "heure_start": start,
                    "heure_end": end,
                    "groupe": "—",
                    "salle": "—",
                    "professeur": "—",
                })
    return results


def find_student(all_values, prenom: str, matiere: str) -> list:
    prenom_n = norm(prenom)
    boundaries = []
    for i, row in enumerate(all_values):
        rt = row_text(row)
        if "Inscription passage TD" in rt:
            boundaries.append(("td", "TD", i + 1))
        elif "Inscription oral" in rt and "Inscrits" not in rt:
            boundaries.append(("oral", extract_teacher(rt), i + 1))
        elif "Préparation à l'épreuve de TP" in rt:
            boundaries.append(("tp", "TP", i + 1))

    if not boundaries:
        # Unknown format: generic scan
        return parse_generic(all_values, prenom_n, matiere)

    results = []
    for idx, (stype, name, start) in enumerate(boundaries):
        end = boundaries[idx + 1][2] - 1 if idx + 1 < len(boundaries) else len(all_values)
        section = all_values[start:end]
        if stype == "td":
            results.extend(parse_td(section, prenom_n, matiere))
        elif stype == "oral":
            results.extend(parse_oral(section, name, prenom_n, matiere))
        elif stype == "tp":
            results.extend(parse_tp(section, prenom_n, matiere))
    return results


# ── HTTP fetch ────────────────────────────────────────────────────────────────

def fetch_csv(url: str) -> list:
    req = urllib.request.Request(
        url,
        headers={"User-Agent": "Mozilla/5.0 (compatible; EDT-Bot/1.0)"}
    )
    with urllib.request.urlopen(req, timeout=30) as resp:
        raw = resp.read()
    try:
        text = raw.decode("utf-8")
    except UnicodeDecodeError:
        text = raw.decode("latin-1")
    reader = csv.reader(io.StringIO(text))
    return list(reader)


# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    all_oraux = []
    errors = []

    for sheet in SHEETS:
        print(f"[→] Fetching: {sheet['matiere']} …")
        try:
            rows = fetch_csv(sheet["url"])
            found = find_student(rows, STUDENT, sheet["matiere"])
            print(f"    {len(found)} créneau(x) trouvé(s) pour {STUDENT}")
            all_oraux.extend(found)
        except Exception as e:
            print(f"    ⚠ Erreur: {e}")
            errors.append(str(e))

    # Sort by date then time
    all_oraux.sort(key=lambda o: (o.get("date_iso") or "9999", o.get("heure_start") or "99:99"))

    out = {
        "student": f"{STUDENT} Bruno",
        "updated_at": datetime.now(timezone.utc).strftime("%d/%m/%Y %H:%M UTC"),
        "oraux": all_oraux,
        "errors": errors,
    }

    os.makedirs("data", exist_ok=True)
    with open("data/oraux_ricci.json", "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, indent=2)

    print(f"[✓] data/oraux_ricci.json mis à jour ({len(all_oraux)} créneaux)")


if __name__ == "__main__":
    main()
