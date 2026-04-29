'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Genre =
  | 'fps'
  | 'moba'
  | 'battle_royale'
  | 'sports'
  | 'racing'
  | 'other';

type Preset = 'social' | 'standard' | 'extended';

const GENRE_OPTIONS: Array<{ value: Genre; label: string; hint: string }> = [
  { value: 'other', label: 'Auto-detect', hint: 'Let Gemini pick the prompt' },
  { value: 'fps', label: 'FPS / Shooter', hint: 'Halo, Valorant, Apex' },
  { value: 'battle_royale', label: 'Battle Royale', hint: 'Fortnite, Warzone' },
  { value: 'moba', label: 'MOBA', hint: 'LoL, Dota 2' },
  { value: 'sports', label: 'Sports (live)', hint: 'Soccer, basketball, esports' },
  { value: 'racing', label: 'Racing', hint: 'F1, Forza' },
];

const PRESET_OPTIONS: Array<{
  value: Preset;
  label: string;
  hint: string;
  defaultDuration: number;
}> = [
  { value: 'social', label: 'Social (9:16)', hint: 'Shorts / Reels / TikTok', defaultDuration: 60 },
  { value: 'standard', label: 'Standard (16:9)', hint: 'Dashboard + embed', defaultDuration: 90 },
  { value: 'extended', label: 'Extended (16:9)', hint: 'Longer recap for broadcast', defaultDuration: 180 },
];

export function GenerateHighlightButton({
  streamId,
  orgSlug,
  hasRecording,
  existingHighlights,
}: {
  streamId: string;
  orgSlug: string;
  hasRecording: boolean;
  existingHighlights: number;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [genre, setGenre] = useState<Genre>('other');
  const [preset, setPreset] = useState<Preset>('standard');
  const [duration, setDuration] = useState<number>(90);

  async function handleGenerate() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/dashboard/${orgSlug}/highlights`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          streamId,
          genre,
          outputPreset: preset,
          targetDurationSeconds: duration,
        }),
      });
      if (res.ok) {
        setOpen(false);
        router.push('/dashboard/highlights');
        router.refresh();
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || 'Failed to generate');
      }
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-1">
      <button
        onClick={() => setOpen(true)}
        disabled={!hasRecording}
        className="w-full rounded-lg bg-brand-600/20 text-brand-400 px-3 py-2 text-xs font-medium hover:bg-brand-600/30 transition-colors disabled:opacity-40"
      >
        {existingHighlights > 0 ? 'Generate new highlight' : 'Generate highlight'}
      </button>
      {!hasRecording && (
        <p className="text-xs text-white/20 text-center">Recording still processing</p>
      )}
      {open && (
        <GenerateModal
          genre={genre}
          setGenre={setGenre}
          preset={preset}
          setPreset={(p) => {
            setPreset(p);
            const opt = PRESET_OPTIONS.find((o) => o.value === p);
            if (opt) setDuration(opt.defaultDuration);
          }}
          duration={duration}
          setDuration={setDuration}
          loading={loading}
          error={error}
          onCancel={() => setOpen(false)}
          onConfirm={handleGenerate}
        />
      )}
    </div>
  );
}

function GenerateModal({
  genre,
  setGenre,
  preset,
  setPreset,
  duration,
  setDuration,
  loading,
  error,
  onCancel,
  onConfirm,
}: {
  genre: Genre;
  setGenre: (g: Genre) => void;
  preset: Preset;
  setPreset: (p: Preset) => void;
  duration: number;
  setDuration: (d: number) => void;
  loading: boolean;
  error: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-lg rounded-2xl border border-white/10 bg-surface-100 p-6 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          <h2 className="text-lg font-semibold">Generate AI highlight</h2>
          <p className="text-xs text-white/50 mt-1">
            Gemini 3.1 Pro will watch the full recording, pick the best
            moments with a genre-aware prompt, run a quality self-review,
            and render the reel in the chosen aspect ratio.
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium text-white/60">Game / content genre</label>
          <div className="grid grid-cols-2 gap-2">
            {GENRE_OPTIONS.map((opt) => (
              <label
                key={opt.value}
                className={`rounded-lg border px-3 py-2 text-left cursor-pointer transition-colors ${
                  genre === opt.value
                    ? 'border-brand-500/60 bg-brand-600/15'
                    : 'border-white/10 bg-surface-200 hover:border-white/20'
                }`}
              >
                <input
                  type="radio"
                  name="genre"
                  className="sr-only"
                  checked={genre === opt.value}
                  onChange={() => setGenre(opt.value)}
                />
                <div className="text-sm font-medium">{opt.label}</div>
                <div className="text-[10px] text-white/40">{opt.hint}</div>
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium text-white/60">Output preset</label>
          <div className="grid grid-cols-3 gap-2">
            {PRESET_OPTIONS.map((opt) => (
              <label
                key={opt.value}
                className={`rounded-lg border px-3 py-2 text-left cursor-pointer transition-colors ${
                  preset === opt.value
                    ? 'border-brand-500/60 bg-brand-600/15'
                    : 'border-white/10 bg-surface-200 hover:border-white/20'
                }`}
              >
                <input
                  type="radio"
                  name="preset"
                  className="sr-only"
                  checked={preset === opt.value}
                  onChange={() => setPreset(opt.value)}
                />
                <div className="text-sm font-medium">{opt.label}</div>
                <div className="text-[10px] text-white/40">{opt.hint}</div>
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium text-white/60 flex items-center justify-between">
            <span>Target duration</span>
            <span className="text-white/40">{duration}s</span>
          </label>
          <input
            type="range"
            min={30}
            max={240}
            step={15}
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            className="w-full accent-brand-500"
          />
          <div className="flex justify-between text-[10px] text-white/30">
            <span>0:30</span>
            <span>2:00</span>
            <span>4:00</span>
          </div>
        </div>

        {error && <p className="text-xs text-danger">{error}</p>}

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={onCancel}
            disabled={loading}
            className="rounded-lg border border-white/10 px-4 py-2 text-sm hover:bg-white/5 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="rounded-lg bg-brand-600 hover:bg-brand-500 px-4 py-2 text-sm font-medium transition-colors disabled:opacity-40"
          >
            {loading ? 'Generating...' : 'Generate highlight'}
          </button>
        </div>
      </div>
    </div>
  );
}
