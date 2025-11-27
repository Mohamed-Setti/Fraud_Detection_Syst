import { dbConnect } from "@/lib/mongodb";
import User from "../../../Models/User";
import Compte from "../../../Models/Compte";
//import bcrypt from "bcryptjs";
import { TypeCompte } from "../../../Models/enums";

export async function POST(req: Request) {
  try {
    await dbConnect();

    const { name, email, role: incomingRole, password } = await req.json();
    const role = incomingRole ?? "CLIENT";

    if (!name || !email || !password) {
      return new Response(JSON.stringify({ error: "Missing fields" }), { status: 400 });
    }

    // Vérifier si l’utilisateur existe déjà
    const exists = await User.findOne({ email });
    if (exists) {
      return new Response(JSON.stringify({ error: "User already exists" }), { status: 400 });
    }

    // Hash du mot de passe
    //const hashedPassword = await bcrypt.hash(password, 10);

    // 1️⃣ Création de l’utilisateur
    const user = new User({
      name,
      email,
      password, //: hashedPassword,
      role
    });
    await user.save();
    let compte;
    if (role === "CLIENT") {
    // 2️⃣ Génération d’un numéro de compte unique
      const numeroCompte = "AC" + Math.floor(100000 + Math.random() * 900000);

      // 3️⃣ Création automatique d’un compte lié au client
      compte = new Compte({
        nameAccount: `${name} Account`,
        numeroCompte,
        soldeActuel: 0,
        typeCompte: TypeCompte.COURANT, // utilisation de l’enum
        owner: user._id,
        devise: "EUR",
        limiteDailyTransfer: 10000
      });
      await compte.save();
    }
    return new Response( 
      JSON.stringify({
        message: "User and account created successfully",
        user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        },
        compteId: role === "CLIENT" && compte ? compte._id : null
      }),
      { status: 201 }
    );

  } catch (error: unknown) {
    console.error("REGISTER ERROR:", error);
    return new Response(
      JSON.stringify({
        error: "Something went wrong",
        details: error instanceof Error ? error.message : "Unknown error"
      }),
      { status: 500 }
    );
  }
}
