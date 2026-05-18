import streamlit as st
import gspread
from google.oauth2.service_account import Credentials
import json, os, re, unicodedata
import pandas as pd
from datetime import datetime

# ── Auth ──────────────────────────────────────────────────────────────────────

SCOPES = ["https://www.googleapis.com/auth/spreadsheets.readonly"]

@st.cache_resource(show_spinner=False)
def get_gc():
    if os.path.exists("credentials.json"):
        creds = Credentials.from_service_account_file("credentials.json", scopes=SCOPES)
    else:
        creds = Credentials.from_service_account_info(
            st.secrets["gcp_service_account"], scopes=SCOPES
        )
    return gspread.authorize(creds)


# ── Helpers ───────────────────────────────────────────────────────────────────

def norm(text: str) -> str:
    """Lowercase + remove accents for fuzzy comparison."""
    t = str(text).strip().lower()
    return "".join(c for c in unicodedata.normalize("NFD", t)
                   if unicodedata.category(c) != "Mn")

def c(row: list, idx: int, default: str = "") -> str:
    return str(row[idx]).strip() if idx < len(row) else default

def row_text(row: list) -> str:
    return " ".join(str(x).strip() for x in row if str(x).strip())

def extract_teacher(text: str) -> str:
    m = re.search(r"Inscription oral\s+(.+?)\s*[\(\-—]", text)
    if m: return m.group(1).strip()
    m = re.search(r"Inscription oral\s+(.+)", text)
    if m: return m.group(1).strip()
    return "Prof"

def clean_date(s: str) -> str:
    """Remove emoji and non-printable characters, keep French letters."""
    return re.sub(r'[^\w\sàâäéèêëïîôùûüçÀÂÄÉÈÊËÏÎÔÙÛÜÇ\-]', '', s).strip()

DAYS = ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"]

def is_date_row(row: list) -> bool:
    d = c(row, 1).lower()
    return any(day in d for day in DAYS) or re.match(r'^\d{1,2}$', c(row, 1)) is not None


# ── Section parsers ───────────────────────────────────────────────────────────

def parse_td(rows: list, prenom_n: str) -> list:
    """
    TD section: rows come in pairs.
    Row A: col1 = "Lundi 18 mai 🧑‍🏫", col4-7 = group codes (M2, EL8, ...)
    Row B: col4-7 = student names matching the groups above
    """
    results = []
    i = 0
    while i < len(rows):
        date_str = c(rows[i], 1)
        if ("mai" in date_str or "juin" in date_str) and date_str:
            session_type = "🧑‍🏫 Passage" if "🧑" in date_str else "🔍 Recherche"
            date = clean_date(date_str)
            groups = [c(rows[i], j) for j in range(4, 8)]

            if i + 1 < len(rows):
                name_row = rows[i + 1]
                names = [c(name_row, j) for j in range(4, 8)]
                for idx, name in enumerate(names):
                    if name and "pas de presentation" not in norm(name) and prenom_n in norm(name):
                        results.append({
                            "Type": "📚 TD",
                            "Activité": session_type,
                            "Date": date,
                            "Heure": "—",
                            "Groupe": groups[idx] if idx < len(groups) else "—",
                            "Salle": "—",
                            "Professeur": "—",
                        })
        i += 1
    return results


def parse_oral(rows: list, teacher: str, prenom_n: str) -> list:
    """
    Oral section: grid layout.
    Header row: col1="Jour", col2=empty, col3="Salle", col4+= time slots
    Data rows:  col1=day,    col2=month, col3=salle,   col4+= student names
    """
    results = []
    time_header: dict[int, str] = {}

    for row in rows:
        # Detect time-slot header row
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

        for col, time in time_header.items():
            val = c(row, col)
            if val and prenom_n in norm(val):
                results.append({
                    "Type": "🎤 Oral",
                    "Activité": "Oral",
                    "Date": date,
                    "Heure": time,
                    "Groupe": "—",
                    "Salle": salle,
                    "Professeur": teacher,
                })
    return results


def parse_tp(rows: list, prenom_n: str) -> list:
    """
    TP section.
    rows[0] = column headers: Jour | Salle | Horaire | Programme | ... | StudentName | ...
    If student name found in col 10+, they attend all listed TP sessions.
    Subsequent data rows: each session listed with programme.
    """
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
        day        = c(row, 1)
        month      = c(row, 2)
        salle      = c(row, 3) or "—"
        horaire    = c(row, 4) or "—"
        programme  = c(row, 5) or "TP"
        assignment = c(row, student_col) or "—"

        results.append({
            "Type": "🔬 TP",
            "Activité": programme,
            "Date": clean_date(f"{day} {month}"),
            "Heure": horaire,
            "Groupe": assignment,
            "Salle": salle,
            "Professeur": "—",
        })
    return results


# ── Sheet parser ──────────────────────────────────────────────────────────────

