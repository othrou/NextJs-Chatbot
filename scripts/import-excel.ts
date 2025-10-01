import { db } from '@/lib/db';
import { medicaments } from '@/lib/db/schema/medicament';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as xlsx from 'xlsx';
import path from 'path';
import 'dotenv/config';

console.log("Lancement du script d'importation des médicaments...");

// --- Configuration ---
// Chemin vers le fichier Excel. Assurez-vous que ce fichier est à la racine de votre projet.
const EXCEL_FILE_PATH = path.join(process.cwd(), 'data/medicaments_ci.xlsx');
// Nom de la feuille à lire dans le fichier Excel.
const SHEET_NAME = 'Sheet1'; // Adaptez si le nom de votre feuille est différent

// --- Connexion à la base de données ---
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("Erreur : La variable d'environnement DATABASE_URL n'est pas définie.");
  process.exit(1);
}

const client = postgres(connectionString);
const database = drizzle(client);

// --- Fonction Principale ---
async function importData() {
  try {
    // 1. Lecture du fichier Excel
    console.log(`Lecture du fichier Excel depuis : ${EXCEL_FILE_PATH}`);
    const workbook = xlsx.readFile(EXCEL_FILE_PATH);
    const sheet = workbook.Sheets[SHEET_NAME];
    if (!sheet) {
      throw new Error(`La feuille "${SHEET_NAME}" n'a pas été trouvée dans le fichier Excel.`);
    }
    const data: any[] = xlsx.utils.sheet_to_json(sheet);
    console.log(`${data.length} lignes trouvées dans le fichier Excel.`);

    if (data.length === 0) {
      console.log("Aucune donnée à importer. Le script est terminé.");
      return;
    }

    // 2. Mapping des colonnes et préparation des données
    console.log("Mappage des colonnes et préparation des données pour l'insertion...");
    const medicamentsToInsert = data.map(row => {
      // On s'assure que les noms des clés correspondent exactement aux noms des colonnes de votre Excel.
      // Le 'as string' est utilisé pour s'assurer que même les nombres sont traités comme du texte,
      // ce qui évite les erreurs de type lors de l'insertion.
      return {
        nomCommercialCI: row['Nom commercial (CI)'] as string,
        dci: row['DCI'] as string,
        similariteBaseFrancaise: row['Similarité base française'] as string,
        scoreSimilarite: String(row['Score de Similarité (%)'] || ''), // Conversion explicite en chaîne
        paysFournisseur: row['Pays fournisseur'] as string,
        statutAutorisation: row["Statut d'autorisation"] as string,
      };
    });

    // 3. Insertion dans la base de données
    console.log("Nettoyage de la table 'medicaments' existante...");
    await database.delete(medicaments);

    console.log(`Insertion de ${medicamentsToInsert.length} nouveaux enregistrements...`);
    // On insère les données par lots pour ne pas surcharger la base de données si le fichier est très volumineux.
    const chunkSize = 100;
    for (let i = 0; i < medicamentsToInsert.length; i += chunkSize) {
        const chunk = medicamentsToInsert.slice(i, i + chunkSize);
        await database.insert(medicaments).values(chunk);
        console.log(`Lot ${i / chunkSize + 1} inséré.`);
    }

    console.log("✅ Importation terminée avec succès !");

  } catch (error) {
    console.error("❌ Une erreur est survenue lors de l'importation :", error);
  } finally {
    // 4. Fermeture de la connexion
    await client.end();
    console.log("Connexion à la base de données fermée.");
  }
}

// --- Exécution ---
importData();
