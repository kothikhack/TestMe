import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import QuestionBank from './pages/QuestionBank';
import TestBuilder from './pages/TestBuilder';
import ExamSimulator from './pages/ExamSimulator';
import BackupRestore from './pages/BackupRestore';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="questions" element={<QuestionBank />} />
          <Route path="builder" element={<TestBuilder />} />
          <Route path="builder/:examId" element={<TestBuilder />} />
          <Route path="simulator" element={<ExamSimulator />} />
          <Route path="simulator/:examId" element={<ExamSimulator />} />
          <Route path="backup" element={<BackupRestore />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
