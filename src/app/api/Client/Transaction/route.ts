// app/api/Client/Transaction/route.ts
import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import Transaction from "../../../Models/Transaction";
import Compte from "../../../Models/Compte";
import { Channel, StatutTransaction, TypeTransaction } from "../../../Models/enums";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (id) {
      const transaction = await Transaction.findById(id);
      if (!transaction) {
        return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
      }
      return NextResponse.json(transaction, { status: 200 });
    }

    const transactions = await Transaction.find().sort({ date: -1 });
    return NextResponse.json(transactions, { status: 200 });
  } catch (error) {
    console.error("Transaction GET error:", error);
    return NextResponse.json(
      { error: "Something went wrong", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const data = await req.json();

    const { userId, montant, type = "OTHER", channel = "ONLINE", compteDestinationId } = data;

    if (!userId || !montant) {
      return NextResponse.json({ error: "Missing userId or montant" }, { status: 400 });
    }

    // Récupérer le compte source lié au client
    const compteSource = await Compte.findOne({ owner: userId });
    if (!compteSource) {
      return NextResponse.json({ error: "Compte source not found for user" }, { status: 404 });
    }

    // Vérifier channel et type valides
    if (!Object.values(Channel).includes(channel as any)) {
      return NextResponse.json({ error: "`channel` is not a valid value" }, { status: 400 });
    }
    if (!Object.values(TypeTransaction).includes(type as any)) {
      return NextResponse.json({ error: "`type` is not a valid value" }, { status: 400 });
    }

    const newTransaction = new Transaction({
      user: userId,
      compteSource: compteSource._id,
      compteDestination: compteDestinationId || null,
      amount: montant,
      type,
      channel,
      statut: StatutTransaction.EN_ATTENTE,
      date: new Date(),
      createdAt: new Date()
    });

    const savedTransaction = await newTransaction.save();

    // Mettre à jour le solde du compte source
    compteSource.soldeActuel -= montant;
    await compteSource.save();

    return NextResponse.json(savedTransaction, { status: 201 });
  } catch (error) {
    console.error("Transaction POST error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
