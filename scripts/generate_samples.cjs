const fs = require('fs');

const generateQuestions = () => {
  const questions = [];
  const categoriesList = ['React', 'JavaScript', 'TypeScript', 'Web Dev', 'General Knowledge', 'Math'];
  
  for (let i = 1; i <= 100; i++) {
    const isMcq = Math.random() > 0.3; // 70% MCQ
    const randomCategory = categoriesList[Math.floor(Math.random() * categoriesList.length)];
    
    if (isMcq) {
      const optionsCount = Math.floor(Math.random() * 3) + 2; // 2 to 4 options
      const options = [];
      for (let j = 0; j < optionsCount; j++) {
        options.push(`Option ${j + 1} for Question ${i}`);
      }
      const correctIndex = Math.floor(Math.random() * optionsCount);
      
      questions.push({
        type: 'mcq',
        questionText: `Sample Multiple Choice Question ${i}: What is the correct option?`,
        options: options,
        correctAnswer: correctIndex.toString(),
        categories: [randomCategory],
        explanation: `The correct answer is Option ${correctIndex + 1} because it is a sample.`,
        createdAt: new Date().toISOString()
      });
    } else {
      questions.push({
        type: 'text',
        questionText: `Sample Text Question ${i}: Type the number ${i} in words or digits.`,
        options: null,
        correctAnswer: i.toString(),
        categories: [randomCategory, 'Text Based'],
        explanation: `You just need to type ${i}.`,
        createdAt: new Date().toISOString()
      });
    }
  }
  return questions;
};

const backupData = {
  version: 1,
  timestamp: new Date().toISOString(),
  questions: generateQuestions(),
  exams: []
};

fs.writeFileSync('sample_100_questions.json', JSON.stringify(backupData, null, 2));
console.log('Successfully generated sample_100_questions.json with 100 questions.');
