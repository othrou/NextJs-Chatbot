# 🏥 **Medicament-AICe** - Système Intelligent d'Information sur les Médicaments

<div align="center">

![Version](https://img.shields.io/badge/version-2.2.0-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![AI](https://img.shields.io/badge/AI-Vercel_SDK-green)
![License](https://img.shields.io/badge/license-MIT-lightgrey.svg)

**Une plateforme IA révolutionnaire pour l'information pharmaceutique**

[🚀 Démarrage Rapide](#-démarrage-rapide) • [📋 Fonctionnalités](#-fonctionnalités) • [🛠️ Architecture](#️-architecture) • [🎯 Use Cases](#-use-cases)

</div>

## 🌟 **Aperçu du Projet**

Medicament-AICe est un système expert intelligent conçu pour fournir des informations précises et actualisées sur les médicaments en Côte d'Ivoire. En combinant l'analyse de données structurées, la recherche documentaire et l'intelligence artificielle, la plateforme répond aux besoins des professionnels de santé et du grand public.

### **✨ Points Forts**

- 🔍 **Recherche Hybride** : Combinaison BM25 + Recherche Vectorielle
- 🌐 **Actualisation Temps Réel** : Intégration Tavily pour les données web
- 💊 **Spécialisé Côte d'Ivoire** : Données locales et réglementations
- 🤖 **Agent IA Intelligent** : Réponses contextuelles et précises

## 🛠️ **Stack Technique**

| Composant | Technologie | Usage |
|-----------|-------------|-------|
| **Framework** | ![Next.js](https://img.shields.io/badge/Next.js-14-black) | Application Full-Stack |
| **IA/ML** | ![Vercel AI SDK](https://img.shields.io/badge/Vercel_AI_SDK-Latest-green) | Orchestration IA |
| **Modèles** | ![Google Gemini](https://img.shields.io/badge/Google_Gemini-2.0_flash--lite-orange) | Modèle Principal |
| **Base de Données** | ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue) | Données Structurées |
| **Recherche** | ![pgvector](https://img.shields.io/badge/pgvector-0.7.0-green) | Embeddings & Similarité |
| **Recherche Texte** | ![BM25](https://img.shields.io/badge/BM25-LangChain-yellow) | Recherche Lexicale |
| **Recherche Web** | ![Tavily](https://img.shields.io/badge/Tavily-API-purple) | Données Actualisées |
| **ORM** | ![Drizzle](https://img.shields.io/badge/Drizzle_ORM-0.30-blue) | Gestion Base de Données |

## 🎯 **Use Cases Principaux**

### 📊 **1. Statistiques Base de Données**
```bash
"Combien de médicaments existe-t-il dans la base ?"
"Quelle est la répartition par laboratoire ?"
```

### 💊 **2. Recherche Médicaments Spécifiques**
```bash
"Liste les médicaments ayant le DCI 'Paracétamol'"
"Quels sont les médicaments autorisés pour le diabète ?"
"Statut d'autorisation de l'Amoxicilline en Côte d'Ivoire"
```

### 🔍 **3. Questions Générales & Documentation**
```bash
"Interactions médicamenteuses du Paracétamol"
"Posologie recommandée pour un adulte"
"Contre-indications des AINS"
```

## 🏗️ **Architecture du Système**

```mermaid
graph TB
    A[Utilisateur] --> B[API Next.js]
    B --> C[Agent IA Vercel]
    C --> D[Base PostgreSQL]
    C --> E[Recherche Vectorielle]
    C --> F[BM25 Search]
    C --> G[Tavily Web Search]
    D --> H[Données Structurées Excel]
    E --> I[Documents PDF]
    F --> I
    G --> J[Sources Web Fiables]
    
    style A fill:#e1f5fe
    style C fill:#f3e5f5
    style D fill:#e8f5e8
    style E fill:#fff3e0
    style F fill:#fff3e0
    style G fill:#fff3e0
```

Note : Une intégration future du BM25

## 🚀 **Démarrage Rapide**

### **Prérequis**

- Node.js 
- PostgreSQL
- Compte [Tavily](https://tavily.com/) pour la recherche web et Gemini API

### **📥 Installation**

```bash
# Cloner le repository
git clone https://github.com/your-org/medicament-aice.git
cd medicament-aice

# Installer les dépendances
npm install

# Configuration environnement
cp .env.example .env
```

### **⚙️ Configuration Environnement**

```env
# Database
DATABASE_URL="postgres://user:password@localhost:5432/medicament_aice"

# AI Providers
GOOGLE_API_KEY="your-google-api-key"
TAVILY_API_KEY="your-tavily-api-key"
```

### **🗄️ Configuration Base de Données**

```sql
-- Activer les extensions nécessaires
CREATE EXTENSION IF NOT EXISTS unaccent;
CREATE EXTENSION IF NOT EXISTS vector;
```

```bash
# Générer et exécuter les migrations
npm run db:generate
npm run db:migrate
```

### **📊 Import des Données**

```bash
# Placer le fichier Excel à la racine
cp /chemin/vers/medicaments_ci.xlsx .

# Installer le processeur Excel
npm install -D xlsx

# Importer les données
npx tsx scripts/import-excel.ts
```

### **🎮 Lancement**

```bash
# Mode développement
npm run dev

# Vérifier le statut de l'API
curl http://localhost:3000/api/chat
```

**Réponse attendue :**
```json
{
  "message": "Ton API pour RAG est healthy"
}
```

## 📁 **Structure du Projet**

```
medicament-aice/
├── 📁 app/
│   └── 📁 api/chat/
│       └── route.ts              # Route principale de l'agent IA
├── 📁 lib/
│   ├── 📁 ai/
│   │   └── 📁 tools/
│   │       ├── sql-tool.ts       # Requêtes base de données
│   │       ├── vector-search-tool.ts # Recherche vectorielle
│   │       └── web-search-tool.ts    # Recherche web Tavily
│   └── 📁 db/
│       └── 📁 schema/
│           └── medicaments.ts    # Schéma base de données
├── 📁 scripts/
│   ├── import-excel.ts           # Import données Excel
│   └── process-pdfs.ts           # Traitement documents PDF
├── 📁 data/
│   ├── medicaments_ci.xlsx       # Base données médicaments
│   └── 📁 documents/             # Documentation de référence
└── 📄 .env.example               # Variables d'environnement
```

## 🔧 **Intégrations Avancées**


### **🌐 Recherche Web avec Tavily**

```typescript
import { TavilySearchResults } from "@langchain/community/tools/tavily_search";

const tavilyTool = new TavilySearchResults({
  apiKey: process.env.TAVILY_API_KEY,
  maxResults: 5,
  searchDepth: "advanced",
  includeAnswer: true,
});
```

## 📊 **Phases de Développement**

### **✅ Phase 1 : Données Structurées (COMPLÉTÉE)**
- [x] Schéma base de données
- [x] Script import Excel
- [x] Migrations PostgreSQL

### **🔄 Phase 2 : Données Non Structurées**
- [ ] Intégration pgvector
- [ ] Traitement documents PDF
- [ ] Génération embeddings

### **⏳ Phase 3 : Outils IA**
- [ ] Outil requêtes SQL intelligent
- [ ] Recherche vectorielle hybride
- [ ] Intégration recherche web

### **⏳ Phase 4 : Orchestration**
- [ ] Agent IA multi-outils
- [ ] Prompt engineering avancé
- [ ] Tests end-to-end


<div align="center">

**Développé par othman K**

[Documentation Technique](#) • [API Reference](#) • [Changelog](#)

</div>
