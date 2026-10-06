import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db';
import { Link } from 'react-router-dom';
import { Database, FilePlus } from 'lucide-react';

export default function Dashboard() {
  const stats = useLiveQuery(async () => {
    const questionsCount = await db.questions.count();
    const examsCount = await db.exams.count();
    return { questionsCount, examsCount };
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-slate-800">Welcome to ExamSim</h1>
      <p className="text-slate-600">Your personal offline question bank and exam simulator.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-4">
            <Database className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Question Bank</h2>
          <p className="text-slate-500 mb-4 flex-grow">
            Manage your questions. You currently have <span className="font-bold text-indigo-600">{stats?.questionsCount ?? '...'}</span> questions.
          </p>
          <Link to="/questions" className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-6 rounded-lg transition-colors">
            Manage Questions
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
            <FilePlus className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Test Builder & Simulator</h2>
          <p className="text-slate-500 mb-4 flex-grow">
            Create exams and practice. You have <span className="font-bold text-emerald-600">{stats?.examsCount ?? '...'}</span> exams.
          </p>
          <div className="flex gap-4">
            <Link to="/builder" className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
              Build Exam
            </Link>
            <Link to="/simulator" className="bg-slate-800 hover:bg-slate-900 text-white font-medium py-2 px-4 rounded-lg transition-colors">
              Practice
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
