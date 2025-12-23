"use client";

import { Menu, X, History, Trash2 } from "lucide-react";
import { useState } from "react";

interface Article {
  id: string;
  title: string;
  createdAt: string;
  quizzes?: any[];
}

interface HistorySidebarProps {
  history: Article[];
  loading: boolean;
  currentArticle: Article | null;
  onLoadArticle: (article: Article) => void;
  onDeleteArticle: (id: string) => void;
}

export default function HistorySidebar({
  history,
  loading,
  currentArticle,
  onLoadArticle,
  onDeleteArticle,
}: HistorySidebarProps) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div
      className={`h-full bg-white transition-all duration-300 ${
        isOpen ? "w-[300px]" : "w-[72px]"
      } border-r`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b">
        {isOpen && (
          <h2 className="text-black text-lg font-bold flex items-center gap-2">
            <History size={20} />
            History
          </h2>
        )}
        <button
          className="p-2 hover:bg-gray-100 rounded-lg transition"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Content */}
      {isOpen && (
        <div className="p-4 overflow-y-auto h-[calc(100%-64px)]">
          {loading ? (
            <p className="text-gray-500 text-sm text-center mt-8">Loading...</p>
          ) : history.length === 0 ? (
            <p className="text-gray-500 text-sm text-center mt-8">
              No articles yet
            </p>
          ) : (
            <div className="space-y-2">
              {history.map((item) => (
                <div
                  key={item.id}
                  className={`p-3 border rounded-lg cursor-pointer group hover:bg-gray-50 ${
                    currentArticle?.id === item.id
                      ? "border-purple-600 bg-purple-50"
                      : ""
                  }`}
                  onClick={() => onLoadArticle(item)}
                >
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm truncate">
                        {item.title}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </p>
                      {item.quizzes?.length ? (
                        <p className="text-xs text-purple-600 mt-1">
                          {item.quizzes.length} questions
                        </p>
                      ) : null}
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm("Delete this article?")) {
                          onDeleteArticle(item.id);
                        }
                      }}
                      className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
