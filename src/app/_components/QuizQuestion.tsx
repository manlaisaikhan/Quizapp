interface Question {
  question: string;
  options: string[];
  correct: number;
}

interface QuizQuestionProps {
  questions: Question[];
  currentQuestion: number;
  answers: Record<number, number>;
  onAnswer: (questionIndex: number, answerIndex: number) => void;
  onPrevious: () => void;
  onNext: () => void;
  onSubmit: () => void;
  onBackToSummary: () => void;
}

function QuizQuestion({
  questions,
  currentQuestion,
  answers,
  onAnswer,
  onPrevious,
  onNext,
  onSubmit,
  onBackToSummary,
}: QuizQuestionProps) {
  const question = questions[currentQuestion];

  if (!question) return null;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">
          Question {currentQuestion + 1} of {questions.length}
        </h2>
        <button
          onClick={onBackToSummary}
          className="text-gray-500 hover:text-gray-700"
        >
          Back to Summary
        </button>
      </div>

      <div>
        <p className="text-lg mb-6 font-medium">{question.question}</p>

        <div className="space-y-3 mb-6">
          {question.options.map((option, idx) => (
            <button
              key={idx}
              onClick={() => onAnswer(currentQuestion, idx)}
              className={`w-full text-left p-4 rounded-lg border-2 transition ${
                answers[currentQuestion] === idx
                  ? "border-purple-600 bg-purple-50"
                  : "border-gray-300 hover:border-gray-400"
              }`}
            >
              {option}
            </button>
          ))}
        </div>

        <div className="flex justify-between">
          <button
            onClick={onPrevious}
            disabled={currentQuestion === 0}
            className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          {currentQuestion < questions.length - 1 ? (
            <button
              onClick={onNext}
              className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
            >
              Next
            </button>
          ) : (
            <button
              onClick={onSubmit}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Submit Quiz
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
