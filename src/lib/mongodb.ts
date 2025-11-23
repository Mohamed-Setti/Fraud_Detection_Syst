 import mongoose from "mongoose";

 const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://ProjetNextJs:P12QKE5OtxQR8SupXZQ9C@fdsdb.dffagbq.mongodb.net/FDS";
 if (!MONGODB_URI) {
    throw new Error("❌ Please add your MongoDB URI to .env.local");
 }
 let isConnected = false;
 export async function dbConnect() {
    if (isConnected) return;
    try {
        await mongoose.connect(MONGODB_URI);
        isConnected = true;
        console.log("✅MongoDB connected");
        console.log(`MongoDB URI: ${MONGODB_URI}`);
    } catch (error) {
        console.error("❌ MongoDB connection error", error);
        throw error;
    }
}

