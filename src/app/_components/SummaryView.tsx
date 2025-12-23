interface SummaryViewProps {
  title: string;
  summary: string;
  questions: any[];
  quizLoading: boolean;
  onSeeFullContent: () => void;
  onGenerateQuiz: () => void;
}

function SummaryView({
  title,
  summary,
  questions,
  quizLoading,
  onSeeFullContent,
  onGenerateQuiz,
}: SummaryViewProps) {
  return (
    <div className="w-full flex flex-col gap-4">
      <p className="flex items-center gap-2 text-gray-700">
        <BookOpen size={18} />
        Summarized Content
      </p>
      <h2 className="text-2xl font-semibold">{title}</h2>
      <div className="w-full p-4 bg-gray-50 rounded-lg border text-gray-800">
        {summary}
      </div>
      <div className="flex justify-between mt-4">
        <button
          onClick={onSeeFullContent}
          className="px-4 py-2 rounded-lg bg-white border hover:bg-gray-50"
        >
          See Full Content
        </button>
        <button
          onClick={onGenerateQuiz}
          disabled={quizLoading}
          className={`px-4 py-2 rounded-lg text-white ${
            quizLoading
              ? "bg-gray-400 cursor-not-allowed"
              : questions.length > 0
              ? "bg-purple-600 hover:bg-purple-700"
              : "bg-black hover:bg-gray-800"
          }`}
        >
          {quizLoading
            ? "Generating Quiz..."
            : questions.length > 0
            ? "Take Quiz"
            : "Generate Quiz"}
        </button>
      </div>
    </div>
  );
}
