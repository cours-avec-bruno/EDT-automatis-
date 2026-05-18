# EDT Automatisé — Préparation aux Oraux

Application web Streamlit qui lit vos Google Sheets d'inscriptions aux oraux et affiche l'emploi du temps personnalisé de chaque étudiant.

## Fonctionnement

1. Le professeur crée un Google Sheet par matière/épreuve
2. Les étudiants s'inscrivent sur les créneaux (en écrivant leur prénom dans la colonne "Étudiant")
3. L'étudiant ouvre l'application, tape son prénom → son EDT complet s'affiche en temps réel

---

## Format des Google Sheets

Chaque feuille doit contenir **une ligne par créneau** avec au minimum une colonne prénom :

| Date       | Heure | Salle | Groupe | Examinateur | Étudiant |
|------------|-------|-------|--------|-------------|----------|
| 02/06/2026 | 09:00 | A201  | 1A     | M. Dupont   | Marie    |
| 02/06/2026 | 09:30 | A201  | 1A     | M. Dupont   |          |
| 02/06/2026 | 10:00 | A202  | 1B     | Mme Martin  | Lucas    |

> Les noms de colonnes sont **configurables** dans `config.json` (voir ci-dessous).

---

## Installation

### 1. Cloner le projet

```bash
git clone <url-du-repo>
cd EDT-automatis-
pip install -r requirements.txt
```

### 2. Créer un compte de service Google

1. Allez sur [console.cloud.google.com](https://console.cloud.google.com)
2. Créez un nouveau projet (ou utilisez un existant)
3. Activez l'API **Google Sheets** et l'API **Google Drive**
4. Allez dans **IAM et administration > Comptes de service**
5. Créez un compte de service → générez une clé JSON
6. Téléchargez le fichier JSON et renommez-le `credentials.json` à la racine du projet

### 3. Partager vos Google Sheets

Pour chaque Google Sheet d'inscriptions :
- Cliquez sur **Partager**
- Ajoutez l'adresse email du compte de service (ex: `edt-app@mon-projet.iam.gserviceaccount.com`)
- Donnez l'accès en **Lecteur**

### 4. Configurer les feuilles

Copiez l'exemple et adaptez-le :

```bash
cp config.example.json config.json
```

Éditez `config.json` :

```json
{
  "sheets": [
    {
      "matiere": "Mathématiques",
      "url": "https://docs.google.com/spreadsheets/d/VOTRE_ID/edit",
      "onglet": "Feuille1",
      "colonne_etudiant": "Étudiant",
      "colonne_date": "Date",
      "colonne_heure": "Heure",
      "colonne_salle": "Salle",
      "colonne_groupe": "Groupe",
      "colonne_examinateur": "Examinateur"
    }
  ]
}
```

> **Note** : Si vos colonnes ont des noms différents (ex: "Nom élève" au lieu de "Étudiant"), changez la valeur dans `config.json`.

### 5. Lancer l'application

```bash
streamlit run app.py
```

L'application s'ouvre sur [http://localhost:8501](http://localhost:8501)

---

## Déploiement en ligne (Streamlit Cloud)

Pour que tous les étudiants y accèdent sans rien installer :

1. Poussez le projet sur GitHub (sans `credentials.json` ni `config.json` — ils sont dans `.gitignore`)
2. Allez sur [share.streamlit.io](https://share.streamlit.io)
3. Connectez votre repo GitHub
4. Dans **Advanced settings > Secrets**, ajoutez :

```toml
[gcp_service_account]
type = "service_account"
project_id = "votre-projet"
private_key_id = "..."
private_key = "-----BEGIN RSA PRIVATE KEY-----\n..."
client_email = "edt-app@votre-projet.iam.gserviceaccount.com"
client_id = "..."
# ... (copiez le contenu de credentials.json ici)
```

Et dans un second secret :

```toml
# Vous pouvez aussi mettre config.json dans les secrets Streamlit
# ou le committer directement (il ne contient pas de données sensibles)
```

---

## Utilisation

1. Ouvrez l'application dans votre navigateur
2. Tapez votre **prénom** dans le champ de recherche
3. Votre EDT s'affiche par matière
4. Cliquez sur **🔄 Actualiser** pour recharger les feuilles en temps réel
5. Téléchargez votre EDT en CSV si besoin

> La recherche est **insensible à la casse et aux accents** : "marie", "Marie" et "MARIE" donnent le même résultat.

---

## Structure du projet

```
EDT-automatis-/
├── app.py                # Application Streamlit principale
├── config.json           # Votre configuration (non versionné)
├── config.example.json   # Exemple de configuration
├── credentials.json      # Clé Google API (non versionné, JAMAIS committer)
├── requirements.txt      # Dépendances Python
└── .gitignore
```
