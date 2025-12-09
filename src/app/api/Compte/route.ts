import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";

import Compte from "../../Models/Compte";


export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const numeroCompte = searchParams.get("name");

    if (!numeroCompte) {
      return NextResponse.json({ error: "Missing 'Account name' query param" }, { status: 400 });
    }

    // If account names are unique, use findOne; otherwise consider find with regex for partial matches.
    const compte = await Compte.findOne({ numeroCompte });

    if (!compte) {
      return NextResponse.json({ error: "Compte not found" }, { status: 404 });
    }

    // Return only the fields you want to expose (e.g., soldeActuel).
    // If you prefer returning all, you can return 'compte' directly.
    return NextResponse.json(
      {
        
        nameAccount: compte.nameAccount,
        owner: compte.owner,
        soldeActuel: compte.soldeActuel,
        
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Compte by-name GET error:", error);
    return NextResponse.json(
      { error: "Something went wrong", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}