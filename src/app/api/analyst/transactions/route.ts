import { dbConnect } from "@/lib/mongodb";
import Transaction from "../../../Models/Transaction"; // exemple d'un modèle transaction

export async function GET(req: Request) {
  try {
    await dbConnect();

    // Ici, on récupère toutes les transactions pour l'analyse
    const transactions = await Transaction.find().sort({ createdAt: -1 });

    return new Response(JSON.stringify(transactions), { status: 200 });

  } catch (error) {
    if (error instanceof Error) {
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500 }
      );
    }
    return new Response(
      JSON.stringify({ error: "Unknown error" }),
      { status: 500 }
    );
  }
}
