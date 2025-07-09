'use client';

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-red-50">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md flex flex-col items-center">
        <h2 className="text-2xl font-bold mb-4 text-red-600">에러 발생</h2>
        <div className="text-gray-700 mb-4">{error.message}</div>
        <button
          className="px-6 py-3 text-base font-bold bg-blue-600 text-white rounded-full shadow active:scale-95 transition-transform mt-2"
          onClick={() => reset()}
        >
          새로고침
        </button>
      </div>
    </main>
  );
} 