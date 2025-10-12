// Créez un endpoint de test : app/api/test-db/route.ts
   import { db } from '@/lib/db';
   import { sql } from 'drizzle-orm';
   
   export async function GET() {
     try {
       const result = await db.execute(sql`SELECT 1 as test`);
       return Response.json({ status: 'ok', result });
     } catch (error) {
       return Response.json({ 
         status: 'error', 
         error: (error as Error).message 
       }, { status: 500 });
     }
   }