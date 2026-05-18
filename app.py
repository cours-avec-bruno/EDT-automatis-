import streamlit as st
import gspread
from google.oauth2.service_account import Credentials
import pandas as pd
import json
import os
from datetime import datetime

st.set_page_config(
    page_title="Mon EDT - Préparation aux Oraux",
    page_icon="📅",
    layout="wide",
)

SCOPES = ["https://www.googleapis.com/auth/spreadsheets.readonly"]


@st.cache_resource(show_spinner=False)
def get_gspread_client():
    if os.path.exists("credentials.json"):
        creds = Credentials.from_service_account_file("credentials.json", scopes=SCOPES)
    else:
        # Pour Streamlit Cloud : stocker les creds dans st.secrets
        creds = Credentials.from_service_account_info(
            st.secrets["gcp_service_account"], scopes=SCOPES
        )
    return gspread.authorize(creds)


@st.cache_data(ttl=60, show_spinner=False)
def load_config():
    if os.path.exists("config.json"):
        with open("config.json", encoding="utf-8") as f:
            return json.load(f)
    return {"sheets": []}


def normalize(text: str) -> str:
    """Minuscules + suppression accents pour comparaison souple."""
    import unicodedata
    text = text.strip().lower()
    return "".join(
        c for c in unicodedata.normalize("NFD", text)
        if unicodedata.category(c) != "Mn"
    )


def find_student_slots(gc, prenom: str, config: dict) -> pd.DataFrame:
    """Parcourt tous les Google Sheets et retourne les créneaux de l'étudiant."""
    prenom_norm = normalize(prenom)
    rows = []

    for sheet_conf in config.get("sheets", []):
        subject = sheet_conf.get("matiere", "?")
        url = sheet_conf.get("url", "")
        col_etudiant = sheet_conf.get("colonne_etudiant", "Étudiant")
        col_date = sheet_conf.get("colonne_date", "Date")
        col_heure = sheet_conf.get("colonne_heure", "Heure")
        col_salle = sheet_conf.get("colonne_salle", "Salle")
        col_groupe = sheet_conf.get("colonne_groupe", "Groupe")
        col_examinateur = sheet_conf.get("colonne_examinateur", "Examinateur")

        try:
            sh = gc.open_by_url(url)
            onglet = sheet_conf.get("onglet", None)
            ws = sh.worksheet(onglet) if onglet else sh.sheet1
            records = ws.get_all_records()
            df = pd.DataFrame(records)

            if df.empty or col_etudiant not in df.columns:
                continue

            # Recherche souple : prénom contenu dans la cellule
            mask = df[col_etudiant].astype(str).apply(
                lambda v: prenom_norm in normalize(v)
            )
            matched = df[mask].copy()

            for _, row in matched.iterrows():
                rows.append({
                    "Matière": subject,
                    "Date": row.get(col_date, ""),
                    "Heure": row.get(col_heure, ""),
                    "Salle": row.get(col_salle, ""),
                    "Groupe": row.get(col_groupe, ""),
                    "Examinateur": row.get(col_examinateur, ""),
                })
        except Exception as e:
            st.warning(f"Impossible de lire le sheet « {subject} » : {e}")

    result = pd.DataFrame(rows)
    if not result.empty:
        # Tri par date puis heure
        result["_sort"] = pd.to_datetime(
            result["Date"].astype(str) + " " + result["Heure"].astype(str),
            dayfirst=True,
            errors="coerce",
        )
        result = result.sort_values("_sort").drop(columns=["_sort"])
        result = result.reset_index(drop=True)
    return result


# ── UI ───────────────────────────────────────────────────────────────────────

st.title("📅 Mon Emploi du Temps — Préparation aux Oraux")
st.caption("Entrez votre prénom pour afficher vos créneaux inscrits sur les feuilles Excel.")

col_input, col_refresh = st.columns([4, 1])
with col_input:
    prenom = st.text_input("Votre prénom :", placeholder="Ex : Marie")
with col_refresh:
    st.write("")
    refresh = st.button("🔄 Actualiser", help="Recharge les feuilles en temps réel")

if refresh:
    st.cache_data.clear()

config = load_config()

if not config.get("sheets"):
    st.error(
        "Aucune feuille configurée. Créez un fichier **config.json** "
        "(voir `config.example.json`) et redémarrez l'application."
    )
    st.stop()

if prenom:
    with st.spinner(f"Recherche des créneaux pour **{prenom}**…"):
        try:
            gc = get_gspread_client()
            edt = find_student_slots(gc, prenom, config)
        except Exception as e:
            st.error(f"Erreur de connexion Google Sheets : {e}")
            st.stop()

    if edt.empty:
        st.info(
            f"Aucun créneau trouvé pour **{prenom}**. "
            "Vérifiez l'orthographe ou inscrivez-vous sur les feuilles."
        )
    else:
        st.success(f"**{len(edt)} créneau(x)** trouvé(s) pour **{prenom}** :")

        # Affichage par matière
        for matiere in edt["Matière"].unique():
            sub = edt[edt["Matière"] == matiere].drop(columns=["Matière"])
            with st.expander(f"📚 {matiere}", expanded=True):
                st.dataframe(sub, use_container_width=True, hide_index=True)

        st.divider()
        st.subheader("Vue complète")
        st.dataframe(edt, use_container_width=True, hide_index=True)

        # Export CSV
        csv = edt.to_csv(index=False).encode("utf-8-sig")
        st.download_button(
            "⬇️ Télécharger mon EDT (CSV)",
            data=csv,
            file_name=f"EDT_{prenom}_{datetime.today().strftime('%Y%m%d')}.csv",
            mime="text/csv",
        )
else:
    st.info("Entrez votre prénom ci-dessus pour afficher votre emploi du temps.")

    # Aperçu des matières disponibles
    if config.get("sheets"):
        st.subheader("Matières / épreuves disponibles")
        for s in config["sheets"]:
            st.write(f"• **{s.get('matiere', '?')}**")
