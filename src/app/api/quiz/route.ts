// app/api/quiz/route.ts
import { NextRequest, NextResponse } from "next/server";

import prisma from "../../../../lib/prisma";
import { auth } from "@clerk/nextjs/server";

// POST - Create quiz questions for an article
export async function POST(req: NextRequest) {
  try {
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { articleId, questions } = body;

    if (!articleId || !questions || !Array.isArray(questions)) {
      return NextResponse.json(
        { error: "articleId and questions array are required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Verify article ownership
    const article = await prisma.article.findFirst({
      where: {
        id: articleId,
        userId: user.id,
      },
    });

    if (!article) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    // Delete existing quizzes for this article
    await prisma.quiz.deleteMany({
      where: { articleId },
    });

    // Create new quizzes
    const createdQuizzes = await Promise.all(
      questions.map((q: any) =>
        prisma.quiz.create({
          data: {
            queistion: q.question, // Note: keeping your schema's typo
            options: JSON.stringify(q.options),
            answer: q.correct.toString(),
            articleId,
          },
        })
      )
    );

    return NextResponse.json({ quizzes: createdQuizzes }, { status: 201 });
  } catch (error) {
    console.error("POST /api/quiz error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT - Submit quiz attempt and save score
export async function PUT(req: NextRequest) {
  try {
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { quizId, score, totalQuestions } = body;

    if (!quizId || score === undefined || !totalQuestions) {
      return NextResponse.json(
        { error: "quizId, score, and totalQuestions are required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Verify quiz exists
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
    });

    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    // Create quiz attempt
    const attempt = await prisma.quizAttempt.create({
      data: {
        userId: user.id,
        quizId,
        TotalScore: score,
      },
    });

    // Update or create user score (keep highest score)
    const existingScore = await prisma.userScores.findFirst({
      where: {
        userId: user.id,
        quizId,
      },
    });

    if (existingScore) {
      // Update if new score is higher
      if (score > existingScore.TotalScore) {
        await prisma.userScores.update({
          where: { id: existingScore.id },
          data: { TotalScore: score },
        });
      }
    } else {
      // Create new score record
      await prisma.userScores.create({
        data: {
          userId: user.id,
          quizId,
          TotalScore: score,
        },
      });
    }

    return NextResponse.json(
      {
        attempt,
        message: "Quiz attempt saved successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("PUT /api/quiz error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET - Get quiz attempts for a specific article
export async function GET(req: NextRequest) {
  try {
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const articleId = searchParams.get("articleId");

    if (!articleId) {
      return NextResponse.json(
        { error: "articleId is required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get all quiz attempts for this article
    const attempts = await prisma.quizAttempt.findMany({
      where: {
        userId: user.id,
        quiz: {
          articleId,
        },
      },
      include: {
        quiz: true,
      },
      orderBy: {
        id: "desc",
      },
    });

    return NextResponse.json({ attempts });
  } catch (error) {
    console.error("GET /api/quiz error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
