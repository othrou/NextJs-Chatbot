import { createResource } from '@/lib/actions/resources';
import fs from 'fs/promises';
import path from 'path';
import pdf from 'pdf-parse';
import 'dotenv/config';

console.log("Lancement du script d'importation et de vectorisation des PDF...");

// --- Configuration ---
// Dossier où les documents PDF sont stockés.
const PDF_DIRECTORY = path.join(process.cwd(), 'data/books');

// --- Fonction pour lire les fichiers PDF d'un dossier ---
async function getPdfFiles(directory: string): Promise<string[]> {
  try {
    const items = await fs.readdir(directory);
    const pdfFiles = items.filter(file => path.extname(file).toLowerCase() === '.pdf');
    return pdfFiles.map(file => path.join(directory, file));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      console.warn(`Le dossier "${directory}" n'existe pas. Veuillez le créer et y ajouter vos fichiers PDF.`);
      return [];
    }
    throw error;
  }
}

// --- Fonction Principale ---
async function importAndEmbedPdfs() {
  try {
    // 1. Récupérer la liste des fichiers PDF
    console.log(`Recherche de fichiers PDF dans le dossier : ${PDF_DIRECTORY}`);
    const pdfPaths = await getPdfFiles(PDF_DIRECTORY);

    if (pdfPaths.length === 0) {
      console.log("Aucun fichier PDF trouvé. Le script est terminé.");
      return;
    }

    console.log(`${pdfPaths.length} fichier(s) PDF trouvé(s) à traiter.`);

    // 2. Traiter chaque fichier PDF
    for (const filePath of pdfPaths) {
      console.log(`\n--- Traitement du fichier : ${path.basename(filePath)} ---`);

      // 2a. Lecture et extraction du texte du PDF
      console.log("Extraction du texte...");
      const dataBuffer = await fs.readFile(filePath);
      const data = await pdf(dataBuffer);
      const pdfText = data.text;
      
      if (!pdfText.trim()) {
        console.warn("Le fichier PDF semble vide ou le texte n'a pas pu être extrait. Fichier ignoré.");
        continue;
      }

      console.log(`Texte extrait (${pdfText.length} caractères).`);

      // 2b. Création de la ressource et des embeddings
      // Nous réutilisons la fonction `createResource` qui existe déjà.
      // Elle s'occupe de tout : découpage, appel à l'API Gemini, et stockage dans la BDD.
      console.log("Génération des embeddings et stockage dans la base de données...");
      const result = await createResource({ content: pdfText });
      console.log(`Résultat pour ${path.basename(filePath)}: ${result}`);
    }

    console.log("\n✅ Tous les fichiers PDF ont été traités avec succès !");

  } catch (error) {
    console.error("\n❌ Une erreur est survenue lors du traitement des PDF :", error);
  } finally {
      // Pour ce script, nous n'avons pas de connexion à fermer manuellement,
      // car `createResource` gère sa propre connexion via Drizzle.
      console.log("Script terminé.");
  }
}

// --- Exécution ---
importAndEmbedPdfs();
