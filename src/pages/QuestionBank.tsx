import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type Question } from '../db';
import { Search, Plus, Trash2, Edit, Image as ImageIcon } from 'lucide-react';
import QuestionForm from '../components/QuestionForm.tsx';

export default function QuestionBank() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const questions = useLiveQuery(
    () => db.questions.orderBy('createdAt').reverse().toArray(),
    []
  );

  const filteredQuestions = questions?.filter(q => 
    q.questionText.toLowerCase().includes(searchTerm.toLowerCase()) ||
    q.categories.some(c => c.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this question?')) {
      await db.questions.delete(id);
    }
  };

  const handleEdit = (question: Question) => {
    setEditingQuestion(question);
    setIsFormOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold text-slate-800">Question Bank</h1>
        <button
          onClick={() => { setEditingQuestion(null); setIsFormOpen(true); }}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Question
        </button>
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <QuestionForm
              initialData={editingQuestion || undefined}
              onClose={() => { setIsFormOpen(false); setEditingQuestion(null); }}
            />
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search questions or categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
            />
          </div>
        </div>

        <ul className="divide-y divide-slate-100">
          {filteredQuestions?.length === 0 ? (
            <li className="p-8 text-center text-slate-500">No questions found.</li>
          ) : (
            filteredQuestions?.map(q => (
              <li key={q.id} className="p-4 hover:bg-slate-50 transition-colors">
                <div className="flex justify-between gap-4">
                  <div className="flex-grow">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${q.type === 'mcq' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                        {q.type === 'mcq' ? 'Multiple Choice' : 'Text Input'}
                      </span>
                      {q.categories.map(cat => (
                        <span key={cat} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                          {cat}
                        </span>
                      ))}
                      {q.figureBase64 && (
                        <span className="flex items-center gap-1 text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full border border-indigo-100">
                          <ImageIcon className="w-3 h-3" /> Figure
                        </span>
                      )}
                    </div>
                    <p className="font-medium text-slate-800 mt-2">{q.questionText}</p>
                    <p className="text-sm text-slate-500 mt-1">
                      Answer: <span className="font-semibold">{q.type === 'mcq' ? q.options![parseInt(q.correctAnswer)] : q.correctAnswer}</span>
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button onClick={() => handleEdit(q)} className="text-slate-400 hover:text-indigo-600 p-1" title="Edit">
                      <Edit className="w-5 h-5" />
                    </button>
                    <button onClick={() => q.id && handleDelete(q.id)} className="text-slate-400 hover:text-red-600 p-1" title="Delete">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
