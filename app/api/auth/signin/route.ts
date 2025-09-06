import { NextRequest, NextResponse } from "next/server";
import { SignJWT } from "jose";

// Hardcoded admin credentials
const ADMIN_EMAIL = "admin@avenping.com";
const ADMIN_PASSWORD = "admin123";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Check credentials
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      // Create JWT token
      const secret = new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key");
      
      const token = await new SignJWT({ 
        email: ADMIN_EMAIL,
        role: "admin",
        userId: "admin-001"
      })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("24h")
        .sign(secret);

      // Set HTTP-only cookie
      const response = NextResponse.json(
        { 
          success: true, 
          message: "Login successful",
          user: {
            email: ADMIN_EMAIL,
            role: "admin",
            name: "Admin User"
          }
        },
        { status: 200 }
      );

      response.cookies.set("auth-token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 24 * 60 * 60, // 24 hours
        path: "/",
      });

      return response;
    } else {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
