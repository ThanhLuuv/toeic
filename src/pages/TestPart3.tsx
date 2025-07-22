import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toeicPart3Data from '../data/toeic_part3.json';

// Tìm đề theo id trong tất cả levels
function findTestById(testId: string) {
  for (const levelKey of Object.keys(toeicPart3Data)) {
    const tests = (toeicPart3Data as any)[levelKey] || [];
    const found = tests.find((t: any) => String(t.id) === String(testId) || Number(t.id) === Number(testId));
    if (found) return { ...found, level: levelKey };
  }
  return null;
}

const TestPart3: React.FC = () => {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();
  const testData = testId ? findTestById(testId) : null;

  // Lấy danh sách id các đề trong cùng level
  let testIdsInLevel: string[] = [];
  if (testData) {
    const tests = (toeicPart3Data as any)[testData.level] || [];
    testIdsInLevel = tests.map((t: any) => String(t.id));
  }
  const currentIndex = testIdsInLevel.findIndex(id => id === String(testId));
  const nextTestId = currentIndex !== -1 && currentIndex < testIdsInLevel.length - 1 ? testIdsInLevel[currentIndex + 1] : null;

  const [answers, setAnswers] = useState<{ [idx: number]: string }>({});
  const [showResult, setShowResult] = useState(false);
  const [audioPlaying, setAudioPlaying] = useState(false);

  if (!testData) {
    return (
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-6 mt-8 text-center">
        <h2 className="text-xl font-bold mb-4 text-red-600">Không tìm thấy đề thi!</h2>
        <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded" onClick={() => navigate('/part3')}>Quay lại danh sách đề</button>
      </div>
    );
  }

  const handleSelect = (idx: number, choice: string) => {
    if (showResult) return;
    setAnswers((prev) => ({ ...prev, [idx]: choice }));
  };

  const handleSubmit = () => {
    setShowResult(true);
  };

  const correctCount = testData.questions.filter((q: any, i: number) => answers[i] === q.correctAnswer).length;

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-6 mt-8">
      <h2 className="text-xl font-bold mb-2">TOEIC Part 3: Đề {testData.id} - {testData.level}</h2>
      <div className="mb-4 text-gray-600">Audio hội thoại:</div>
      <div className="mb-4 flex items-center gap-3">
        <audio
          src={testData.audio}
          controls
          onPlay={() => setAudioPlaying(true)}
          onPause={() => setAudioPlaying(false)}
          className="w-full"
        />
      </div>
      {/* Nếu có transcript hoặc hội thoại, hiển thị ở đây */}
      {testData.audioScript && (
        <div className="bg-gray-50 rounded p-3 mb-4 text-sm font-mono whitespace-pre-line border border-gray-100">
          {String(testData.audioScript).split(/\n|\\n/).map((line: string, i: number) => (
            <div key={i}>{line}</div>
          ))}
        </div>
      )}
      <div className="mb-6">
        <div className="mb-2 font-semibold">Tiến độ: {Object.keys(answers).length} / {testData.questions.length} câu</div>
        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(Object.keys(answers).length / testData.questions.length) * 100}%` }}
          ></div>
        </div>
        {testData.questions.map((q: any, idx: number) => (
          <div key={idx} className="mb-6 p-4 rounded-lg border border-gray-100 bg-gray-50">
            <div className="font-medium mb-2">Câu {idx + 1}: {q.question}</div>
            <div className="flex flex-col gap-2">
              {Object.entries(q.choices).map(([key, value]) => (
                <button
                  key={key}
                  className={`text-left px-4 py-2 rounded border transition-all ${
                    answers[idx] === key
                      ? (showResult
                        ? (key === q.correctAnswer ? 'bg-green-100 border-green-400 text-green-800 font-semibold' : 'bg-red-100 border-red-400 text-red-800')
                        : 'bg-blue-100 border-blue-400 text-blue-800 font-semibold')
                      : 'bg-white border-gray-200 hover:bg-blue-50'
                  }`}
                  disabled={showResult}
                  onClick={() => handleSelect(idx, key)}
                >
                  <span className="font-bold mr-2">{key}.</span>
                  {showResult ? String(value) : ''}
                </button>
              ))}
            </div>
            {showResult && answers[idx] && (
              <div className={`mt-3 p-3 rounded text-sm ${answers[idx] === q.correctAnswer ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                <div><b>Đáp án đúng:</b> {q.correctAnswer}. {q.choices[q.correctAnswer as keyof typeof q.choices]}</div>
                <div><b>Giải thích:</b> {q.explanation}</div>
              </div>
            )}
          </div>
        ))}
      </div>
      {!showResult && (
        <button
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-all"
          onClick={handleSubmit}
          disabled={Object.keys(answers).length !== testData.questions.length}
        >
          Nộp bài
        </button>
      )}
      {showResult && (
        <div className="mt-6 p-4 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 text-center">
          <div className="text-lg font-bold mb-2">Kết quả: {correctCount} / {testData.questions.length} câu đúng</div>
          <div>{correctCount === testData.questions.length ? 'Xuất sắc! Bạn đã trả lời đúng tất cả.' : 'Hãy xem lại giải thích cho các câu sai nhé.'}</div>
          {nextTestId ? (
            <button
              className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              onClick={() => navigate(`/test-part3/${nextTestId}`)}
            >
              Làm đề tiếp theo
            </button>
          ) : (
            <button
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              onClick={() => navigate('/part3')}
            >
              Quay lại danh sách đề
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default TestPart3; 