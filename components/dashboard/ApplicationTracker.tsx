"use client";

import { useState, useEffect } from "react";
import { Plus, ExternalLink, Trash2, ChevronDown } from "lucide-react";
import type { JobApplication, ApplicationStatus } from "@/types";

const COLUMNS: {
  status: ApplicationStatus;
  label: string;
  color: string;
  dot: string;
}[] = [
  {
    status: "saved",
    label: "Saved",
    color: "border-gray-600",
    dot: "bg-gray-400",
  },
  {
    status: "applied",
    label: "Applied",
    color: "border-blue-500/40",
    dot: "bg-blue-400",
  },
  {
    status: "interview",
    label: "Interview",
    color: "border-purple-500/40",
    dot: "bg-purple-400",
  },
  {
    status: "offer",
    label: "Offer 🎉",
    color: "border-emerald-500/40",
    dot: "bg-emerald-400",
  },
  {
    status: "rejected",
    label: "Rejected",
    color: "border-red-500/30",
    dot: "bg-red-400",
  },
  {
    status: "ghosted",
    label: "Ghosted 👻",
    color: "border-gray-700",
    dot: "bg-gray-600",
  },
];

interface AddFormState {
  company: string;
  role: string;
  location: string;
  url: string;
  salary: string;
  notes: string;
}

const EMPTY_FORM: AddFormState = {
  company: "",
  role: "",
  location: "",
  url: "",
  salary: "",
  notes: "",
};

export default function ApplicationTracker() {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState<AddFormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, []);

  async function fetchApplications() {
    setLoading(true);
    const res = await fetch("/api/applications");
    const data = await res.json();
    setApplications(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  async function addApplication(e: React.FormEvent) {
    e.preventDefault();
    if (!form.company || !form.role) return;
    setSaving(true);
    const res = await fetch("/api/applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, status: "applied" }),
    });
    const data = await res.json();
    setApplications((prev) => [data, ...prev]);
    setForm(EMPTY_FORM);
    setShowAdd(false);
    setSaving(false);
  }

  async function updateStatus(id: string, status: ApplicationStatus) {
    const res = await fetch("/api/applications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    const data = await res.json();
    setApplications((prev) => prev.map((a) => (a.id === id ? data : a)));
  }

  async function deleteApplication(id: string) {
    await fetch(`/api/applications?id=${id}`, { method: "DELETE" });
    setApplications((prev) => prev.filter((a) => a.id !== id));
  }

  const byStatus = (status: ApplicationStatus) =>
    applications.filter((a) => a.status === status);

  const stats = {
    total: applications.length,
    active: applications.filter((a) =>
      ["applied", "interview"].includes(a.status),
    ).length,
    interviews: applications.filter((a) => a.status === "interview").length,
    offers: applications.filter((a) => a.status === "offer").length,
  };

  return (
    <div className="space-y-5">
      {/* Stats bar */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Total applied", value: stats.total, color: "text-white" },
          { label: "Active", value: stats.active, color: "text-blue-400" },
          {
            label: "Interviews",
            value: stats.interviews,
            color: "text-purple-400",
          },
          { label: "Offers", value: stats.offers, color: "text-emerald-400" },
        ].map(({ label, value, color }) => (
          <div
            key={label}
            className="bg-gray-900 border border-gray-800/60 rounded-xl p-4 text-center"
          >
            <div className={`text-2xl font-semibold ${color}`}>{value}</div>
            <div className="text-xs text-gray-500 mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* Add application button */}
      <div className="flex justify-between items-center">
        <h2 className="text-base font-medium text-white">
          Application pipeline
        </h2>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-2 text-xs lg:text-sm px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-lg text-emerald-400 transition-colors"
        >
          <Plus className="size-3 lg:size-4" />
          Add application
        </button>
      </div>

      {/* Add form */}
      {showAdd && (
        <form
          onSubmit={addApplication}
          className="bg-gray-900 border border-gray-800/60 rounded-xl p-5 space-y-3"
        >
          <h3 className="text-xs lg:text-sm font-medium text-white mb-3">
            New application
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { key: "company", placeholder: "Company name *", required: true },
              { key: "role", placeholder: "Role / Position *", required: true },
              {
                key: "location",
                placeholder: "Location (Remote / Dhaka)",
                required: false,
              },
              {
                key: "salary",
                placeholder: "Salary range (optional)",
                required: false,
              },
              { key: "url", placeholder: "Job URL", required: false },
            ].map(({ key, placeholder, required }) => (
              <input
                key={key}
                value={form[key as keyof AddFormState]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                placeholder={placeholder}
                required={required}
                className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            ))}
          </div>
          <textarea
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            placeholder="Notes (optional)"
            rows={2}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500 transition-colors resize-none"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-semibold rounded-lg text-sm transition-colors disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save"}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowAdd(false);
                setForm(EMPTY_FORM);
              }}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-400 rounded-lg text-sm transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Kanban columns */}
      {loading ? (
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-48 bg-gray-900 rounded-xl animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {COLUMNS.map(({ status, label, color, dot }) => {
            const items = byStatus(status);
            return (
              <div
                key={status}
                className={`bg-gray-900 border ${color} rounded-xl p-4`}
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className={`w-2 h-2 rounded-full ${dot}`} />
                  <span className="text-xs font-medium text-gray-400 uppercase tracking-widest">
                    {label}
                  </span>
                  <span className="ml-auto text-xs text-gray-600">
                    {items.length}
                  </span>
                </div>

                <div className="space-y-2 min-h-[60px]">
                  {items.length === 0 && (
                    <p className="text-xs text-gray-700 text-center py-4">
                      Empty
                    </p>
                  )}
                  {items.map((app) => (
                    <div
                      key={app.id}
                      className="bg-gray-800/60 hover:bg-gray-800 rounded-lg p-3 group transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-white truncate">
                            {app.company}
                          </p>
                          <p className="text-xs text-gray-400 truncate">
                            {app.role}
                          </p>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                          {app.url && (
                            <a
                              href={app.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1 text-gray-500 hover:text-blue-400 transition-colors"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                          <button
                            onClick={() => deleteApplication(app.id)}
                            className="p-1 text-gray-500 hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      {app.location && (
                        <p className="text-xs text-gray-600 mb-2">
                          {app.location}
                        </p>
                      )}

                      <div className="relative">
                        <select
                          value={app.status}
                          onChange={(e) =>
                            updateStatus(
                              app.id,
                              e.target.value as ApplicationStatus,
                            )
                          }
                          className="w-full appearance-none bg-gray-900 border border-gray-700 rounded px-2 py-1 text-xs text-gray-400 focus:outline-none focus:border-emerald-500 cursor-pointer pr-6"
                        >
                          {COLUMNS.map((c) => (
                            <option key={c.status} value={c.status}>
                              {c.label}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-600 pointer-events-none" />
                      </div>

                      <p className="text-xs text-gray-700 mt-1.5">
                        {app.applied_date}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
