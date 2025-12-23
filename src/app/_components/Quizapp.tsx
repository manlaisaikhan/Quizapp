"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { Article } from "../../../generated/prisma/browser";

import HistorySidebar from "./HistorySidebar";

export default function QuizApp() {
  const [history, setHistory] = useState<Article[]>([]);
  const [currentArticle, setCurrentArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  const { user, isLoaded } = useUser();

  useEffect(() => {
    if (isLoaded && user) {
      loadHistory();
    }
  }, [isLoaded, user]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/articles");
      const data = await response.json();

      if (response.ok) {
        setHistory(data.articles || []);
      } else {
        console.error("Failed to load history:", data.error);
      }
    } catch (error) {
      console.error("Error loading history:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveArticle = async (articleData: any) => {
    try {
      const response = await fetch("/api/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(articleData),
      });

      const data = await response.json();

      if (response.ok) {
        setCurrentArticle(data.article);
        await loadHistory();
        return data.article;
      } else {
        console.error("Failed to save article:", data.error);
        return null;
      }
    } catch (error) {
      console.error("Error saving article:", error);
      return null;
    }
  };

  const saveQuizzes = async (articleId: string, questions: any[]) => {
    try {
      const response = await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ articleId, questions }),
      });

      const data = await response.json();

      if (response.ok) {
        await loadHistory();
        return data.quizzes;
      } else {
        console.error("Failed to save quizzes:", data.error);
        return null;
      }
    } catch (error) {
      console.error("Error saving quizzes:", error);
      return null;
    }
  };

  const deleteArticle = async (id: string) => {
    try {
      const response = await fetch(`/api/articles/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        if (currentArticle?.id === id) {
          setCurrentArticle(null);
        }
        await loadHistory();
      } else {
        console.error("Failed to delete article");
      }
    } catch (error) {
      console.error("Error deleting article:", error);
    }
  };

  const loadArticle = (article: Article) => {
    setCurrentArticle(article);
  };

  /* ---------------- AUTH STATES ---------------- */

  if (!isLoaded) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Please sign in</h2>
          <p className="text-gray-600">Sign in to use the Quiz App</p>
        </div>
      </div>
    );
  }

  /* ---------------- UI ---------------- */

  return (
    <div className="w-full h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <div className="h-14 bg-white flex items-center px-6 shadow">
        <h1 className="text-2xl font-bold">Quiz App</h1>
        <span className="ml-auto text-sm text-gray-600">{user.fullName}</span>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <HistorySidebar
          history={history}
          loading={loading}
          currentArticle={currentArticle}
          onLoadArticle={loadArticle}
          onDeleteArticle={deleteArticle}
        />

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <ArticleQuizGenerator
            currentArticle={currentArticle}
            onSave={saveArticle}
            onSaveQuizzes={saveQuizzes}
            onReset={() => setCurrentArticle(null)}
          />
        </div>
      </div>
    </div>
  );
}
