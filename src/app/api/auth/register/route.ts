import { dbConnect } from "@/lib/mongodb";
import User from "@/Models/User";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    await dbConnect();

    const { name, email, mobile, password, role } = await req.json();

    if (!name || !email || !password || !role) {
      return new Response(
        JSON.stringify({ error: "Missing fields" }),
        { status: 400 }
      );
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return new Response(
        JSON.stringify({ error: "User already exists" }),
        { status: 400 }
      );
    }


    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      mobile: mobile || "",
      passwordHash,
      role,
      isAuthenticated: false
    });

    await newUser.save();

    return new Response(
      JSON.stringify({ message: "User registered successfully" }),
      { status: 201 }
    );

  } catch (error: unknown) {
    return new Response(
      JSON.stringify({
        error: "Something went wrong",
        details: error instanceof Error ? error.message : "Unknown error"
      }),
      { status: 500 }
    );
  }
}
