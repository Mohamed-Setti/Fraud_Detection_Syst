// app/api/Client/Transaction/route.ts
import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import Transaction from "@/Models/Transaction";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    // Récupération du paramètre ID dans l'URL s'il existe
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    // 👉 Si un ID est fourni → GET une seule transaction
    if (id) {
      const transaction = await Transaction.findById(id);

      if (!transaction) {
        return NextResponse.json(
          { error: "Transaction not found" },
          { status: 404 }
        );
      }

      return NextResponse.json(transaction, { status: 200 });
    }

    // 👉 Sinon → GET toutes les transactions
    const transactions = await Transaction.find().sort({ date: -1 });

    return NextResponse.json(transactions, { status: 200 });
  } catch (error) {
    console.error("Transaction GET error:", error);
    return NextResponse.json(
      {
        error: "Something went wrong",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const data = await req.json();

    const newTransaction = new Transaction({
      ...data,
      date: new Date(),
      createdAt: new Date(),
    });

    const savedTransaction = await newTransaction.save();

    return NextResponse.json(savedTransaction, { status: 201 });
  } catch (error) {
    console.error("Transaction POST error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