def find_student_in_sheet(all_values: list, prenom: str) -> list:
    """
    Detect and parse all sections in the sheet:
      - "Inscription passage TD"   → pairs of date/group + name rows
      - "Inscription oral X"       → teacher grid (date × time slot)
      - "Préparation à l'épreuve de TP" → fixed schedule, column per student
    """
    prenom_n = norm(prenom)

    # Locate section boundaries
    boundaries: list[tuple[str, str, int]] = []
    for i, row in enumerate(all_values):
        rt = row_text(row)
        if "Inscription passage TD" in rt:
            boundaries.append(("td", "TD", i + 1))
        elif "Inscription oral" in rt and "Inscrits" not in rt:
            boundaries.append(("oral", extract_teacher(rt), i + 1))
        elif "Préparation à l'épreuve de TP" in rt:
            boundaries.append(("tp", "TP", i + 1))

    results = []
    for idx, (stype, name, start) in enumerate(boundaries):
        end = boundaries[idx + 1][2] - 1 if idx + 1 < len(boundaries) else len(all_values)
        section = all_values[start:end]

        if stype == "td":
            results.extend(parse_td(section, prenom_n))
        elif stype == "oral":
            results.extend(parse_oral(section, name, prenom_n))
        elif stype == "tp":
            results.extend(parse_tp(section, prenom_n))

    return results


# ── Data fetching (cached) ────────────────────────────────────────────────────

@st.cache_data(ttl=60, show_spinner=False)
def fetch_sheet(_gc, url: str, onglet: str | None) -> list:
    sh = _gc.open_by_url(url)
    ws = sh.worksheet(onglet) if onglet else sh.sheet1
    return ws.get_all_values()

@st.cache_data(ttl=0, show_spinner=False)
def load_config() -> dict:
    if os.path.exists("config.json"):
        with open("config.json", encoding="utf-8") as f:
            return json.load(f)
    return {"sheets": []}


# ── UI ────────────────────────────────────────────────────────────────────────

st.set_page_config(
    page_title="Mon EDT — Préparation aux Oraux",
    page_icon="📅",
    layout="wide",
)

st.title("📅 Mon Emploi du Temps — Préparation aux Oraux")
st.caption(
    "Entrez votre prénom pour voir tous vos créneaux inscrits sur les Google Sheets. "
    "L'affichage se met à jour automatiquement toutes les 60 s."
)

col_input, col_btn = st.columns([4, 1])
with col_input:
    prenom = st.text_input("Votre prénom :", placeholder="Ex : Marie")
with col_btn:
    st.write("")
    if st.button("🔄 Actualiser"):
        fetch_sheet.clear()
        st.rerun()

config = load_config()

if not config.get("sheets"):
    st.error(
        "Aucun Google Sheet configuré. "
        "Copiez `config.example.json` → `config.json` et renseignez vos URLs."
    )
    st.stop()

if prenom:
    all_slots: list[dict] = []

    with st.spinner(f"Recherche pour **{prenom}**…"):
        try:
            gc = get_gc()
        except Exception as e:
            st.error(f"Erreur d'authentification Google : {e}")
            st.stop()

        for sheet_conf in config["sheets"]:
            matiere = sheet_conf.get("matiere", "?")
            url     = sheet_conf.get("url", "")
            onglet  = sheet_conf.get("onglet") or None
            try:
                raw = fetch_sheet(gc, url, onglet)
                slots = find_student_in_sheet(raw, prenom)
                for s in slots:
                    s["Matière"] = matiere
                all_slots.extend(slots)
            except Exception as e:
                st.warning(f"Impossible de lire « {matiere} » : {e}")

    if not all_slots:
        st.info(
            f"Aucun créneau trouvé pour **{prenom}**. "
            "Vérifiez l'orthographe ou inscrivez-vous sur les Google Sheets."
        )
    else:
        st.success(f"**{len(all_slots)} créneau(x)** trouvé(s) pour **{prenom}**")

        df = pd.DataFrame(all_slots)
        col_order = ["Matière", "Type", "Activité", "Date", "Heure", "Salle", "Groupe", "Professeur"]
        df = df[[col for col in col_order if col in df.columns]]

        for mat in df["Matière"].unique():
            sub = df[df["Matière"] == mat].drop(columns=["Matière"])
            with st.expander(f"📚 {mat}  —  {len(sub)} créneau(x)", expanded=True):
                st.dataframe(sub, use_container_width=True, hide_index=True)

        st.divider()
        st.subheader("Vue complète")
        st.dataframe(df, use_container_width=True, hide_index=True)

        csv = df.to_csv(index=False).encode("utf-8-sig")
        st.download_button(
            "⬇️ Télécharger mon EDT (CSV)",
            data=csv,
            file_name=f"EDT_{prenom}_{datetime.today().strftime('%Y%m%d')}.csv",
            mime="text/csv",
        )

else:
    st.info("Entrez votre prénom ci-dessus pour afficher votre emploi du temps.")
    st.subheader("Feuilles configurées")
    for s in config.get("sheets", []):
        st.write(f"• **{s.get('matiere', '?')}**")
