import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type Question, type Exam } from '../lib/db';
import { PlaySquare, CheckCircle, XCircle, ArrowRight, ArrowLeft, Edit, Trash2 } from 'lucide-react';

export default function ExamSimulator() {
  const { examId } = useParams();
  
  // List View State
  const exams = useLiveQuery(() => db.exams.orderBy('createdAt').reverse().toArray());
  
  // Simulator State
  const [activeExam, setActiveExam] = useState<Exam | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    if (examId) {
      loadExam(parseInt(examId));
    }
  }, [examId]);

  const handleDeleteExam = async (id: number) => {
    if (confirm('Are you sure you want to delete this exam?')) {
      await db.exams.delete(id);
    }
  };

  const loadExam = async (id: number) => {
    const exam = await db.exams.get(id);
    if (exam) {
      setActiveExam(exam);
      const qs = await Promise.all(
        exam.questionIds.map(qId => db.questions.get(qId))
      );
      // Filter out any deleted questions
      setQuestions(qs.filter((q): q is Question => q !== undefined));
      setCurrentIndex(0);
      setAnswers({});
      setIsSubmitted(false);
    }
  };

  const handleAnswerChange = (val: string) => {
    setAnswers({ ...answers, [currentIndex]: val });
  };

  const calculateScore = () => {
    let correct = 0;
    questions.forEach((q, idx) => {
      const userAns = answers[idx] || '';
      if (q.type === 'mcq') {
        if (userAns === q.correctAnswer) correct++;
      } else {
        if (userAns.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase()) correct++;
      }
    });
    return correct;
  };

  if (!examId && !activeExam) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Exam Simulator</h1>
          <p className="text-slate-600">Select an exam to practice.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {exams?.length === 0 ? (
            <p className="text-slate-500 col-span-full">No exams created yet. Go to Test Builder first.</p>
          ) : (
            exams?.map(exam => (
              <div key={exam.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col">
                <h3 className="font-bold text-lg mb-1">{exam.title}</h3>
                <p className="text-sm text-slate-500 mb-4 flex-grow">{exam.description || 'No description'}</p>
                <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-100">
                  <span className="text-xs font-medium bg-slate-100 text-slate-600 px-2 py-1 rounded">
                    {exam.questionIds.length} Questions
                  </span>
                  <div className="flex items-center gap-3">
                    <Link
                      to={`/builder/${exam.id}`}
                      className="text-slate-400 hover:text-indigo-600 transition-colors"
                      title="Edit Exam"
                    >
                      <Edit className="w-5 h-5" />
                    </Link>
                    <button
                      onClick={() => exam.id && handleDeleteExam(exam.id)}
                      className="text-slate-400 hover:text-red-600 transition-colors"
                      title="Delete Exam"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                    <Link
                      to={`/simulator/${exam.id}`}
                      className="flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-800 ml-2"
                    >
                      Start <PlaySquare className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  if (!activeExam || questions.length === 0) return <div>Loading exam...</div>;

  const currentQ = questions[currentIndex];
  const isLast = currentIndex === questions.length - 1;
  const isFirst = currentIndex === 0;

  if (isSubmitted) {
    const score = calculateScore();
    const percentage = Math.round((score / questions.length) * 100);
    return (
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 text-center">
          <h2 className="text-3xl font-bold mb-2">Exam Complete!</h2>
          <p className="text-slate-500 mb-6">{activeExam.title}</p>
          <div className="inline-block relative">
            <svg className="w-32 h-32 transform -rotate-90">
              <circle className="text-slate-100" strokeWidth="12" stroke="currentColor" fill="transparent" r="50" cx="64" cy="64" />
              <circle
                className={percentage >= 70 ? "text-emerald-500" : percentage >= 40 ? "text-yellow-500" : "text-red-500"}
                strokeWidth="12"
                strokeDasharray={314}
                strokeDashoffset={314 - (314 * percentage) / 100}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
                r="50"
                cx="64"
                cy="64"
              />
            </svg>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl font-bold">
              {percentage}%
            </div>
          </div>
          <p className="mt-4 text-lg font-medium">You got {score} out of {questions.length} correct.</p>
          <div className="mt-6 flex justify-center gap-4">
            <button onClick={() => { setIsSubmitted(false); setAnswers({}); setCurrentIndex(0); }} className="px-4 py-2 bg-indigo-100 text-indigo-700 font-medium rounded-lg">
              Retry
            </button>
            <Link to="/simulator" className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg">
              Back to Exams
            </Link>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-bold">Review Answers</h3>
          {questions.map((q, idx) => {
            const userAns = answers[idx] || '';
            const isCorrect = q.type === 'mcq' 
              ? userAns === q.correctAnswer 
              : userAns.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase();

            return (
              <div key={idx} className={`p-4 rounded-xl border ${isCorrect ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
                <div className="flex gap-3">
                  <div className="mt-0.5">
                    {isCorrect ? <CheckCircle className="w-5 h-5 text-emerald-600" /> : <XCircle className="w-5 h-5 text-red-600" />}
                  </div>
                  <div className="flex-grow">
                    <p className="font-medium text-slate-800">{q.questionText}</p>
                    {q.figureBase64 && (
                      <div className="mt-3">
                        <img src={q.figureBase64} alt="Question figure" className="max-h-40 rounded-lg border border-slate-200" />
                      </div>
                    )}
                    <div className="mt-4 text-sm grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <span className="text-slate-500">Your Answer:</span>
                        <p className={`font-semibold ${isCorrect ? 'text-emerald-700' : 'text-red-700'}`}>
                          {q.type === 'mcq' ? (userAns ? q.options![parseInt(userAns)] : 'No answer') : (userAns || 'No answer')}
                        </p>
                      </div>
                      <div>
                        <span className="text-slate-500">Correct Answer:</span>
                        <p className="font-semibold text-slate-800">
                          {q.type === 'mcq' ? q.options![parseInt(q.correctAnswer)] : q.correctAnswer}
                        </p>
                      </div>
                    </div>
                    {q.explanation && (
                      <div className="mt-3 p-3 bg-white/60 rounded text-sm text-slate-600 italic">
                        <strong>Explanation:</strong> {q.explanation}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto flex flex-col h-[calc(100vh-8rem)]">
      <div className="mb-4 flex justify-between items-end">
        <div>
          <p className="text-sm text-slate-500">{activeExam.title}</p>
          <h2 className="text-2xl font-bold text-slate-800">Question {currentIndex + 1} of {questions.length}</h2>
        </div>
        <div className="text-sm font-medium text-indigo-600">
          {Math.round(((currentIndex + 1) / questions.length) * 100)}%
        </div>
      </div>
      
      <div className="w-full bg-slate-200 h-2 rounded-full mb-6">
        <div 
          className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
        ></div>
      </div>

      <div className="bg-white p-6 md:p-10 rounded-xl shadow-sm border border-slate-200 flex-grow flex flex-col overflow-y-auto">
        <p className="text-lg font-medium text-slate-800 mb-6 whitespace-pre-wrap">{currentQ.questionText}</p>
        
        {currentQ.figureBase64 && (
          <div className="mb-8 flex justify-center bg-slate-50 p-4 rounded-lg border border-slate-100">
            <img src={currentQ.figureBase64} alt="Question figure" className="max-h-64 object-contain rounded shadow-sm" />
          </div>
        )}

        <div className="mt-auto space-y-4">
          {currentQ.type === 'mcq' ? (
            <div className="space-y-3">
              {currentQ.options?.map((opt, idx) => (
                <label 
                  key={idx} 
                  className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                    answers[currentIndex] === idx.toString() 
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-900 ring-1 ring-indigo-600' 
                      : 'border-slate-200 hover:border-indigo-300'
                  }`}
                >
                  <input
                    type="radio"
                    name={`q-${currentIndex}`}
                    value={idx.toString()}
                    checked={answers[currentIndex] === idx.toString()}
                    onChange={(e) => handleAnswerChange(e.target.value)}
                    className="w-4 h-4 text-indigo-600 mr-3"
                  />
                  <span>{opt}</span>
                </label>
              ))}
            </div>
          ) : (
            <div>
              <input
                type="text"
                placeholder="Type your answer here..."
                value={answers[currentIndex] || ''}
                onChange={(e) => handleAnswerChange(e.target.value)}
                className="w-full p-4 text-lg border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 flex justify-between items-center">
        <button
          onClick={() => setCurrentIndex(prev => prev - 1)}
          disabled={isFirst}
          className={`flex items-center gap-2 px-4 py-2 font-medium rounded-lg transition-colors ${
            isFirst ? 'text-slate-400 cursor-not-allowed' : 'text-slate-700 bg-white border border-slate-300 hover:bg-slate-50'
          }`}
        >
          <ArrowLeft className="w-5 h-5" /> Previous
        </button>
        
        {!isLast ? (
          <button
            onClick={() => setCurrentIndex(prev => prev + 1)}
            className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Next <ArrowRight className="w-5 h-5" />
          </button>
        ) : (
          <button
            onClick={() => setIsSubmitted(true)}
            className="flex items-center gap-2 px-6 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Submit Exam <CheckCircle className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}
