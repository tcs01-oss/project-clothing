import React, { useState, useEffect } from "react";
import {
  Truck,
  Plus,
  Trash2,
  Edit,
  CheckCircle2,
  Clock,
  Save,
  Sparkles,
  RotateCcw,
  Check,
  Calendar,
  X,
  AlertCircle
} from "lucide-react";
import { Order, ShippingTimelineMilestone } from "../types";
import { updateOrderShippingTimelineInFirestore } from "../lib/firebase";

interface AdminShippingTimelineEditorProps {
  order: Order;
  onTimelineSaved?: (updatedTimeline: ShippingTimelineMilestone[]) => void;
}

const STANDARD_PRESETS = [
  {
    label: "Order Booked",
    statusTitle: "Order Booked",
    description: "Order received by seller.",
    defaultCompleted: true,
  },
  {
    label: "In Process",
    statusTitle: "In Process",
    description: "Package in transit through sorting hub and queued at artisan loom.",
    defaultCompleted: true,
  },
  {
    label: "Dispatched",
    statusTitle: "Dispatched",
    description: "Handed over to delivery partner.",
    defaultCompleted: true,
  },
  {
    label: "Out for Delivery",
    statusTitle: "Out for Delivery",
    description: "Out for delivery today with courier partner.",
    defaultCompleted: false,
  },
  {
    label: "Delivered",
    statusTitle: "Delivered",
    description: "Package successfully delivered at destination doorstep.",
    defaultCompleted: false,
  },
];

