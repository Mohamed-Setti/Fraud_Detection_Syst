import { dbConnect } from "@/lib/mongodb";
import User from "@/Models/User";

export async function GET() {
  try {
    await dbConnect();

    // Ne pas renvoyer le hash du mot de passe
    const users = await User.find().select("-passwordHash");

    return Response.json(users);

  } catch (error) {

    // Gestion propre du type unknown
    if (error instanceof Error) {
      return Response.json(
        { error: "Failed to fetch users", details: error.message },
        { status: 500 }
      );
    }

    // Cas où l'erreur n'est pas une instance d'Error
    return Response.json(
      { error: "Failed to fetch users", details: "Unknown error" },
      { status: 500 }
    );
  }
}

