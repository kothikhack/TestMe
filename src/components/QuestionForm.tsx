import { useState, useEffect } from 'react';
import { db, type Question } from '../db';
import { X, Plus, Trash2 } from 'lucide-react';

interface Props {
  initialData?: Question;
  onClose: () => void;
}

export default function QuestionForm({ initialData, onClose }: Props) {
  const [type, setType] = useState<'mcq' | 'text'>(initialData?.type || 'mcq');
  const [questionText, setQuestionText] = useState(initialData?.questionText || '');
  const [options, setOptions] = useState<string[]>(initialData?.options || ['', '']);
  const [correctAnswer, setCorrectAnswer] = useState<string>(initialData?.correctAnswer || '0');
  const [categoriesStr, setCategoriesStr] = useState(initialData?.categories.join(', ') || '');
  const [explanation, setExplanation] = useState(initialData?.explanation || '');

  // Ensure correctAnswer is valid when type changes
  useEffect(() => {
    if (type === 'mcq' && !initialData) {
      setCorrectAnswer('0');
    } else if (type === 'text' && !initialData) {
      setCorrectAnswer('');
    }
  }, [type, initialData]);

  const handleAddOption = () => {
    if (options.length < 6) {
      setOptions([...options, '']);
    }
  };

  const handleRemoveOption = (index: number) => {
    if (options.length > 2) {
      const newOptions = options.filter((_, i) => i !== index);
      setOptions(newOptions);
      if (parseInt(correctAnswer) >= newOptions.length) {
        setCorrectAnswer('0');
      }
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const categories = categoriesStr
      .split(',')
      .map(c => c.trim())
      .filter(c => c.length > 0);

    const questionData: Question = {
      type,
      questionText,
      options: type === 'mcq' ? options : null,
      correctAnswer,
      categories,
      explanation,
      createdAt: initialData?.createdAt || new Date(),
    };

    if (initialData?.id) {
      await db.questions.update(initialData.id, questionData as any);
    } else {
      await db.questions.add(questionData);
    }

    onClose();
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center p-6 border-b border-slate-200">
        <h2 className="text-xl font-bold text-slate-800">
          {initialData ? 'Edit Question' : 'Add New Question'}
        </h2>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
          <X className="w-6 h-6" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-grow">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Question Type</label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={type === 'mcq'}
                onChange={() => setType('mcq')}
                className="text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm">Multiple Choice</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={type === 'text'}
                onChange={() => setType('text')}
                className="text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm">Text Input</span>
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Question Text</label>
          <textarea
            required
            rows={3}
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Enter your question here..."
          />
        </div>

        {type === 'mcq' ? (
          <div className="space-y-3">
            <label className="block text-sm font-medium text-slate-700">Options (Select Correct Answer)</label>
            {options.map((opt, index) => (
              <div key={index} className="flex items-center gap-3">
                <input
                  type="radio"
                  name="correctAnswer"
                  checked={correctAnswer === index.toString()}
                  onChange={() => setCorrectAnswer(index.toString())}
                  className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                  required
                />
                <input
                  type="text"
                  required
                  value={opt}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  className="flex-grow p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder={`Option ${index + 1}`}
                />
                {options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveOption(index)}
                    className="p-2 text-slate-400 hover:text-red-600"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>
            ))}
            {options.length < 6 && (
              <button
                type="button"
                onClick={handleAddOption}
                className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
              >
                <Plus className="w-4 h-4" /> Add Option
              </button>
            )}
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Correct Answer (Exact Match)</label>
            <input
              type="text"
              required
              value={correctAnswer}
              onChange={(e) => setCorrectAnswer(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g. 42, Paris, true"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Categories (Comma separated)</label>
          <input
            type="text"
            value={categoriesStr}
            onChange={(e) => setCategoriesStr(e.target.value)}
            className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            placeholder="e.g. Math, Geometry, Hard"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Explanation (Optional)</label>
          <textarea
            rows={2}
            value={explanation}
            onChange={(e) => setExplanation(e.target.value)}
            className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            placeholder="Explain the correct answer..."
          />
        </div>

        <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg font-medium transition-colors"
          >
            Save Question
          </button>
        </div>
      </form>
    </div>
  );
}
