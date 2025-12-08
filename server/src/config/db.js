import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });



export const connectDB = async () => {
    
    const { DB_USER, DB_PASSWORD, DB_HOST } = process.env;


    if (!DB_USER || !DB_PASSWORD || !DB_HOST) {
        console.error("❌ Faltan variables de entorno para la DB");
        process.exit(1);
    }

    const mongoDbUrl = `mongodb+srv://${DB_USER}:${DB_PASSWORD}@${DB_HOST}/my-book-space`;

    try {
        await mongoose.connect(mongoDbUrl);
        console.log('✅ Conectado a MongoDB');
    } catch (error) {
        console.error('❌ Error conectando a MongoDB:', error);
        process.exit(1);    
    }
};
