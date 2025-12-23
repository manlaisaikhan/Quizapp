// app/api/articles/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth, currentUser } from "@clerk/nextjs";

// GET - Get all articles for current user
export async function GET(req: NextRequest) {
  try {
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find user by clerkId
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const articles = await prisma.article.findMany({
      where: { userId: user.id },
      include: {
        quizzes: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ articles });
  } catch (error) {
    console.error("GET /api/articles error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Create new article
export async function POST(req: NextRequest) {
  try {
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { title, content, summary } = body;

    if (!title || !content || !summary) {
      return NextResponse.json(
        { error: "Title, content, and summary are required" },
        { status: 400 }
      );
    }

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      // Get user info from Clerk
      const clerkUser = await currentUser();

      if (!clerkUser) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      user = await prisma.user.create({
        data: {
          clerkId: userId,
          email:
            clerkUser.emailAddresses[0]?.emailAddress || "unknown@email.com",
          name: clerkUser.fullName || clerkUser.firstName || "Unknown User",
        },
      });
    }

    const article = await prisma.article.create({
      data: {
        title,
        content,
        summary,
        userId: user.id,
      },
      include: {
        quizzes: true,
      },
    });

    return NextResponse.json({ article }, { status: 201 });
  } catch (error) {
    console.error("POST /api/articles error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
