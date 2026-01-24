const { useState, useEffect } = React;

// Icon components
const Heart = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
  </svg>
);

const Sparkles = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
    <path d="M5 3v4"/>
    <path d="M19 17v4"/>
    <path d="M3 5h4"/>
    <path d="M17 19h4"/>
  </svg>
);

const ArrowRight = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M5 12h14"/>
    <path d="m12 5 7 7-7 7"/>
  </svg>
);

function MBTIQuiz() {
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [scores, setScores] = useState({ E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 });
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    // Your published Google Sheet URL (converted to CSV)
    const publishedUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTl7KuGBmEGEHqavwmPHRCLRvFHwvzSKVcKMRCEw0aWPej50cAVUrA_Oh1PIMSY6yKL4B8OEh7tqR1d/pub?output=csv';
    
    try {
      const response = await fetch(publishedUrl);
      if (!response.ok) throw new Error('Failed to fetch questions');
      
      const csvText = await response.text();
      
      // Parse CSV
      const lines = csvText.split('\n');
      const parsedQuestions = [];
      
      // Skip header row (index 0), process data rows
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        // Simple CSV parsing (handles quoted fields)
        const row = [];
        let current = '';
        let inQuotes = false;
        
        for (let j = 0; j < line.length; j++) {
          const char = line[j];
          if (char === '"') {
            inQuotes = !inQuotes;
          } else if (char === ',' && !inQuotes) {
            row.push(current.trim());
            current = '';
          } else {
            current += char;
          }
        }
        row.push(current.trim());
        
        if (row[0]) {
          parsedQuestions.push({
            question: row[0],
            options: [
              { text: row[1], trait: row[2] },
              { text: row[3], trait: row[4] },
              { text: row[5], trait: row[6] },
              { text: row[7], trait: row[8] }
            ].filter(opt => opt.text && opt.trait)
          });
        }
      }
      
      setQuestions(parsedQuestions);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleAnswer = (trait) => {
    const letter = trait.charAt(0);
    const value = parseInt(trait.substring(1));
    
    setScores(prev => ({
      ...prev,
      [letter]: prev[letter] + value
    }));

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      setShowResults(true);
    }
  };

  const getMBTI = () => {
    return (
      (scores.E > scores.I ? 'E' : 'I') +
      (scores.S > scores.N ? 'S' : 'N') +
      (scores.T > scores.F ? 'T' : 'F') +
      (scores.J > scores.P ? 'J' : 'P')
    );
  };

  const getTypeDescription = (type) => {
    const descriptions = {
      'INTJ': 'The Architect - Strategic, logical, and independent thinkers',
      'INTP': 'The Logician - Innovative, curious, and analytical problem-solvers',
      'ENTJ': 'The Commander - Bold, strategic, and natural-born leaders',
      'ENTP': 'The Debater - Quick-witted, clever, and love intellectual challenges',
      'INFJ': 'The Advocate - Idealistic, compassionate, and insightful',
      'INFP': 'The Mediator - Poetic, kind, and altruistic dreamers',
      'ENFJ': 'The Protagonist - Charismatic, inspiring, and natural leaders',
      'ENFP': 'The Campaigner - Enthusiastic, creative, and sociable free spirits',
      'ISTJ': 'The Logistician - Practical, fact-minded, and reliable',
      'ISFJ': 'The Defender - Dedicated, warm, and protective caregivers',
      'ESTJ': 'The Executive - Organized, traditional, and excellent administrators',
      'ESFJ': 'The Consul - Caring, social, and popular helpers',
      'ISTP': 'The Virtuoso - Bold, practical, and masters of tools',
      'ISFP': 'The Adventurer - Charming, flexible, and artistic explorers',
      'ESTP': 'The Entrepreneur - Smart, energetic, and perceptive risk-takers',
      'ESFP': 'The Entertainer - Spontaneous, enthusiastic, and life of the party'
    };
    return descriptions[type] || 'A unique personality type';
  };

  const restartQuiz = () => {
    setCurrentQuestion(0);
    setScores({ E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 });
    setShowResults(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <Sparkles className="w-16 h-16 text-purple-600 animate-pulse mx-auto mb-4" />
          <p className="text-xl text-gray-700">Loading your magical personality quiz...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 flex items-center justify-center p-8">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <p className="text-red-600 text-lg mb-4">Error loading quiz: {error}</p>
          <button
            onClick={fetchQuestions}
            className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (showResults) {
    const mbtiType = getMBTI();
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 flex items-center justify-center p-8">
        <div className="bg-white rounded-2xl shadow-2xl p-12 max-w-2xl w-full text-center">
          <Sparkles className="w-20 h-20 text-purple-600 mx-auto mb-6 animate-bounce" />
          <h1 className="text-5xl font-bold text-gray-800 mb-4">Your Personality Type</h1>
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-7xl font-bold py-8 px-6 rounded-xl mb-6 shadow-lg">
            {mbtiType}
          </div>
          <p className="text-2xl text-gray-700 mb-8">{getTypeDescription(mbtiType)}</p>
          
          <div className="grid grid-cols-2 gap-4 mb-8 text-left">
            <div className="bg-purple-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Energy</p>
              <p className="text-xl font-bold text-purple-700">
                {scores.E > scores.I ? `Extraversion (${scores.E})` : `Introversion (${scores.I})`}
              </p>
            </div>
            <div className="bg-pink-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Information</p>
              <p className="text-xl font-bold text-pink-700">
                {scores.S > scores.N ? `Sensing (${scores.S})` : `Intuition (${scores.N})`}
              </p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Decisions</p>
              <p className="text-xl font-bold text-blue-700">
                {scores.T > scores.F ? `Thinking (${scores.T})` : `Feeling (${scores.F})`}
              </p>
            </div>
            <div className="bg-indigo-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Lifestyle</p>
              <p className="text-xl font-bold text-indigo-700">
                {scores.J > scores.P ? `Judging (${scores.J})` : `Perceiving (${scores.P})`}
              </p>
            </div>
          </div>

          <button
            onClick={restartQuiz}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:from-purple-700 hover:to-pink-700 transform hover:scale-105 transition-all shadow-lg"
          >
            Take Quiz Again
          </button>
        </div>
      </div>
    );
  }

  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-3xl w-full">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">
              Question {currentQuestion + 1} of {questions.length}
            </span>
            <Heart />
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-gray-800 mb-8 leading-relaxed">
          {question.question}
        </h2>

        <div className="space-y-4">
          {question.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswer(option.trait)}
              className="w-full text-left p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border-2 border-transparent hover:border-purple-400 hover:shadow-lg transform hover:scale-102 transition-all group"
            >
              <div className="flex items-center justify-between">
                <span className="text-gray-700 text-lg pr-4 group-hover:text-gray-900">
                  {option.text}
                </span>
                <ArrowRight className="w-6 h-6 text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

ReactDOM.render(<MBTIQuiz />, document.getElementById('root'));
