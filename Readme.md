add :

- BM25 search : https://js.langchain.com/docs/integrations/retrievers/bm25/

### **Projet Medicament-AICe**

Le projet vise à créer un système de questions-réponses intelligent sur les médicaments, basé sur des données structurées (Excel), non structurées (PDF) et des sources web fiables.

### **Stack Technique**

- **Framework** : Next.js
- **IA** : Vercel AI SDK, OpenAI GPT-4
- **Base de données** : PostgreSQL avec l'extension pgvector
- **ORM** : Drizzle ORM
- **Déploiement** : Vercel

---

### Use cases :

- **1-statistiques sur la base de données**: combien de médicament existe dans la base de données ?
- **2-questions sur un médicament, un dci,... statut d'autorisation, spécifique au cote d'ivoire** : "Liste les médicaments ayant le DCI 'Paracétamol' -**3-question d'ordre général**: grace à notre agent qui fait des recherches dans une documentation pharmaceutique bien précise et qui a accès au site web bien reconnue..

### **Étapes du Projet**

#### **Phase 1 : Fondation des Données Structurées (Excel → Postgres)**

- [x] **Définir le schéma de la table `medicaments`** dans `lib/db/schema/medicaments.ts`.
- [x] **Créer le script d'importation** dans `scripts/import-excel.ts`.
- **Ajouter l'extension vector a postgres avec la commande :** `CREATE EXTENSION IF NOT EXISTS vector;`
- [ ] **Exécuter la migration de la base de données**.
- [ ] **Exécuter le script d'importation**.

#### **Phase 2 : Fondation des Données Non Structurées (PDF → Vecteurs)**

- [ ] **Mettre en place `pgvector`**.
- [ ] **Créer le script de traitement et d'importation des PDF**.

#### **Phase 3 : Création des Outils pour l'IA**

- [ ] **Développer l'outil de requête SQL**.
- [ ] **Développer l'outil de recherche vectorielle**.
- [ ] **Développer l'outil de recherche web**.

#### **Phase 4 : Orchestration et API**

- [ ] **Mettre à jour la route `/api/chat/route.ts`**.
- [ ] **Affiner le "System Prompt" de l'IA**.
- [ ] **Tester l'API de bout en bout**.

---

### **Comment lancer le projet**

#### **Installation des dépendances**

1. Installe toutes les dépendances avec la commande suivante :

   ```bash
   npm install
   ```

#### **Configuration de l'environnement**

1. Copie `.env.example` vers `.env` et remplis les variables suivantes :

   - `DATABASE_URL="postgres://USER:PASSWORD@HOST:PORT/DATABASE"`
   - `OPENAI_API_KEY="sk-..."`

#### **Migration de la base de données**

1. ajouter les extensions vectors pour traiter les embeddings et unaccent pour enlever la sensibilié à la casse :

`CREATE EXTENSION IF NOT EXISTS unaccent;`
`CREATE EXTENSION IF NOT EXISTS vector;`

2.  Cette commande va créer les tables dans ta base de données en se basant sur les schémas définis dans `lib/db/schema/` :

```bash
npm run db:generate
npm run db:migrate
```

#### **Importer les données initiales**

1. Place ton fichier Excel sous le nom `medicaments_ci.xlsx` à la racine du projet.
2. Installe le package `xlsx` pour gérer l'import :

   ```bash
   npm install -D xlsx
   ```

3. Lance le script d'importation des données avec :

   ```bash
   npx tsx scripts/import-excel.ts
   ```

#### **Lancer le serveur de développement**

1. Enfin, pour démarrer ton projet en mode développement :

   ```bash
   npm run dev
   ```

---

The API should now be running on [http://localhost:3000](http://localhost:3000).

Check dans un premier lieu le API qui indique le bon fonctionnement de l'application :

envoie avec un GET : http://localhost:3000/api/chat --> tu vas recevoir une réponse :

{
"message": "Ton API pour RAG est healthy"
}

### Informations sur le projet

#### dossier : data

il contient tous les données de notre projet, y compris la base de données ivoirienne (medicaments_ci.xlsx), aussi les documents de référence que nous allons utiliser dans notre système du RAG.
