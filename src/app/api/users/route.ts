import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import User from "@/app/Models/User";
import mongoose from "mongoose";

export async function GET(req: Request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id")?.trim();

    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid ObjectId" }, { status: 400 });
    }

    const user = await User.findById(id).lean();
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: String(user._id),
      name: user.name,
      email: user.email,
      role: user.role,
      metadata: user.metadata,
    });
  } catch (error: unknown) {
    console.error("GET /api/users error:", error);
    return NextResponse.json(
      {
        error: "Something went wrong",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}