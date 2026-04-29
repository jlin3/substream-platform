'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';

interface HighlightJob {
  job_id: string;
  status: string;
  highlight_url: string | null;
  metadata: {
    model_used?: string;
    source_duration?: number;
    highlight_duration?: number;
    segments_analyzed?: number;
    segments_selected?: number;
    processing_time_seconds?: number;
    review_score?: number | null;
    game_detected?: string | null;
    genre_detected?: string | null;
  } | null;
  segments?: Array<{
    start_time: number;
    end_time: number;
    duration: number;
    score: number;
    label: string;
  }> | null;
}

export default function CompareClient({ slug }: { slug: string }) {
  const [jobs, setJobs] = useState<HighlightJob[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedA, setSelectedA] = useState<HighlightJob | null>(null);
  const [selectedB, setSelectedB] = useState<HighlightJob | null>(null);
  const [voteA, setVoteA] = useState(0);
  const [voteB, setVoteB] = useState(0);
  const [message, setMessage] = useState('');

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    setMessage('');
    try {
      const res = await fetch(`/api/dashboard/${slug}/highlights/service-jobs`);
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data?.jobs) ? data.jobs : [];
        setJobs(list.filter((j: HighlightJob) => j.status === 'completed'));
      } else {
        const err = await res.json().catch(() => ({}));
        setMessage(err.error || 'Failed to load highlight jobs');
      }
    } catch {
      setMessage('Highlight service unreachable');
    }
    setLoading(false);
  }, [slug]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const submitVote = async (winner: 'a' | 'b') => {
    const winnerJob = winner === 'a' ? selectedA : selectedB;
    const loserJob = winner === 'a' ? selectedB : selectedA;

    if (winnerJob) {
      fetch(`/api/dashboard/${slug}/highlights/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId: winnerJob.job_id,
          rating: 'good',
          notes: loserJob ? `Won comparison vs ${loserJob.job_id}` : 'Manual thumbs-up',
        }),
      }).catch(() => {});
    }
    if (loserJob) {
      fetch(`/api/dashboard/${slug}/highlights/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId: loserJob.job_id,
          rating: 'bad',
          notes: winnerJob ? `Lost comparison vs ${winnerJob.job_id}` : 'Manual thumbs-down',
        }),
      }).catch(() => {});
    }

    if (winner === 'a') setVoteA((v) => v + 1);
    else setVoteB((v) => v + 1);
  };

  return (
    <div className="p-6 space-y-8 max-w-6xl mx-auto">
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/highlights"
          className="text-sm text-white/40 hover:text-white transition-colors"
        >
          &larr; Highlights
        </Link>
        <span className="text-white/20">/</span>
        <h1 className="text-2xl font-bold">Quality Comparison</h1>
      </div>

      <p className="text-sm text-white/50 max-w-2xl">
        Compare highlight reels side-by-side and vote on which is better.
        Votes feed back into the training dataset — thumbs-up jobs become
        positive examples in the next fine-tuning export.
      </p>

      {message && (
        <div className="rounded-lg border border-white/10 bg-surface-100 px-4 py-3 text-sm text-white/70">
          {message}
        </div>
      )}

      {jobs.length === 0 ? (
        <div className="rounded-xl border border-white/10 bg-surface-100 px-5 py-12 text-center space-y-3">
          <p className="text-white/40 text-sm">No completed highlights to compare yet.</p>
          <button
            onClick={fetchJobs}
            disabled={loading}
            className="rounded-lg bg-brand-600 hover:bg-brand-500 px-4 py-2 text-sm font-medium transition-colors"
          >
            {loading ? 'Loading...' : 'Reload jobs'}
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid sm:grid-cols-2 gap-4">
            <JobPicker
              label="Highlight A"
              jobs={jobs}
              selected={selectedA}
              onChange={setSelectedA}
            />
            <JobPicker
              label="Highlight B"
              jobs={jobs}
              selected={selectedB}
              onChange={setSelectedB}
            />
          </div>

          {selectedA && selectedB && (
            <>
              <div className="grid lg:grid-cols-2 gap-4">
                <ReelCard label="Highlight A" job={selectedA} />
                <ReelCard label="Highlight B" job={selectedB} />
              </div>

              <div className="flex items-center justify-center gap-6 rounded-xl border border-white/10 bg-surface-100 px-6 py-4">
                <button
                  onClick={() => submitVote('a')}
                  className="rounded-lg bg-brand-600/20 text-brand-400 border border-brand-500/30 px-6 py-2 text-sm font-medium hover:bg-brand-600/30 transition-colors"
                >
                  A is better ({voteA})
                </button>
                <span className="text-white/30 text-sm">vs</span>
                <button
                  onClick={() => submitVote('b')}
                  className="rounded-lg bg-brand-600/20 text-brand-400 border border-brand-500/30 px-6 py-2 text-sm font-medium hover:bg-brand-600/30 transition-colors"
                >
                  B is better ({voteB})
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function JobPicker({
  label,
  jobs,
  selected,
  onChange,
}: {
  label: string;
  jobs: HighlightJob[];
  selected: HighlightJob | null;
  onChange: (j: HighlightJob | null) => void;
}) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-medium text-white/60">{label}</label>
      <select
        value={selected?.job_id ?? ''}
        onChange={(e) => onChange(jobs.find((j) => j.job_id === e.target.value) || null)}
        className="w-full rounded-lg border border-white/10 bg-surface-200 px-3 py-2 text-sm focus:outline-none focus:border-brand-500"
      >
        <option value="">Select a highlight...</option>
        {jobs.map((j) => (
          <option key={j.job_id} value={j.job_id}>
            {j.job_id.slice(0, 8)} — {j.metadata?.model_used || 'unknown model'} (
            {j.metadata?.game_detected || j.metadata?.genre_detected || 'unknown'})
          </option>
        ))}
      </select>
    </div>
  );
}

function ReelCard({ label, job }: { label: string; job: HighlightJob }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">
          {label}
          {job.metadata?.model_used && (
            <span className="ml-2 text-xs text-white/40 font-normal">
              {job.metadata.model_used}
            </span>
          )}
        </h3>
        {typeof job.metadata?.review_score === 'number' && (
          <span className="text-xs text-brand-400">
            Quality review: {job.metadata.review_score}/100
          </span>
        )}
      </div>
      <div className="rounded-xl border border-white/10 bg-surface-100 overflow-hidden">
        {job.highlight_url ? (
          <video src={job.highlight_url} controls className="w-full aspect-video" />
        ) : (
          <div className="aspect-video bg-surface-300 flex items-center justify-center">
            <p className="text-xs text-white/30">Video unavailable</p>
          </div>
        )}
      </div>
      <MetadataBar job={job} />
    </div>
  );
}

function MetadataBar({ job }: { job: HighlightJob }) {
  if (!job.metadata) return null;
  const m = job.metadata;
  return (
    <div className="flex flex-wrap gap-3 text-xs text-white/40">
      {typeof m.highlight_duration === 'number' && (
        <span>{Math.round(m.highlight_duration)}s reel</span>
      )}
      {typeof m.segments_selected === 'number' && (
        <span>{m.segments_selected} segments</span>
      )}
      {typeof m.processing_time_seconds === 'number' && (
        <span>{Math.round(m.processing_time_seconds)}s processing</span>
      )}
      {m.game_detected && <span>{m.game_detected}</span>}
      {m.genre_detected && <span>genre: {m.genre_detected}</span>}
    </div>
  );
}
