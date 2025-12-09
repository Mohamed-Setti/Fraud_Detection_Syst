import { dbConnect } from "@/lib/mongodb";
import Report from "@/app/Models/Rapport";

export async function GET(req: Request) {
  try {
    await dbConnect();

    const reports = await Report.find().sort({ date: -1 });

    return new Response(JSON.stringify(reports), { status: 200 });

  } catch (error) {
    if (error instanceof Error) {
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500 }
      );
    }
    return new Response(
      JSON.stringify({ error: "Unknown error" }),
      { status: 500 }
    );
  }
}
