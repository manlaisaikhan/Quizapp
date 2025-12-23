interface QuizResultsProps {
  questions: Question[];
  answers: Record<number, number>;
  score: number;
  onRetake: () => void;
  onNewArticle: () => void;
}

function QuizResults({
  questions,
  answers,
  score,
  onRetake,
  onNewArticle,
}: QuizResultsProps) {
  const percentage = Math.round((score / questions.length) * 100);

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Quiz Results</h2>
      <div className="bg-purple-50 border-2 border-purple-600 rounded-lg p-6 mb-6">
        <p className="text-3xl font-bold text-center text-purple-600">
          {score} / {questions.length}
        </p>
        <p className="text-center text-gray-600 mt-2">{percentage}% Correct</p>
      </div>

      <div className="space-y-4 mb-6">
        {questions.map((q, idx) => (
          <div key={idx} className="border rounded-lg p-4">
            <p className="font-medium mb-2">{q.question}</p>
            <p
              className={`text-sm ${
                answers[idx] === q.correct ? "text-green-600" : "text-red-600"
              }`}
            >
              Your answer: {q.options[answers[idx]] || "Not answered"}
              {answers[idx] === q.correct ? " ✓" : " ✗"}
            </p>
            {answers[idx] !== q.correct && (
              <p className="text-sm text-green-600">
                Correct answer: {q.options[q.correct]}
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <button
          onClick={onRetake}
          className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
        >
          Retake Quiz
        </button>
        <button
          onClick={onNewArticle}
          className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
        >
          New Article
        </button>
      </div>
    </div>
  );
}

// ============================================
// ARTICLE QUIZ GENERATOR (MAIN LOGIC)
// ============================================
interface ArticleQuizGeneratorProps {
  currentArticle: any;
  onSave: (data: any) => Promise<any>;
  onSaveQuizzes: (articleId: string, questions: any[]) => Promise<any>;
  onReset: () => void;
}

function ArticleQuizGenerator({
  currentArticle,
  onSave,
  onSaveQuizzes,
  onReset,
}: ArticleQuizGeneratorProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState("");
  const [step, setStep] = useState(0);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [quizLoading, setQuizLoading] = useState(false);

  useEffect(() => {
    if (currentArticle) {
      setTitle(currentArticle.title);
      setContent(currentArticle.content);
      setSummary(currentArticle.summary);

      if (currentArticle.quizzes && currentArticle.quizzes.length > 0) {
        const parsedQuestions = currentArticle.quizzes.map((quiz: any) => ({
          question: quiz.queistion,
          options: JSON.parse(quiz.options),
          correct: parseInt(quiz.answer),
        }));
        setQuestions(parsedQuestions);
      } else {
        setQuestions([]);
      }

      setStep(1);
      setAnswers({});
      setShowResults(false);
    } else {
      resetQuiz();
    }
  }, [currentArticle]);

  const generateSummary = async () => {
    if (!title.trim() || !content.trim()) return;

    setLoading(true);

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [
            {
              role: "user",
              content: `Please provide a concise summary (3-4 sentences) of the following article:\n\nTitle: ${title}\n\nContent: ${content}`,
            },
          ],
        }),
      });

      const data = await response.json();
      const summaryText =
        data.content.find((item: any) => item.type === "text")?.text ||
        "Summary generation failed.";

      setSummary(summaryText);
      setStep(1);

      const saved = await onSave({
        title,
        content,
        summary: summaryText,
      });

      if (!saved) {
        alert("Failed to save article. Please try again.");
      }
    } catch (error) {
      console.error("Error generating summary:", error);
      alert("Failed to generate summary. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const generateQuiz = async () => {
    if (questions.length > 0) {
      setStep(3);
      return;
    }

    setQuizLoading(true);

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [
            {
              role: "user",
              content: `Based on this article, generate 5 multiple-choice quiz questions. Return ONLY valid JSON with no preamble or markdown:\n\n${content}\n\nFormat:\n{"questions": [{"question": "...", "options": ["A", "B", "C", "D"], "correct": 0}]}`,
            },
          ],
        }),
      });

      const data = await response.json();
      const text =
        data.content.find((item: any) => item.type === "text")?.text || "{}";
      const cleaned = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(cleaned);

      const generatedQuestions = parsed.questions || [];
      setQuestions(generatedQuestions);
      setCurrentQuestion(0);
      setAnswers({});
      setShowResults(false);
      setStep(3);

      if (currentArticle?.id) {
        await onSaveQuizzes(currentArticle.id, generatedQuestions);
      }
    } catch (error) {
      console.error("Error generating quiz:", error);
      alert("Failed to generate quiz. Please try again.");
    } finally {
      setQuizLoading(false);
    }
  };

  const handleAnswer = (questionIndex: number, answerIndex: number) => {
    setAnswers({ ...answers, [questionIndex]: answerIndex });
  };

  const submitQuiz = () => {
    setShowResults(true);
  };

  const calculateScore = () => {
    let correct = 0;
    questions.forEach((q, i) => {
      if (answers[i] === q.correct) correct++;
    });
    return correct;
  };

  const resetQuiz = () => {
    setTitle("");
    setContent("");
    setSummary("");
    setQuestions([]);
    setAnswers({});
    setCurrentQuestion(0);
    setShowResults(false);
    setStep(0);
    onReset();
  };

  return (
    <div className="w-full flex justify-center p-10 min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="border border-purple-600 rounded-2xl p-10 w-full max-w-4xl shadow-md bg-white"
      >
        <h1 className="text-2xl font-semibold mb-4 text-black flex items-center gap-2">
          <Sparkles className="text-purple-600" size={24} /> Article Quiz
          Generator
        </h1>

        {step === 0 && (
          <ArticleInput
            title={title}
            content={content}
            loading={loading}
            onTitleChange={setTitle}
            onContentChange={setContent}
            onGenerateSummary={generateSummary}
          />
        )}

        {step === 1 && (
          <SummaryView
            title={title}
            summary={summary}
            questions={questions}
            quizLoading={quizLoading}
            onSeeFullContent={() => setStep(2)}
            onGenerateQuiz={generateQuiz}
          />
        )}

        {step === 2 && (
          <div className="relative">
            <h2 className="text-xl font-semibold mb-3">Full Article</h2>
            <button
              onClick={() => setStep(1)}
              className="px-4 py-2 bg-black text-white rounded-full hover:bg-gray-800 absolute top-0 right-0"
            >
              ✕
            </button>
            <div className="border rounded-lg p-4 mb-5 text-gray-800 bg-gray-50 min-h-[150px] mt-10 whitespace-pre-wrap">
              {content}
            </div>
          </div>
        )}

        {step === 3 && !showResults && (
          <QuizQuestion
            questions={questions}
            currentQuestion={currentQuestion}
            answers={answers}
            onAnswer={handleAnswer}
            onPrevious={() =>
              setCurrentQuestion(Math.max(0, currentQuestion - 1))
            }
            onNext={() => setCurrentQuestion(currentQuestion + 1)}
            onSubmit={submitQuiz}
            onBackToSummary={() => setStep(1)}
          />
        )}

        {step === 3 && showResults && (
          <QuizResults
            questions={questions}
            answers={answers}
            score={calculateScore()}
            onRetake={() => {
              setAnswers({});
              setCurrentQuestion(0);
              setShowResults(false);
            }}
            onNewArticle={resetQuiz}
          />
        )}
      </motion.div>
    </div>
  );
}
