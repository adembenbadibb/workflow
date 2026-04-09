"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Deal, DealStatus, DEAL_STAGES, STAGE_LABELS, STAGE_COLORS, STAGE_KANBAN_COLORS, formatDZD } from "@/lib/types";
import Link from "next/link";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";

type ViewMode = "kanban" | "table";

export default function ProjectsPageWrapper() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" /></div>}>
      <ProjectsPage />
    </Suspense>
  );
}

function ProjectsPage() {
  const searchParams = useSearchParams();
  const filterStatus = searchParams.get("status");

  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<ViewMode>("kanban");
  const [error, setError] = useState<string | null>(null);

  const fetchDeals = () => {
    setLoading(true);
    fetch("/api/deals")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setDeals(data);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDeals();
  }, []);

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const dealId = result.draggableId;
    const newStatus = result.destination.droppableId as DealStatus;
    const deal = deals.find((d) => d.id === dealId);
    if (!deal || deal.status === newStatus) return;

    // Optimistic update
    setDeals((prev) =>
      prev.map((d) => (d.id === dealId ? { ...d, status: newStatus } : d))
    );
    setError(null);

    try {
      const res = await fetch(`/api/deals/${dealId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        const data = await res.json();
        // Revert
        setDeals((prev) =>
          prev.map((d) => (d.id === dealId ? { ...d, status: deal.status } : d))
        );
        setError(data.error || "Failed to move deal");
        setTimeout(() => setError(null), 4000);
      } else {
        // Refresh to get updated data
        fetchDeals();
      }
    } catch {
      setDeals((prev) =>
        prev.map((d) => (d.id === dealId ? { ...d, status: deal.status } : d))
      );
      setError("Network error");
      setTimeout(() => setError(null), 4000);
    }
  };

  const filteredDeals = filterStatus
    ? deals.filter((d) => d.status === filterStatus)
    : deals;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Projects</h1>
        <div className="flex items-center gap-3">
          {filterStatus && (
            <Link
              href="/projects"
              className="text-sm text-blue-600 hover:underline"
            >
              Clear filter
            </Link>
          )}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setView("kanban")}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                view === "kanban" ? "bg-white shadow text-gray-900" : "text-gray-500"
              }`}
            >
              Kanban
            </button>
            <button
              onClick={() => setView("table")}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                view === "table" ? "bg-white shadow text-gray-900" : "text-gray-500"
              }`}
            >
              Table
            </button>
          </div>
          <Link
            href="/projects/new"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            + New Project
          </Link>
        </div>
      </div>

      {/* Error Toast */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {view === "kanban" ? (
        <KanbanBoard deals={filteredDeals} onDragEnd={handleDragEnd} />
      ) : (
        <TableView deals={filteredDeals} />
      )}
    </div>
  );
}

function KanbanBoard({
  deals,
  onDragEnd,
}: {
  deals: Deal[];
  onDragEnd: (result: DropResult) => void;
}) {
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="grid grid-cols-5 gap-4 min-h-[60vh]">
        {DEAL_STAGES.map((stage) => {
          const stageDeals = deals.filter((d) => d.status === stage);
          return (
            <Droppable key={stage} droppableId={stage}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`rounded-xl border-2 p-3 transition-colors ${
                    snapshot.isDraggingOver
                      ? "bg-blue-50 border-blue-300"
                      : "bg-gray-50 border-gray-200"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-700">
                      {STAGE_LABELS[stage]}
                    </h3>
                    <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
                      {stageDeals.length}
                    </span>
                  </div>
                  <div className="space-y-2 min-h-[100px]">
                    {stageDeals.map((deal, index) => (
                      <Draggable key={deal.id} draggableId={deal.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                          >
                            <Link href={`/projects/${deal.id}`}>
                              <div
                                className={`bg-white rounded-lg border p-3 border-t-4 transition-shadow cursor-pointer hover:shadow-md ${
                                  STAGE_KANBAN_COLORS[stage]
                                } ${snapshot.isDragging ? "shadow-lg rotate-2" : ""}`}
                              >
                                <div className="font-medium text-sm text-gray-900 truncate">
                                  {deal.title}
                                </div>
                                {deal.value && (
                                  <div className="text-xs font-mono text-gray-500 mt-1">
                                    {formatDZD(deal.value)}
                                  </div>
                                )}
                                {deal.closer && (
                                  <div className="text-xs text-gray-400 mt-1">
                                    Closer: {deal.closer.name}
                                  </div>
                                )}
                                {deal.workers && deal.workers.length > 0 && (
                                  <div className="text-xs text-gray-400">
                                    Workers: {deal.workers.map((w) => w.member?.name).join(", ")}
                                  </div>
                                )}
                              </div>
                            </Link>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                </div>
              )}
            </Droppable>
          );
        })}
      </div>
    </DragDropContext>
  );
}

function TableView({ deals }: { deals: Deal[] }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Title</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Value</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Closer</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Workers</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {deals.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                No projects yet
              </td>
            </tr>
          ) : (
            deals.map((deal) => (
              <tr key={deal.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <Link href={`/projects/${deal.id}`} className="font-medium text-blue-600 hover:underline">
                    {deal.title}
                  </Link>
                  {deal.description && (
                    <div className="text-xs text-gray-400 truncate max-w-xs">{deal.description}</div>
                  )}
                </td>
                <td className="px-4 py-3 text-sm font-mono">
                  {deal.value ? formatDZD(deal.value) : "—"}
                </td>
                <td className="px-4 py-3 text-sm">
                  {deal.closer?.name || "—"}
                </td>
                <td className="px-4 py-3 text-sm">
                  {deal.workers && deal.workers.length > 0
                    ? deal.workers.map((w) => w.member?.name).join(", ")
                    : "—"}
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${STAGE_COLORS[deal.status]}`}>
                    {STAGE_LABELS[deal.status]}
                  </span>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
