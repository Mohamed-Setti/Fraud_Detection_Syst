import { dbConnect } from "@/lib/mongodb";
import User from "../../../../Models/User";

interface Params {
  id: string;
}

export async function PUT(
  req: Request,
  { params }: { params: Params }
) {
  try {
    await dbConnect();

    const { id } = params;
    const { role } = await req.json();

    if (!role) {
      return Response.json({ error: "Role is required" }, { status: 400 });
    }

    const validRoles = ["admin", "analyst", "user"];
    if (!validRoles.includes(role)) {
      return Response.json({ error: "Invalid role" }, { status: 400 });
    }

    const updatedUser = await User.findByIdAndUpdate(id, { role }, { new: true });

    if (!updatedUser) {
      return Response.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return Response.json({
      message: "Role updated successfully",
      user: updatedUser,
    });

  } catch (error) {
    if (error instanceof Error) {
      return Response.json(
        { error: "Failed to update role", details: error.message },
        { status: 500 }
      );
    }

    return Response.json(
      { error: "Failed to update role", details: "Unknown error" },
      { status: 500 }
    );
  }
}
