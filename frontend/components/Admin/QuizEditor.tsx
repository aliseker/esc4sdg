'use client';

import { useMemo } from 'react';
import { Plus, Trash2, ChevronUp, ChevronDown } from 'lucide-react';

export type QuizOption = { id: string; text: string };
export type QuizQuestion = {
  id: string;
  prompt: string;
  options: QuizOption[];
  correctOptionId: string;
};

const OPTION_IDS = 'abcdefghijklmnopqrstuvwxyz'.split('');

export function parseQuizJson(value: string | undefined): QuizQuestion[] {
  if (!value?.trim()) return [];
  try {
    const data = JSON.parse(value) as { questions?: unknown[] };
    if (!Array.isArray(data.questions)) return [];
    return data.questions.map((q: unknown, i) => {
      const x = q as Record<string, unknown>;
      const id = typeof x.id === 'string' ? x.id : String(i + 1);
      const prompt = typeof x.prompt === 'string' ? x.prompt : '';
      const rawOptions = Array.isArray(x.options) ? x.options : [];
      const options: QuizOption[] = rawOptions.map((o: unknown, j) => {
        const opt = o as Record<string, unknown>;
        return {
          id: typeof opt.id === 'string' ? opt.id : OPTION_IDS[j] ?? String(j),
          text: typeof opt.text === 'string' ? opt.text : '',
        };
      });
      const correctOptionId = typeof x.correctOptionId === 'string' ? x.correctOptionId : (options[0]?.id ?? '');
      return { id, prompt, options, correctOptionId };
    });
  } catch {
    return [];
  }
}

export function serializeQuizJson(questions: QuizQuestion[]): string {
  const payload = {
    questions: questions.map((q) => ({
      id: q.id,
      prompt: q.prompt,
      options: q.options,
      correctOptionId: q.correctOptionId || q.options[0]?.id,
    })),
  };
  return JSON.stringify(payload, null, 2);
}

function nextQuestionId(questions: QuizQuestion[]): string {
  const nums = questions.map((q) => parseInt(q.id, 10)).filter((n) => !Number.isNaN(n));
  const max = nums.length ? Math.max(...nums) : 0;
  return String(max + 1);
}

function nextOptionId(options: QuizOption[]): string {
  const used = new Set(options.map((o) => o.id));
  for (const c of OPTION_IDS) {
    if (!used.has(c)) return c;
  }
  return String(options.length);
}

type QuizEditorProps = {
  value: string;
  onChange: (json: string) => void;
};

