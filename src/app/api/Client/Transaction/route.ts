// app/api/Client/Transaction/route.ts
import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import Transaction from "@/Models/Transaction";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const body = await req.json();
    const {
      date,
      amount,
      type,
      channel,
      description,
      balanceAfter,
      compteSource,
      compteDestination,
    } = body;

    // Validation des champs obligatoires
    if (!date || amount === undefined || amount === null || !type || !channel) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const parsedAmount = Number(amount);
    if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      return NextResponse.json(
        { error: "Amount must be a positive number" },
        { status: 400 }
      );
    }

    const parsedBalanceAfter =
      balanceAfter !== undefined && balanceAfter !== ""
        ? Number(balanceAfter)
        : undefined;

    const newTransaction = new Transaction({
      date: new Date(date),
      amount: parsedAmount,
      type,
      channel,
      description: description || undefined,
      balanceAfter: parsedBalanceAfter,
      compteSource: compteSource || undefined,
      compteDestination: compteDestination || undefined,
    });

    await newTransaction.save();

    return NextResponse.json(
      { message: "Transaction created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Transaction error:", error);
    return NextResponse.json(
      {
        error: "Something went wrong",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
