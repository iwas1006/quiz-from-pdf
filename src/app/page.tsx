'use client';
import React, { useState, useEffect } from "react";

type Question = {
  id: number;
  question: string;
  choices: string[];
  answer: number;
  explanations: string[];
};

export default function Home() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [started, setStarted] = useState(false);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [answers, setAnswers] = useState<{ selected: number | null; correct: boolean }[]>([]);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    fetch("/questions.json")
      .then((res) => res.json())
      .then((data) => setQuestions(data));
  }, []);

  const total = questions.length;

  // 문제풀이 시작
  const handleStart = () => {
    setStarted(true);
    setCurrent(0);
    setSelected(null);
    setShowExplanation(false);
    setAnswers([]);
    setStartTime(Date.now());
    setEndTime(null);
    setShowResult(false);
  };

  // 보기 선택
  const handleSelect = (idx: number) => {
    if (showExplanation) return;
    setSelected(idx);
  };

  // 보기 버튼 클릭(해설 보기)
  const handleShowExplanation = () => {
    if (selected === null) return;
    setShowExplanation(true);
    setAnswers((prev) => [
      ...prev,
      { selected, correct: selected === questions[current].answer },
    ]);
  };

  // 다음 문제로 이동
  const handleNext = () => {
    setSelected(null);
    setShowExplanation(false);
    if (current < total - 1) {
      setCurrent((c) => c + 1);
    } else {
      setEndTime(Date.now());
      setShowResult(true);
    }
  };

  // 다시 풀기
  const handleRetry = () => {
    handleStart();
  };

  // 결과 계산
  const correctCount = answers.filter((a) => a.correct).length;
  const wrongCount = answers.length - correctCount;
  const percent = total ? Math.round((correctCount / total) * 100) : 0;
  const elapsed = startTime && endTime ? Math.round((endTime - startTime) / 1000) : 0;

  if (questions.length === 0) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
        <div className="text-lg text-gray-500">문제 데이터를 불러오는 중...</div>
      </main>
    );
  }

  // UI 렌더링
  if (!started) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
        <button
          className="px-8 py-4 text-lg font-bold bg-blue-600 text-white rounded-full shadow-lg active:scale-95 transition-transform"
          onClick={handleStart}
        >
          문제 시작
        </button>
      </main>
    );
  }

  if (showResult) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
        <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md flex flex-col items-center">
          <h2 className="text-3xl font-extrabold mb-6 text-[#111]">결과</h2>
          <div className="text-xl font-bold mb-2 text-[#222]">총 문제: <span className="font-extrabold">{total}</span></div>
          <div className="text-xl font-bold mb-2 text-green-800">맞은 문제: <span className="font-extrabold">{correctCount}</span></div>
          <div className="text-xl font-bold mb-2 text-red-700">틀린 문제: <span className="font-extrabold">{wrongCount}</span></div>
          <div className="text-xl font-bold mb-2 text-blue-700">점수: <span className="font-extrabold">{percent}%</span></div>
          <div className="text-xl font-bold mb-4 text-[#333]">풀이 시간: <span className="font-extrabold">{elapsed}초</span></div>
          <button
            className="px-6 py-3 text-base font-bold bg-blue-600 text-white rounded-full shadow active:scale-95 transition-transform mt-2"
            onClick={handleRetry}
          >
            다시 풀기
          </button>
        </div>
      </main>
    );
  }

  const q = questions[current];
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-2">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md flex flex-col items-stretch min-h-[480px]">
        {/* 문제 영역: 항상 상단에 고정 */}
        <div className="w-full text-left mb-6 flex-shrink-0">
          <div className="text-sm text-gray-400 mb-1">{current + 1} / {total}</div>
          <div className="text-2xl font-bold text-[#111]">{q.question}</div>
        </div>
        {/* 보기 영역: 중간에 위치, 공간을 채움 */}
        <div className="w-full flex flex-col gap-3 mb-6 flex-grow">
          {q.choices.map((choice, idx) => (
            <button
              key={idx}
              className={`w-full py-4 px-2 rounded-xl border-2 text-lg font-semibold transition-all
                ${selected === idx ? "border-blue-600 bg-blue-100 text-blue-900" : "border-gray-300 bg-white text-[#222]"}
                ${showExplanation && idx === q.answer ? "border-green-600 bg-green-100 text-green-900" : ""}
                ${showExplanation && selected === idx && selected !== q.answer ? "border-red-600 bg-red-100 text-red-900" : ""}
                hover:bg-blue-50 active:scale-95
              `}
              style={{ minHeight: 56 }}
              disabled={showExplanation}
              onClick={() => handleSelect(idx)}
            >
              {idx + 1}. {choice}
            </button>
          ))}
        </div>
        {/* 해설 표시 */}
        {showExplanation && (
          <div className="w-full mb-4 flex-shrink-0">
            {q.choices.map((_, idx) => (
              <div
                key={idx}
                className={`text-sm mt-1 ${idx === q.answer ? "text-green-700" : (selected === idx ? "text-red-600" : "text-gray-500")}`}
              >
                {idx + 1}. {q.explanations[idx]}
              </div>
            ))}
          </div>
        )}
        {/* 버튼 영역: 항상 하단에 고정 */}
        <div className="flex w-full gap-2 mt-auto flex-shrink-0">
          <button
            className="flex-1 py-3 rounded-lg bg-gray-200 text-gray-700 font-bold disabled:opacity-50"
            onClick={handleShowExplanation}
            disabled={selected === null || showExplanation}
          >
            보기
          </button>
          <button
            className="flex-1 py-3 rounded-lg bg-blue-600 text-white font-bold disabled:opacity-50"
            onClick={handleNext}
            disabled={!showExplanation}
          >
            {current === total - 1 ? "결과 보기" : "다음"}
          </button>
        </div>
      </div>
    </main>
  );
}