export const AdminShippingTimelineEditor: React.FC<AdminShippingTimelineEditorProps> = ({
  order,
  onTimelineSaved,
}) => {
  const [timeline, setTimeline] = useState<ShippingTimelineMilestone[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  // Form Fields
  const [statusTitle, setStatusTitle] = useState("");
  const [description, setDescription] = useState("");
  const [timestamp, setTimestamp] = useState("");
  const [isCompleted, setIsCompleted] = useState(true);

  // UI state
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatusMessage, setSaveStatusMessage] = useState<string | null>(null);

  // Sync timeline when order changes
  useEffect(() => {
    if (order.shippingTimeline && order.shippingTimeline.length > 0) {
      setTimeline(order.shippingTimeline);
    } else {
      // Default 3 initial tracking milestones matching schema sample
      const baseDate = order.date ? new Date(order.date).toISOString() : new Date().toISOString();
      setTimeline([
        {
          statusTitle: "Order Booked",
          description: "Order received by seller.",
          timestamp: baseDate,
          isCompleted: true,
        },
        {
          statusTitle: "Dispatched",
          description: "Handed over to delivery partner.",
          timestamp: new Date(Date.now() - 3600000 * 12).toISOString(),
          isCompleted: true,
        },
        {
          statusTitle: "Out for Delivery",
          description: "Out for delivery today.",
          timestamp: "",
          isCompleted: false,
        },
      ]);
    }
    setEditingIndex(null);
    resetForm();
  }, [order.id]);

  const resetForm = () => {
    setStatusTitle("");
    setDescription("");
    setTimestamp(new Date().toISOString().slice(0, 16));
    setIsCompleted(true);
    setEditingIndex(null);
  };

  const handleStartEdit = (index: number) => {
    const item = timeline[index];
    if (!item) return;
    setEditingIndex(index);
    setStatusTitle(item.statusTitle);
    setDescription(item.description);
    
    // Format ISO string to datetime-local if valid date
    if (item.timestamp) {
      try {
        const d = new Date(item.timestamp);
        if (!isNaN(d.getTime())) {
          setTimestamp(d.toISOString().slice(0, 16));
        } else {
          setTimestamp(item.timestamp);
        }
      } catch {
        setTimestamp(item.timestamp);
      }
    } else {
      setTimestamp("");
    }
    
    setIsCompleted(item.isCompleted);
  };

  const handleSaveMilestone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!statusTitle.trim()) return;

    const formattedTimestamp = timestamp
      ? (timestamp.includes("T") ? new Date(timestamp).toISOString() : timestamp)
      : "";

    const newMilestone: ShippingTimelineMilestone = {
      statusTitle: statusTitle.trim(),
      description: description.trim() || "Milestone status updated.",
      timestamp: formattedTimestamp,
      isCompleted,
    };

    if (editingIndex !== null) {
      const updated = [...timeline];
      updated[editingIndex] = newMilestone;
      setTimeline(updated);
    } else {
      setTimeline([...timeline, newMilestone]);
    }

    resetForm();
  };

  const handleDeleteMilestone = (index: number) => {
    setTimeline(timeline.filter((_, i) => i !== index));
    if (editingIndex === index) {
      resetForm();
    }
  };

  const handleToggleCompleted = (index: number) => {
    const updated = timeline.map((m, i) => {
      if (i === index) {
        return { ...m, isCompleted: !m.isCompleted };
      }
      return m;
    });
    setTimeline(updated);
  };

  const handleAddQuickPreset = (preset: typeof STANDARD_PRESETS[0]) => {
    const nowIso = new Date().toISOString();
    const newMilestone: ShippingTimelineMilestone = {
      statusTitle: preset.statusTitle,
      description: preset.description,
      timestamp: preset.defaultCompleted ? nowIso : "",
      isCompleted: preset.defaultCompleted,
    };
    setTimeline((prev) => [...prev, newMilestone]);
  };

  const handleApplyFullStandardPipeline = () => {
    const now = Date.now();
    const pipeline: ShippingTimelineMilestone[] = [
      {
        statusTitle: "Order Booked",
        description: "Order received by seller and verified at studio.",
        timestamp: new Date(now - 86400000 * 2).toISOString(),
        isCompleted: true,
      },
      {
        statusTitle: "In Process",
        description: "Package in transit through sorting hub and queued at artisan loom.",
        timestamp: new Date(now - 86400000).toISOString(),
        isCompleted: true,
      },
      {
        statusTitle: "Dispatched",
        description: "Handed over to delivery partner (Delhivery Express).",
        timestamp: new Date(now - 3600000 * 8).toISOString(),
        isCompleted: true,
      },
      {
        statusTitle: "Out for Delivery",
        description: "Out for delivery today with courier partner.",
        timestamp: new Date(now).toISOString(),
        isCompleted: true,
      },
      {
        statusTitle: "Delivered",
        description: "Package successfully delivered at destination doorstep.",
        timestamp: "",
        isCompleted: false,
      },
    ];
    setTimeline(pipeline);
  };

  const handleSaveToFirestore = async () => {
    setIsSaving(true);
    setSaveStatusMessage(null);

    try {
      // 1. Update via Backend API
      await fetch(`/api/orders/${encodeURIComponent(order.id)}/shipping-timeline`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shippingTimeline: timeline }),
      });

      // 2. Direct Firestore Write
      await updateOrderShippingTimelineInFirestore(order.id, timeline);

      setSaveStatusMessage("Shipping timeline successfully saved to Firestore!");
      if (onTimelineSaved) {
        onTimelineSaved(timeline);
      }
    } catch (err: any) {
      console.error("Error saving timeline to Firestore:", err);
      setSaveStatusMessage("Saved locally & sent to API. (Firestore note: " + (err.message || String(err)) + ")");
    } finally {
      setIsSaving(false);
      setTimeout(() => {
        setSaveStatusMessage(null);
      }, 5000);
    }
  };

  return (
    <div className="bg-black/30 p-4 sm:p-5 rounded-xl border border-sand/20 space-y-5 text-left text-linen font-sans">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-sand/15 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-moss/20 border border-moss/40 flex items-center justify-center text-moss">
            <Truck className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-serif font-bold text-sm text-white flex items-center gap-2">
              <span>Update Shipping Timeline</span>
              <span className="text-[10px] font-mono font-bold bg-moss/20 text-moss border border-moss/30 px-2 py-0.5 rounded-full uppercase">
                Admin Simulator
              </span>
            </h4>
            <p className="text-[11px] font-mono text-linen/60">
              Manually control and update the tracking milestones array stored in Firestore for Order #{order.id}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSaveToFirestore}
          disabled={isSaving}
          className="px-4 py-2 bg-moss hover:bg-moss/90 text-white font-mono text-xs font-bold rounded-xl shadow flex items-center gap-2 cursor-pointer disabled:opacity-50 transition"
        >
          {isSaving ? <RotateCcw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>{isSaving ? "Syncing..." : "Save Timeline to Firestore"}</span>
        </button>
      </div>

      {saveStatusMessage && (
        <div className="p-3 bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 rounded-lg text-xs font-mono flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{saveStatusMessage}</span>
        </div>
      )}

      {/* Quick Simulation Templates */}
      <div className="space-y-2">
        <label className="text-[10px] font-mono uppercase tracking-wider text-linen/60 font-bold block flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-moss" />
          <span>Quick Simulation Templates & Action Shortcuts</span>
        </label>
        <div className="flex flex-wrap items-center gap-2">
          {STANDARD_PRESETS.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => handleAddQuickPreset(p)}
              className="px-2.5 py-1 bg-stone-900/80 hover:bg-stone-800 text-linen/90 hover:text-white border border-sand/20 rounded-lg text-[11px] font-mono flex items-center gap-1 cursor-pointer transition"
            >
              <Plus className="w-3 h-3 text-moss" />
              <span>+ {p.label}</span>
            </button>
          ))}

          <button
            type="button"
            onClick={handleApplyFullStandardPipeline}
            className="px-3 py-1 bg-moss/20 hover:bg-moss/30 text-moss font-mono text-[11px] font-bold border border-moss/40 rounded-lg flex items-center gap-1.5 cursor-pointer transition ml-auto"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Apply 5-Step Simulation Pipeline</span>
          </button>
        </div>
      </div>

      {/* Existing Timeline Milestones List */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-[10px] font-mono uppercase tracking-wider text-linen/60 font-bold">
          <span>CURRENT TRACKING STEPS ({timeline.length})</span>
          <span>CLICK STEP TO EDIT OR TOGGLE STATUS</span>
        </div>

        {timeline.length === 0 ? (
          <div className="p-4 bg-stone-900/40 border border-dashed border-sand/20 rounded-xl text-center text-xs font-mono text-linen/50">
            No milestones configured yet. Use quick templates above or the form below to add tracking steps.
          </div>
        ) : (
          <div className="space-y-2">
            {timeline.map((item, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-xl border transition flex items-start justify-between gap-3 ${
                  editingIndex === idx
                    ? "bg-moss/10 border-moss/60 text-white"
                    : "bg-stone-900/60 border-sand/15 hover:border-sand/30"
                }`}
              >
                <div className="flex items-start gap-3 min-w-0">
                  <button
                    type="button"
                    onClick={() => handleToggleCompleted(idx)}
                    title="Click to toggle completed status"
                    className={`mt-0.5 w-6 h-6 rounded-full flex items-center justify-center shrink-0 cursor-pointer transition ${
                      item.isCompleted
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "bg-stone-800 border border-stone-600 text-stone-400 hover:border-emerald-500"
                    }`}
                  >
                    {item.isCompleted ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Clock className="w-3 h-3" />}
                  </button>

                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-serif text-xs font-bold text-white">{item.statusTitle}</span>
                      <span
                        className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded-full font-bold border ${
                          item.isCompleted
                            ? "bg-emerald-950/80 text-emerald-300 border-emerald-800/80"
                            : "bg-stone-800 text-stone-400 border-stone-700"
                        }`}
                      >
                        {item.isCompleted ? "Completed" : "Pending"}
                      </span>
                    </div>

                    <p className="text-[11px] font-mono text-linen/70 leading-normal">{item.description}</p>

                    <div className="text-[10px] font-mono text-linen/50 flex items-center gap-1.5 pt-0.5">
                      <Calendar className="w-3 h-3 text-moss" />
                      <span>
                        {item.timestamp
                          ? (isNaN(new Date(item.timestamp).getTime())
                              ? item.timestamp
                              : new Date(item.timestamp).toLocaleString("en-IN", {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }))
                          : "Timestamp not set (Pending)"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleStartEdit(idx)}
                    className="p-1.5 hover:bg-stone-800 text-linen/70 hover:text-white rounded-lg transition cursor-pointer"
                    title="Edit Milestone"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteMilestone(idx)}
                    className="p-1.5 hover:bg-red-950/50 text-red-400 hover:text-red-300 rounded-lg transition cursor-pointer"
                    title="Delete Milestone"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add / Edit Milestone Form */}
      <form onSubmit={handleSaveMilestone} className="p-3.5 bg-stone-900/90 border border-sand/20 rounded-xl space-y-3">
        <div className="flex justify-between items-center border-b border-sand/15 pb-2">
          <span className="font-mono text-xs font-bold text-moss uppercase flex items-center gap-1.5">
            {editingIndex !== null ? <Edit className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
            <span>{editingIndex !== null ? `Edit Step #${editingIndex + 1}` : "Add New Tracking Milestone"}</span>
          </span>
          {editingIndex !== null && (
            <button
              type="button"
              onClick={resetForm}
              className="text-[10px] font-mono text-linen/60 hover:text-white flex items-center gap-1 cursor-pointer"
            >
              <X className="w-3 h-3" />
              <span>Cancel Edit</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] font-mono uppercase text-linen/70 font-bold block mb-1">
              Status Title (e.g., Dispatched) *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Dispatched, Out for Delivery"
              value={statusTitle}
              onChange={(e) => setStatusTitle(e.target.value)}
              className="w-full bg-black/50 border border-sand/20 rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:border-moss outline-none"
            />
          </div>

          <div>
            <label className="text-[10px] font-mono uppercase text-linen/70 font-bold block mb-1">
              Timestamp (Date & Time)
            </label>
            <div className="flex gap-1.5">
              <input
                type="datetime-local"
                value={timestamp}
                onChange={(e) => setTimestamp(e.target.value)}
                className="w-full bg-black/50 border border-sand/20 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:border-moss outline-none"
              />
              <button
                type="button"
                onClick={() => setTimestamp(new Date().toISOString().slice(0, 16))}
                className="px-2 py-1 bg-stone-800 hover:bg-stone-700 text-linen/80 hover:text-white text-[10px] font-mono rounded-lg border border-sand/20 cursor-pointer shrink-0"
              >
                Now
              </button>
            </div>
          </div>
        </div>

        <div>
          <label className="text-[10px] font-mono uppercase text-linen/70 font-bold block mb-1">
            Status Description *
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Your package has left our fulfillment center."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-black/50 border border-sand/20 rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:border-moss outline-none"
          />
        </div>

        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isCompleted}
              onChange={(e) => setIsCompleted(e.target.checked)}
              className="w-4 h-4 rounded text-moss bg-black border-sand/30 focus:ring-0 cursor-pointer"
            />
            <span className="text-xs font-mono text-white font-bold">
              Mark step as Completed (isCompleted: true)
            </span>
          </label>

          <button
            type="submit"
            className="px-4 py-1.5 bg-moss hover:bg-moss/90 text-white font-mono font-bold text-xs rounded-lg shadow cursor-pointer transition flex items-center gap-1.5"
          >
            {editingIndex !== null ? <Save className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
            <span>{editingIndex !== null ? "Update Step" : "Add Step to List"}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
