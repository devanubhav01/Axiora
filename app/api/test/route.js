import { NextResponse } from "next/server";
import connectDb from "@/db/connectDb";
import User from "@/models/User";

export async function GET() {
  try {
    await connectDb();
    const count = await User.countDocuments({});
    return NextResponse.json({ 
      success: true, 
      message: "Database connection successful!", 
      userCount: count 
    });
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}
