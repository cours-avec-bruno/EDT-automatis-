# EDT Automatisé — Préparation aux Oraux

Application web **Streamlit** qui lit vos Google Sheets et affiche l'emploi du temps personnalisé de chaque étudiant dès qu'il tape son prénom.

---

## Fonctionnement

1. Le professeur crée un Google Sheet par matière (Physique-Chimie, Maths…)
2. Les étudiants s'inscrivent dans les cellules correspondantes
3. L'étudiant ouvre l'application, tape son prénom → son EDT s'affiche immédiatement
4. Cliquer sur **🔄 Actualiser** pour voir les nouvelles inscriptions (sinon mise à jour auto toutes les 60 s)

---

## Format des Google Sheets reconnu automatiquement

L'application reconnaît **3 types de sections** dans un même fichier :

### Section TD
```
Inscription passage TD …
Lundi 18 mai 🧑‍🏫   [vide]   [vide]   M2      EL8      T29      O1
[vide]               [vide]   [vide]   Faure   Gerbaud  Martin   Dupont
Vendredi 22 mai 🔍  [vide]   [vide]   T14     T15      O6       O15
[vide]               [vide]   [vide]   [vide]  Ricci    [vide]   [vide]
```
- Lignes par paires : **date + codes groupe** / **prénoms des inscrits**
- 🧑‍🏫 = séance de passage,  🔍 = séance de recherche

### Section Oral (un examinateur par section)
```
Inscription oral M. Louvet (physique-chimie)  Arriver 30 min avant…
Jour  [vide]  Salle  8h00-8h30  8h30-9h00  9h00-9h30  …
Mardi  19 mai  [salle]  [vide]  [vide]  Ricci  [vide]  …
```
- La ligne `Jour` définit les créneaux horaires (colonnes)
- Chaque ligne de date : écrire le prénom dans la colonne du créneau voulu

### Section TP
```
Préparation à l'épreuve de TP          …  Inscrits aux TP
Jour  [vide]  Salle  Horaire  Programme  …  À amener  …  Ricci
Mardi  19 mai  207   9h-12h   Présentation TP  …  TP EL9…
Mardi  26 mai  208   9h-12h   TP tournants   …  …
```
- Écrire le prénom comme **en-tête de colonne** = l'étudiant est inscrit à toutes les séances

---

## Installation locale

### 1. Cloner et installer les dépendances
```bash
git clone <url-du-repo>
cd EDT-automatis-
pip install -r requirements.txt
```

### 2. Créer un compte de service Google API

1. [console.cloud.google.com](https://console.cloud.google.com) → Nouveau projet
2. Activer **Google Sheets API** + **Google Drive API**
3. IAM → Comptes de service → Créer → Générer une clé JSON
4. Renommer le fichier téléchargé en **`credentials.json`** et le placer à la racine

### 3. Partager chaque Google Sheet avec le compte de service

Sur chaque Sheet → **Partager** → ajouter l'email du compte de service (ex: `edt-app@mon-projet.iam.gserviceaccount.com`) avec accès **Lecteur**.

### 4. Configurer les feuilles

```bash
cp config.example.json config.json
```

Éditez `config.json` :
```json
{
  "sheets": [
    {
      "matiere": "Physique-Chimie",
      "url": "https://docs.google.com/spreadsheets/d/VOTRE_ID/edit",
      "onglet": null
    }
  ]
}
```
> `"onglet": null` → utilise le premier onglet. Mettez `"Feuille2"` pour un onglet spécifique.

### 5. Lancer
```bash
streamlit run app.py
```
→ [http://localhost:8501](http://localhost:8501)

---

## Déploiement en ligne (Streamlit Cloud — gratuit)

Pour que tout le monde y accède sans rien installer :

1. Poussez le repo sur GitHub (sans `credentials.json` ni `config.json` — ils sont dans `.gitignore`)
2. [share.streamlit.io](https://share.streamlit.io) → connectez le repo
3. Dans **Settings > Secrets**, collez le contenu de `credentials.json` :

```toml
[gcp_service_account]
type = "service_account"
project_id = "votre-projet"
private_key_id = "abc123"
private_key = "-----BEGIN RSA PRIVATE KEY-----\n...\n-----END RSA PRIVATE KEY-----\n"
client_email = "edt-app@votre-projet.iam.gserviceaccount.com"
client_id = "..."
auth_uri = "https://accounts.google.com/o/oauth2/auth"
token_uri = "https://oauth2.googleapis.com/token"
```

4. Ajoutez aussi un secret `config` avec le contenu de votre `config.json`, **ou** commitez directement `config.json` (il ne contient pas de données sensibles).

---

## Structure du projet

```
EDT-automatis-/
├── app.py                # Application Streamlit
├── config.json           # Vos URLs de sheets (non versionné)
├── config.example.json   # Exemple de configuration
├── credentials.json      # Clé Google API (JAMAIS committer)
├── requirements.txt      # Dépendances Python
└── .gitignore
```
