import { useState, useRef } from 'react';
import { db } from '../db';
import { Download, Upload, AlertTriangle, CheckCircle } from 'lucide-react';

export default function BackupRestore() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  const handleExport = async () => {
    try {
      const questions = await db.questions.toArray();
      const exams = await db.exams.toArray();
      
      const backupData = {
        version: 1,
        timestamp: new Date().toISOString(),
        questions,
        exams,
      };

      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `examsim-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export failed", error);
      alert("Failed to export data.");
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setImportStatus(null);

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const data = JSON.parse(text);

        if (!data.questions || !data.exams) {
          throw new Error("Invalid backup file format.");
        }

        // Perform import in a transaction
        await db.transaction('rw', db.questions, db.exams, async () => {
          const questionIdMap = new Map<number, number>();

          if (data.questions && data.questions.length > 0) {
            for (const q of data.questions) {
              const oldId = q.id;
              // Remove the old ID so Dexie generates a new one
              delete q.id;
              const newId = await db.questions.add(q);
              if (oldId !== undefined) {
                questionIdMap.set(oldId, newId as number);
              }
            }
          }

          if (data.exams && data.exams.length > 0) {
            for (const e of data.exams) {
              delete e.id;
              // Update the questionIds in the exam to match the newly generated IDs
              e.questionIds = e.questionIds
                .map((oldId: number) => questionIdMap.get(oldId) !== undefined ? questionIdMap.get(oldId)! : null)
                .filter((id: number | null) => id !== null);
              await db.exams.add(e);
            }
          }
        });

        setImportStatus({ type: 'success', message: 'Data restored successfully!' });
      } catch (error: any) {
        console.error("Import failed", error);
        setImportStatus({ type: 'error', message: error.message || 'Failed to import data.' });
      } finally {
        setIsImporting(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Backup & Restore</h1>
        <p className="text-slate-600">Secure your data by downloading it to your device.</p>
      </div>

      {importStatus && (
        <div className={`p-4 rounded-lg flex items-center gap-3 ${
          importStatus.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {importStatus.type === 'success' ? <CheckCircle className="w-5 h-5 text-emerald-600" /> : <AlertTriangle className="w-5 h-5 text-red-600" />}
          <span className="font-medium">{importStatus.message}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-4">
            <Download className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold mb-2">Export Data</h2>
          <p className="text-slate-500 mb-6 text-sm">
            Download a JSON file containing all your questions, categories, and exams. Keep this file safe.
          </p>
          <button
            onClick={handleExport}
            className="w-full flex justify-center items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            <Download className="w-5 h-5" /> Download Backup
          </button>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mb-4">
            <Upload className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold mb-2">Restore Data</h2>
          <p className="text-slate-500 mb-6 text-sm">
            Upload a previously downloaded JSON backup file. <br />
            <strong className="text-emerald-600">Note: This will safely merge the uploaded data into your existing bank without overwriting anything.</strong>
          </p>
          <input
            type="file"
            accept=".json,application/json"
            className="hidden"
            ref={fileInputRef}
            onChange={handleImport}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isImporting}
            className="w-full flex justify-center items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Upload className="w-5 h-5" /> {isImporting ? 'Restoring...' : 'Upload Backup File'}
          </button>
        </div>
      </div>
    </div>
  );
}
