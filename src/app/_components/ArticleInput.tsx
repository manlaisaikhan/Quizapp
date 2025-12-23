import { FileText } from "lucide-react";

interface ArticleInputProps {
  title: string;
  content: string;
  loading: boolean;
  onTitleChange: (value: string) => void;
  onContentChange: (value: string) => void;
  onGenerateSummary: () => void;
}

function ArticleInput({
  title,
  content,
  loading,
  onTitleChange,
  onContentChange,
  onGenerateSummary,
}: ArticleInputProps) {
  return (
    <>
      <p className="text-gray-600 mb-6">
        Paste your article below to generate a summary and quiz questions.
      </p>

      <div className="flex flex-col mb-6">
        <label className="font-medium text-black mb-2 flex items-center gap-2">
          <FileText size={18} /> Article Title
        </label>
        <input
          type="text"
          className="w-full border rounded-lg p-3 focus:outline-none border-gray-400 focus:ring-2 focus:ring-purple-300"
          placeholder="Enter a title..."
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
        />
      </div>

      <div className="flex flex-col mb-6">
        <label className="font-medium text-black mb-2 flex items-center gap-2">
          <FileText size={18} /> Article Content
        </label>
        <textarea
          className="w-full min-h-40 border rounded-lg p-3 focus:outline-none border-gray-400 focus:ring-2 focus:ring-purple-300"
          placeholder="Paste your article content here..."
          value={content}
          onChange={(e) => onContentChange(e.target.value)}
        />
      </div>

      <div className="w-full flex justify-end">
        <button
          onClick={onGenerateSummary}
          disabled={loading || !title.trim() || !content.trim()}
          className={`px-6 py-2 rounded-lg text-white font-medium ${
            loading || !title.trim() || !content.trim()
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-black hover:bg-gray-800"
          }`}
        >
          {loading ? "Generating..." : "Generate Summary"}
        </button>
      </div>
    </>
  );
}
