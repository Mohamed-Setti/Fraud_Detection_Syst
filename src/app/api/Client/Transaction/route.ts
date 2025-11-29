import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import Transaction from "../../../Models/Transaction";
import Compte from "../../../Models/Compte";
import { Channel, StatutTransaction, TypeTransaction } from "../../../Models/enums";
import jwt from "jsonwebtoken";

/**
 * GET:
 * - if id query param -> return that transaction
 * - else try to determine userId:
 *    1) from Authorization: Bearer <token> (preferred)
 *    2) or from query param userId (fallback, less secure)
 * - if userId found -> return only transactions for that user
 * - otherwise -> return all transactions (or change to 401 if you want)
 */
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

    // 1) try Authorization header -> decode token to get userId
    let userId: string | null = null;
    const authHeader = req.headers.get("authorization") || req.headers.get("Authorization") || "";
    if (authHeader) {
      const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : authHeader;
      try {
        const secret = process.env.JWT_SECRET;
        if (!secret) {
          console.warn("JWT_SECRET not defined on server");
        } else {
          const payload = jwt.verify(token, secret) as any;
          userId = payload.sub || payload.userId || payload.id || null;
        }
      } catch (err) {
        console.warn("Invalid JWT token:", err instanceof Error ? err.message : err);
        // invalid token -> ignore and fallback to query param
        userId = null;
      }
    }

    // 2) fallback: userId query param (insecure)
    if (!userId) {
      const qUser = searchParams.get("userId");
      if (qUser) userId = qUser;
    }

    // 3) build filter
    const filter: any = {};
    if (userId) {
      filter.user = userId;
    } else {
      // No userId: keep returning all (or change to return 401 to require auth)
      // return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // optional: apply other filters (search, status, date range)
    const search = searchParams.get("search");
    if (search) {
      filter.$or = [
        { _id: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { compteSource: { $regex: search, $options: "i" } },
        { compteDestination: { $regex: search, $options: "i" } },
      ];
    }

    const transactions = await Transaction.find(filter).sort({ date: -1 });
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