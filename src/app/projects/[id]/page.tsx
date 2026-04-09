"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Deal,
  MemberStats,
  DealStatus,
  DEAL_STAGES,
  STAGE_LABELS,
  STAGE_COLORS,
  formatDZD,
  getStageIndex,
  validateStageTransition,
} from "@/lib/types";
import Link from "next/link";

export default function ProjectDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const [deal, setDeal] = useState<Deal | null>(null);
  const [members, setMembers] = useState<MemberStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Edit state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [value, setValue] = useState("");
  const [closerId, setCloserId] = useState("");
  const [workers, setWorkers] = useState<{ member_id: string; share: number }[]>([]);

  // Cash transaction data (for completed deals)
  const [cashTx, setCashTx] = useState<{ member_id: string | null; amount: number; bucket: string }[]>([]);
  const [pointEntries, setPointEntries] = useState<{ member_id: string; points: number; type: string }[]>([]);

  useEffect(() => {
    Promise.all([
      fetch(`/api/deals/${id}`).then((r) => r.json()),
      fetch("/api/members").then((r) => r.json()),
    ]).then(([dealData, membersData]) => {
      setDeal(dealData);
      setMembers(Array.isArray(membersData) ? membersData : []);
      setTitle(dealData.title || "");
      setDescription(dealData.description || "");
      setValue(dealData.value ? String(dealData.value) : "");
      setCloserId(dealData.closer_id || "");
      setWorkers(
        (dealData.workers || dealData.deal_workers || []).map((w: { member_id: string; share: number }) => ({
          member_id: w.member_id,
          share: w.share || 1,
        }))
      );
      setCashTx(dealData.cash_transactions || []);
      setPointEntries(dealData.point_entries || []);
      setLoading(false);
    });
  }, [id]);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(`/api/deals/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          value: value ? Number(value) : null,
          closer_id: closerId || null,
          workers,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to save");
        return;
      }

      const updated = await res.json();
      setDeal(updated);
      setSuccess("Saved successfully");
      setTimeout(() => setSuccess(null), 3000);
    } catch {
      setError("Network error");
    } finally {
      setSaving(false);
    }
  };

  const handleAdvance = async () => {
    if (!deal) return;
    const currentIdx = getStageIndex(deal.status);
    if (currentIdx >= DEAL_STAGES.length - 1) return;
    const nextStatus = DEAL_STAGES[currentIdx + 1];

    // Pre-validate
    const effectiveCloser = closerId || deal.closer_id;
    const effectiveValue = value ? Number(value) : deal.value;
    const effectiveWorkers = workers.length > 0 ? workers : (deal.workers || []);

    const validationError = validateStageTransition(
      { closer_id: effectiveCloser || null, value: effectiveValue },
      effectiveWorkers,
      nextStatus
    );

    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(`/api/deals/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          value: value ? Number(value) : null,
          closer_id: closerId || null,
          workers,
          status: nextStatus,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to advance stage");
        return;
      }

      const updated = await res.json();
      setDeal(updated);
      setCashTx(updated.cash_transactions || []);
      setPointEntries(updated.point_entries || []);
      setSuccess(`Advanced to ${STAGE_LABELS[nextStatus]}`);

      if (nextStatus === "done") {
        // Refresh to get cash and point data
        const refreshed = await fetch(`/api/deals/${id}`).then((r) => r.json());
        setCashTx(refreshed.cash_transactions || []);
        setPointEntries(refreshed.point_entries || []);
      }

      setTimeout(() => setSuccess(null), 3000);
    } catch {
      setError("Network error");
    } finally {
      setSaving(false);
    }
  };

  const addWorker = (memberId: string) => {
    if (!memberId || workers.some((w) => w.member_id === memberId)) return;
    setWorkers([...workers, { member_id: memberId, share: 1 }]);
  };

  const removeWorker = (memberId: string) => {
    setWorkers(workers.filter((w) => w.member_id !== memberId));
  };

  const updateWorkerShare = (memberId: string, share: number) => {
    setWorkers(
      workers.map((w) => (w.member_id === memberId ? { ...w, share } : w))
    );
  };

  const getMemberName = (memberId: string) =>
    members.find((m) => m.member_id === memberId)?.name || "Unknown";

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (!deal) return <p className="text-red-500">Deal not found</p>;

  const isDone = deal.status === "done";
  const currentIdx = getStageIndex(deal.status);
  const nextStage = currentIdx < DEAL_STAGES.length - 1 ? DEAL_STAGES[currentIdx + 1] : null;

  // Calculate live preview of cash split + points
  const previewValue = value ? Number(value) : 0;
  const previewTreasury = previewValue * 0.5;
  const previewCloserPay = previewValue * 0.1;
  const previewWorkerPool = previewValue * 0.4;
  const totalShares = workers.reduce((sum, w) => sum + (w.share || 1), 0);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/projects" className="text-gray-400 hover:text-gray-600">
          ← Projects
        </Link>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${STAGE_COLORS[deal.status]}`}>
          {STAGE_LABELS[deal.status]}
        </span>
      </div>

      {/* Stage Progress Bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          {DEAL_STAGES.map((stage, i) => {
            const isActive = i <= currentIdx;
            const isCurrent = i === currentIdx;
            return (
              <div key={stage} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                      isCurrent
                        ? "bg-blue-600 text-white ring-4 ring-blue-100"
                        : isActive
                        ? "bg-green-500 text-white"
                        : "bg-gray-200 text-gray-400"
                    }`}
                  >
                    {isActive && !isCurrent ? "✓" : i + 1}
                  </div>
                  <span className={`text-xs mt-1 ${isCurrent ? "font-bold text-blue-600" : isActive ? "text-green-600" : "text-gray-400"}`}>
                    {STAGE_LABELS[stage]}
                  </span>
                </div>
                {i < DEAL_STAGES.length - 1 && (
                  <div className={`flex-1 h-0.5 -mt-4 ${i < currentIdx ? "bg-green-400" : "bg-gray-200"}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Error / Success */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
          {success}
        </div>
      )}

      {/* Edit Form */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isDone}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm disabled:bg-gray-50 disabled:text-gray-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isDone}
            rows={3}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm resize-none disabled:bg-gray-50 disabled:text-gray-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Deal Value (DZD)
              {getStageIndex(deal.status) < 3 && <span className="text-gray-400 text-xs ml-1">(required at Convinced)</span>}
            </label>
            <input
              type="number"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              disabled={isDone}
              placeholder="0"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm disabled:bg-gray-50 disabled:text-gray-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Closer
              {getStageIndex(deal.status) < 1 && <span className="text-gray-400 text-xs ml-1">(required at Talked)</span>}
            </label>
            <select
              value={closerId}
              onChange={(e) => setCloserId(e.target.value)}
              disabled={isDone}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm disabled:bg-gray-50 disabled:text-gray-500"
            >
              <option value="">Select closer...</option>
              {members.map((m) => (
                <option key={m.member_id} value={m.member_id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Workers */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Workers
            {getStageIndex(deal.status) < 3 && <span className="text-gray-400 text-xs ml-1">(required at Convinced)</span>}
          </label>
          {workers.length > 0 && (
            <div className="space-y-2 mb-3">
              {workers.map((w) => (
                <div key={w.member_id} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium flex-1">{getMemberName(w.member_id)}</span>
                  <label className="text-xs text-gray-500">Share:</label>
                  <input
                    type="number"
                    min="1"
                    value={w.share}
                    onChange={(e) => updateWorkerShare(w.member_id, Number(e.target.value) || 1)}
                    disabled={isDone}
                    className="w-16 px-2 py-1 border border-gray-300 rounded text-sm text-center disabled:bg-gray-100"
                  />
                  {!isDone && (
                    <button
                      onClick={() => removeWorker(w.member_id)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
          {!isDone && (
            <select
              onChange={(e) => {
                addWorker(e.target.value);
                e.target.value = "";
              }}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm"
              defaultValue=""
            >
              <option value="">+ Add worker...</option>
              {members
                .filter((m) => !workers.some((w) => w.member_id === m.member_id))
                .map((m) => (
                  <option key={m.member_id} value={m.member_id}>
                    {m.name}
                  </option>
                ))}
            </select>
          )}
        </div>

        {/* Action Buttons */}
        {!isDone && (
          <div className="flex gap-3 pt-2 border-t border-gray-100">
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-gray-900 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
            {nextStage && (
              <button
                onClick={handleAdvance}
                disabled={saving}
                className="bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {saving ? "..." : `Advance to ${STAGE_LABELS[nextStage]} →`}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Live Preview (when there's a value and not done yet) */}
      {!isDone && previewValue > 0 && (
        <div className="bg-blue-50 rounded-xl border border-blue-200 p-5">
          <h3 className="text-sm font-semibold text-blue-800 mb-3">
            Preview: Cash Split & Points at Completion
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-blue-700">
              <span>Treasury (50%)</span>
              <span className="font-mono font-medium">{formatDZD(previewTreasury)}</span>
            </div>
            {closerId && (
              <div className="flex justify-between text-blue-700">
                <span>{getMemberName(closerId)} (Closer 10%)</span>
                <span className="font-mono">
                  {formatDZD(previewCloserPay)} + {((previewValue / 100) * 10).toFixed(1)} pts
                </span>
              </div>
            )}
            {workers.map((w) => {
              const workerShare = (w.share || 1) / totalShares;
              const workerPay = previewWorkerPool * workerShare;
              const workerPts = (previewValue / 100) * 40 * workerShare;
              return (
                <div key={w.member_id} className="flex justify-between text-blue-700">
                  <span>
                    {getMemberName(w.member_id)} (Worker {Math.round(workerShare * 40)}%)
                  </span>
                  <span className="font-mono">
                    {formatDZD(workerPay)} + {workerPts.toFixed(1)} pts
                  </span>
                </div>
              );
            })}
            <div className="border-t border-blue-200 pt-2 flex justify-between font-medium text-blue-800">
              <span>Total</span>
              <span className="font-mono">{formatDZD(previewValue)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Completed Deal Summary */}
      {isDone && cashTx.length > 0 && (
        <div className="bg-green-50 rounded-xl border border-green-200 p-5">
          <h3 className="text-sm font-semibold text-green-800 mb-3">
            Cash Flow Split (Completed)
          </h3>
          <div className="space-y-2 text-sm">
            {cashTx.map((tx, i) => (
              <div key={i} className="flex justify-between text-green-700">
                <span>
                  {tx.bucket === "treasury"
                    ? "Treasury"
                    : `${tx.member_id ? getMemberName(tx.member_id) : "Unknown"} (${tx.bucket})`}
                </span>
                <span className="font-mono font-medium">{formatDZD(tx.amount)}</span>
              </div>
            ))}
          </div>
          {pointEntries.length > 0 && (
            <>
              <h3 className="text-sm font-semibold text-green-800 mb-3 mt-4">
                Points Awarded
              </h3>
              <div className="space-y-2 text-sm">
                {pointEntries.map((pe, i) => (
                  <div key={i} className="flex justify-between text-green-700">
                    <span>
                      {getMemberName(pe.member_id)} ({pe.type})
                    </span>
                    <span className="font-mono font-medium">+{pe.points} pts</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
