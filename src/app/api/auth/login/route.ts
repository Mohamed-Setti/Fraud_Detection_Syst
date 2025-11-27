import { dbConnect } from "@/lib/mongodb";
import User from "../../../Models/User";
import Compte from "../../../Models/Compte";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(req: Request) {
  try {
    await dbConnect();

    const { email, password } = await req.json();
    if (!email || !password) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return new Response(JSON.stringify({ error: "Invalid credentials" }), { status: 401 });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return new Response(JSON.stringify({ error: "Invalid credentials" }), { status: 401 });
    }
    
    const compte = await Compte.findOne({ owner: user._id });
    
    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET as string, { expiresIn: "1d" });

    return new Response(JSON.stringify({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      compte: compte ? {
        id: compte._id,
        soldeActuel: compte.soldeActuel,
        typeCompte: compte.typeCompte,
        devise: compte.devise,
        numeroCompte: compte.numeroCompte,
      } : null
      //compteId: compte._id
    }), { status: 200 });

  } catch (error) {
    console.error("Login error:", error);
    return new Response(JSON.stringify({
      error: "Something went wrong",
      details: error instanceof Error ? error.message : "Unknown error"
    }), { status: 500 });
  }
}