export function QuizEditor({ value, onChange }: QuizEditorProps) {
  const questions = useMemo(() => parseQuizJson(value), [value]);

  const updateQuestions = (next: QuizQuestion[]) => {
    onChange(serializeQuizJson(next));
  };

  const setQuestion = (index: number, patch: Partial<QuizQuestion>) => {
    const next = questions.map((q, i) => (i === index ? { ...q, ...patch } : q));
    updateQuestions(next);
  };

  const setQuestionPrompt = (index: number, prompt: string) => setQuestion(index, { prompt });
  const setQuestionOptions = (index: number, options: QuizOption[]) => setQuestion(index, { options });
  const setCorrectOption = (qIndex: number, correctOptionId: string) => setQuestion(qIndex, { correctOptionId });

  const setOptionText = (qIndex: number, optIndex: number, text: string) => {
    const q = questions[qIndex];
    const options = q.options.map((o, i) => (i === optIndex ? { ...o, text } : o));
    setQuestionOptions(qIndex, options);
  };

  const addOption = (qIndex: number) => {
    const q = questions[qIndex];
    const newId = nextOptionId(q.options);
    setQuestionOptions(qIndex, [...q.options, { id: newId, text: '' }]);
  };

  const removeOption = (qIndex: number, optIndex: number) => {
    const q = questions[qIndex];
    const options = q.options.filter((_, i) => i !== optIndex);
    const correctOptionId = q.correctOptionId === q.options[optIndex]?.id
      ? (options[0]?.id ?? '')
      : q.correctOptionId;
    updateQuestions(
      questions.map((qu, i) =>
        i === qIndex ? { ...qu, options, correctOptionId } : qu
      )
    );
  };

  const addQuestion = () => {
    const newQ: QuizQuestion = {
      id: nextQuestionId(questions),
      prompt: '',
      options: [{ id: 'a', text: '' }, { id: 'b', text: '' }],
      correctOptionId: 'a',
    };
    updateQuestions([...questions, newQ]);
  };

  const removeQuestion = (index: number) => {
    updateQuestions(questions.filter((_, i) => i !== index));
  };

  const moveQuestion = (index: number, delta: number) => {
    const to = index + delta;
    if (to < 0 || to >= questions.length) return;
    const next = [...questions];
    [next[index], next[to]] = [next[to], next[index]];
    updateQuestions(next);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-stone-700">Sorular</span>
        <button
          type="button"
          onClick={addQuestion}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-violet-300 text-violet-700 hover:bg-violet-50 text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Soru ekle
        </button>
      </div>

      {questions.length === 0 ? (
        <p className="text-sm text-stone-500 py-4 border border-dashed border-stone-200 rounded-xl text-center">
          Henüz soru yok. &quot;Soru ekle&quot; ile başlayın.
        </p>
      ) : (
        <div className="space-y-4">
          {questions.map((q, qIdx) => (
            <div
              key={q.id}
              className="rounded-xl border-2 border-stone-200 bg-white p-4 space-y-3"
            >
              {/* Sıra + kaldır */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => moveQuestion(qIdx, -1)}
                    disabled={qIdx === 0}
                    className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 disabled:opacity-30 disabled:pointer-events-none"
                    title="Yukarı taşı"
                  >
                    <ChevronUp className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveQuestion(qIdx, 1)}
                    disabled={qIdx === questions.length - 1}
                    className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 disabled:opacity-30 disabled:pointer-events-none"
                    title="Aşağı taşı"
                  >
                    <ChevronDown className="w-5 h-5" />
                  </button>
                  <span className="text-xs font-medium text-stone-400 ml-1">Soru {qIdx + 1}</span>
                </div>
                <button
                  type="button"
                  onClick={() => removeQuestion(qIdx)}
                  className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50"
                  title="Soruyu sil"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Soru metni */}
              <label className="block">
                <span className="text-xs font-medium text-stone-500">Soru metni</span>
                <textarea
                  value={q.prompt}
                  onChange={(e) => setQuestionPrompt(qIdx, e.target.value)}
                  placeholder="Soruyu yazın..."
                  className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
                  rows={2}
                />
              </label>

              {/* Şıklar */}
              <div>
                <span className="text-xs font-medium text-stone-500 block mb-2">Şıklar (doğru cevabı seçin)</span>
                <div className="space-y-2">
                  {q.options.map((opt, optIdx) => (
                    <div key={opt.id} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name={`q-${q.id}-correct`}
                        checked={q.correctOptionId === opt.id}
                        onChange={() => setCorrectOption(qIdx, opt.id)}
                        className="rounded-full border-stone-300 text-violet-600"
                        title="Doğru cevap"
                      />
                      <input
                        type="text"
                        value={opt.text}
                        onChange={(e) => setOptionText(qIdx, optIdx, e.target.value)}
                        placeholder={`Cevap ${opt.id}`}
                        className="flex-1 rounded-lg border border-stone-300 px-3 py-1.5 text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => removeOption(qIdx, optIdx)}
                        disabled={q.options.length <= 2}
                        className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 disabled:opacity-30 disabled:pointer-events-none"
                        title="Şıkkı sil"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => addOption(qIdx)}
                  className="mt-2 text-sm text-violet-600 hover:underline"
                >
                  + Şık ekle
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
