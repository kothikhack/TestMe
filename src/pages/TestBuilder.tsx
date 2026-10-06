import { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db';
import { useNavigate, useParams } from 'react-router-dom';
import { Search, Save } from 'lucide-react';

export default function TestBuilder() {
  const navigate = useNavigate();
  const { examId } = useParams();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (examId) {
      const loadExam = async () => {
        const exam = await db.exams.get(parseInt(examId));
        if (exam) {
          setTitle(exam.title);
          setDescription(exam.description || '');
          setSelectedQuestionIds(new Set(exam.questionIds));
        }
      };
      loadExam();
    }
  }, [examId]);

  const questions = useLiveQuery(
    () => db.questions.orderBy('createdAt').reverse().toArray(),
    []
  );

  const filteredQuestions = questions?.filter(q => 
    q.questionText.toLowerCase().includes(searchTerm.toLowerCase()) ||
    q.categories.some(c => c.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const toggleQuestionSelection = (id: number) => {
    const newSet = new Set(selectedQuestionIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedQuestionIds(newSet);
  };

  const handleSaveExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedQuestionIds.size === 0) {
      alert('Please select at least one question for the exam.');
      return;
    }

    if (examId) {
      await db.exams.update(parseInt(examId), {
        title,
        description,
        questionIds: Array.from(selectedQuestionIds),
      });
    } else {
      await db.exams.add({
        title,
        description,
        questionIds: Array.from(selectedQuestionIds),
        createdAt: new Date(),
      });
    }

    navigate('/simulator');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">{examId ? 'Edit Exam' : 'Test Builder'}</h1>
        <p className="text-slate-600">{examId ? 'Update your exam details and questions.' : 'Create a new exam from your question bank.'}</p>
      </div>

      <form onSubmit={handleSaveExam} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col md:flex-row">
        {/* Left side: Exam Details */}
        <div className="p-6 border-b md:border-b-0 md:border-r border-slate-200 md:w-1/3 flex flex-col space-y-4 bg-slate-50">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Exam Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g. Midterm Practice"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              placeholder="Optional description..."
            />
          </div>
          <div className="mt-auto pt-6">
            <div className="mb-4 text-sm font-medium text-slate-700">
              Selected Questions: <span className="text-indigo-600 font-bold">{selectedQuestionIds.size}</span>
            </div>
            <button
              type="submit"
              className="w-full flex justify-center items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              <Save className="w-5 h-5" />
              {examId ? 'Update Exam' : 'Save Exam'}
            </button>
          </div>
        </div>

        {/* Right side: Question Selection */}
        <div className="p-0 md:w-2/3 flex flex-col h-[600px]">
          <div className="p-4 border-b border-slate-200 bg-white">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search questions to add..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>
          <div className="overflow-y-auto flex-grow bg-white p-4">
            <ul className="space-y-3">
              {filteredQuestions?.length === 0 ? (
                <li className="text-center text-slate-500 py-8">No questions available.</li>
              ) : (
                filteredQuestions?.map(q => (
                  <li
                    key={q.id}
                    onClick={() => q.id && toggleQuestionSelection(q.id)}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      q.id && selectedQuestionIds.has(q.id)
                        ? 'border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500'
                        : 'border-slate-200 hover:border-indigo-300'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-1">
                        <input
                          type="checkbox"
                          checked={q.id ? selectedQuestionIds.has(q.id) : false}
                          readOnly
                          className="w-4 h-4 text-indigo-600 rounded"
                        />
                      </div>
                      <div>
                        <div className="flex gap-2 mb-1">
                          <span className="text-xs bg-slate-200 text-slate-600 px-2 py-0.5 rounded">
                            {q.type === 'mcq' ? 'MCQ' : 'Text'}
                          </span>
                          {q.categories.map(cat => (
                            <span key={cat} className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded">
                              {cat}
                            </span>
                          ))}
                        </div>
                        <p className="text-sm font-medium text-slate-800 line-clamp-2">{q.questionText}</p>
                      </div>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      </form>
    </div>
  );
}
