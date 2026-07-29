import { NextResponse } from "next/server";

export async function POST(request) {
  const { password } = await request.json();

  if (password !== process.env.LOGIN_PASSWORD) {
    return NextResponse.json(
      { success: false },
      { status: 401 }
    );
  }

  const response = NextResponse.json({ success: true });

  response.cookies.set({
    name: "access-token",
    value: process.env.ACCESS_TOKEN,
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });

  return response;
}