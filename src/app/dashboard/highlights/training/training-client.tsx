'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';

interface TrainingExample {
  id: string;
  game_title: string;
  genre: string;
  source_video_gcs_uri: string | null;
  highlight_video_gcs_uri: string | null;
  highlight_segments:
    | Array<{ start?: number; end?: number; score?: number; label?: string }>
    | null;
  created_at: string;
}

const GENRE_OPTIONS: Array<{ value: string; label: string }> = [
  { value: 'fps', label: 'FPS / Shooter' },
  { value: 'moba', label: 'MOBA' },
  { value: 'battle_royale', label: 'Battle Royale' },
  { value: 'sports', label: 'Sports (live broadcast)' },
  { value: 'racing', label: 'Racing' },
  { value: 'rpg', label: 'RPG' },
  { value: 'strategy', label: 'Strategy' },
  { value: 'fighting', label: 'Fighting' },
  { value: 'simulation', label: 'Simulation' },
  { value: 'other', label: 'Other' },
];

export default function TrainingClient({ slug }: { slug: string }) {
  const [examples, setExamples] = useState<TrainingExample[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [message, setMessage] = useState('');

  const [gameTitle, setGameTitle] = useState('');
  const [genre, setGenre] = useState('other');
  const [sourceUri, setSourceUri] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const fetchExamples = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/dashboard/${slug}/highlights/training/examples`);
      if (res.ok) {
        const data = await res.json();
        setExamples(Array.isArray(data) ? data : (data?.examples ?? []));
      } else {
        const err = await res.json().catch(() => ({}));
        setMessage(err.error || 'Failed to load examples');
      }
    } catch {
      setMessage('Service unreachable');
    }
    setLoading(false);
  }, [slug]);

  useEffect(() => {
    fetchExamples();
  }, [fetchExamples]);

  const handleUpload = async () => {
    if (!file || !gameTitle) {
      setMessage('Pick a video file and enter a game title.');
      return;
    }

    setUploading(true);
    setMessage('');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('game_title', gameTitle);
    formData.append('genre', genre);
    if (sourceUri) formData.append('source_video_uri', sourceUri);

    try {
      const res = await fetch(`/api/dashboard/${slug}/highlights/training/upload`, {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        setMessage('Training example uploaded — feeding into the fine-tuning dataset.');
        setFile(null);
        setGameTitle('');
        setSourceUri('');
        fetchExamples();
      } else {
        const err = await res.json().catch(() => ({}));
        setMessage(`Upload failed: ${err.detail || err.error || 'Unknown error'}`);
      }
    } catch {
      setMessage('Upload failed: service unreachable');
    }
    setUploading(false);
  };

  const handleExport = async () => {
    setExporting(true);
    setMessage('');
    try {
      const res = await fetch(`/api/dashboard/${slug}/highlights/training/export`, {
        method: 'POST',
      });
      if (res.ok) {
        const data = await res.json();
        setMessage(
          `Dataset exported — ${data.train_examples} train + ${data.validation_examples} validation examples. Train URI: ${data.train_uri}`,
        );
      } else {
        const err = await res.json().catch(() => ({}));
        setMessage(`Export failed: ${err.detail || err.error || 'Unknown error'}`);
      }
    } catch {
      setMessage('Export failed: service unreachable');
    }
    setExporting(false);
  };

  return (
    <div className="p-6 space-y-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/highlights"
          className="text-sm text-white/40 hover:text-white transition-colors"
        >
          &larr; Highlights
        </Link>
        <span className="text-white/20">/</span>
        <h1 className="text-2xl font-bold">Training Data</h1>
      </div>

      <p className="text-sm text-white/50 max-w-2xl">
        Upload known-good highlight reels to feed the fine-tuning dataset, or
        export the collected examples as a Vertex AI supervised-tuning JSONL.
        The runtime Gemini scorer uses the tuned model once you deploy it.
      </p>

      {message && (
        <div className="rounded-lg border border-white/10 bg-surface-100 px-4 py-3 text-sm">
          {message}
        </div>
      )}

      <section className="rounded-xl border border-white/10 bg-surface-100 p-6 space-y-4">
        <h2 className="text-lg font-semibold">Upload highlight example</h2>
        <p className="text-sm text-white/40">
          Upload a clip you consider a great highlight. Optionally include
          the source recording URI so we can learn which segments were picked.
        </p>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-medium text-white/60">Game / broadcast *</label>
            <input
              type="text"
              value={gameTitle}
              onChange={(e) => setGameTitle(e.target.value)}
              placeholder="e.g. Halo Infinite, Northfield vs Harbor FC"
              className="w-full rounded-lg border border-white/10 bg-surface-200 px-3 py-2 text-sm focus:outline-none focus:border-brand-500"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-white/60">Genre</label>
            <select
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-surface-200 px-3 py-2 text-sm focus:outline-none focus:border-brand-500"
            >
              {GENRE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium text-white/60">
            Source recording URI (optional)
          </label>
          <input
            type="text"
            value={sourceUri}
            onChange={(e) => setSourceUri(e.target.value)}
            placeholder="gs://bucket/path/to/full-recording.mp4"
            className="w-full rounded-lg border border-white/10 bg-surface-200 px-3 py-2 text-sm focus:outline-none focus:border-brand-500"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium text-white/60">Highlight video *</label>
          <input
            type="file"
            accept="video/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="w-full rounded-lg border border-white/10 bg-surface-200 px-3 py-2 text-sm file:mr-3 file:bg-brand-600/20 file:text-brand-400 file:border-0 file:rounded file:px-3 file:py-1 file:text-xs"
          />
        </div>

        <button
          onClick={handleUpload}
          disabled={uploading || !file || !gameTitle}
          className="rounded-lg bg-brand-600 hover:bg-brand-500 disabled:opacity-40 disabled:hover:bg-brand-600 px-4 py-2 text-sm font-medium transition-colors"
        >
          {uploading ? 'Uploading...' : 'Upload example'}
        </button>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Collected examples</h2>
          <div className="flex gap-2">
            <button
              onClick={fetchExamples}
              disabled={loading}
              className="rounded-lg border border-white/10 px-3 py-1.5 text-xs hover:bg-surface-200 transition-colors"
            >
              {loading ? 'Loading...' : 'Refresh'}
            </button>
            <button
              onClick={handleExport}
              disabled={exporting || examples.length < 10}
              title={examples.length < 10 ? 'Need at least 10 examples to export' : ''}
              className="rounded-lg bg-brand-600/20 text-brand-400 border border-brand-500/30 px-3 py-1.5 text-xs hover:bg-brand-600/30 transition-colors disabled:opacity-40"
            >
              {exporting ? 'Exporting...' : 'Export dataset'}
            </button>
          </div>
        </div>

        {examples.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-surface-100 px-5 py-12 text-center space-y-2">
            <p className="text-white/40 text-sm">No training examples yet.</p>
            <p className="text-xs text-white/30">
              Upload highlight reels above, or thumbs-up a generated reel on
              the detail page to auto-collect training data.
            </p>
          </div>
        ) : (
          <div className="rounded-xl border border-white/10 bg-surface-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-white/40 border-b border-white/5">
                  <th className="px-5 py-2.5 font-medium">Title</th>
                  <th className="px-3 py-2.5 font-medium">Genre</th>
                  <th className="px-3 py-2.5 font-medium">Segments</th>
                  <th className="px-3 py-2.5 font-medium">Source</th>
                  <th className="px-3 py-2.5 font-medium">Created</th>
                </tr>
              </thead>
              <tbody>
                {examples.map((ex) => (
                  <tr key={ex.id} className="border-b border-white/5">
                    <td className="px-5 py-2.5 font-medium">{ex.game_title}</td>
                    <td className="px-3 py-2.5 text-white/60">{ex.genre}</td>
                    <td className="px-3 py-2.5 text-white/60">
                      {ex.highlight_segments?.length || 0}
                    </td>
                    <td className="px-3 py-2.5 text-xs text-white/40">
                      {ex.source_video_gcs_uri ? 'linked' : '—'}
                    </td>
                    <td className="px-3 py-2.5 text-xs text-white/40">
                      {new Date(ex.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
