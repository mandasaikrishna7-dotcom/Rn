"use client";

import { useState } from "react";
import { Plus, FileText, Tag, Calendar, Download, Sparkles, Check, X } from "lucide-react";
import { OutlineButton, PrimaryButton } from "@/components/ui/Buttons";
import { HardCard } from "@/components/ui/HardCard";
import { SectionHeading } from "@/components/ui/SectionHeading";

interface NoteItem {
  id: string;
  title: string;
  content: string;
  tags: string[];
  created_at: string;
  linked_items: string[];
}

const INITIAL_NOTES: NoteItem[] = [
  {
    id: "1",
    title: "Deep Work Insights",
    content: "Key takeaways from exploring focused work strategies and uninterrupted deep focus blocks...",
    tags: ["productivity", "focus"],
    created_at: "2026-08-01T10:30:00Z",
    linked_items: ["c1", "c2"],
  },
  {
    id: "2",
    title: "Systems Thinking Notes",
    content: "Understanding emergent behaviors in complex systems and long-term feedback loops...",
    tags: ["systems", "complexity"],
    created_at: "2026-07-28T14:20:00Z",
    linked_items: ["c3"],
  },
];

export default function NotesPage() {
  const [notes, setNotes] = useState<NoteItem[]>(INITIAL_NOTES);
  const [selectedNotes, setSelectedNotes] = useState<string[]>([]);
  const [tagFilter, setTagFilter] = useState("all");
  const [showNewModal, setShowNewModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newTag, setNewTag] = useState("");
  const [exportAck, setExportAck] = useState<string | null>(null);

  const filteredNotes = notes.filter((note) => {
    if (tagFilter !== "all" && !note.tags.includes(tagFilter)) return false;
    return true;
  });

  function handleCreateNote(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    const created: NoteItem = {
      id: Date.now().toString(),
      title: newTitle.trim(),
      content: newContent.trim(),
      tags: newTag.trim() ? newTag.split(",").map((t) => t.trim().toLowerCase()) : ["reflections"],
      created_at: new Date().toISOString(),
      linked_items: [],
    };

    setNotes([created, ...notes]);
    setNewTitle("");
    setNewContent("");
    setNewTag("");
    setShowNewModal(false);
  }

  function handleExportPDF() {
    const targetNotes = selectedNotes.length
      ? notes.filter((n) => selectedNotes.includes(n.id))
      : filteredNotes;

    if (targetNotes.length === 0) return;

    setExportAck(`Opening PDF print window for ${targetNotes.length} note${targetNotes.length === 1 ? "" : "s"}...`);

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Please allow popups to export your PDF summary.");
      return;
    }

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>NextSelf — Notes Export (${new Date().toLocaleDateString()})</title>
          <style>
            @media print {
              body { margin: 0; padding: 20px; background: #ffffff !important; }
              .note-card { shadow: none !important; }
            }
            body {
              font-family: 'Lora', Georgia, serif;
              color: #111111;
              padding: 40px;
              max-width: 800px;
              margin: 0 auto;
              line-height: 1.6;
              background-color: #FAF9F6;
            }
            .header {
              border-bottom: 2px solid #111111;
              padding-bottom: 16px;
              margin-bottom: 24px;
            }
            h1 {
              font-size: 26px;
              font-weight: 400;
              margin: 0 0 6px 0;
            }
            .subtitle {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              font-size: 12px;
              color: #666666;
              text-transform: uppercase;
              letter-spacing: 0.08em;
            }
            .note-card {
              background: #ffffff;
              border: 1px solid #e5e5e5;
              border-radius: 12px;
              padding: 20px;
              margin-bottom: 20px;
              page-break-inside: avoid;
              box-shadow: 0 2px 8px rgba(0,0,0,0.03);
            }
            .note-title {
              font-size: 18px;
              font-weight: 400;
              margin: 0 0 10px 0;
              color: #111111;
            }
            .note-content {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              font-size: 14px;
              color: #404040;
              margin-bottom: 14px;
              white-space: pre-wrap;
            }
            .tag-pill {
              display: inline-block;
              font-family: monospace;
              font-size: 11px;
              background: #f4f4f5;
              border: 1px solid #e4e4e7;
              color: #3f3f46;
              padding: 2px 8px;
              border-radius: 999px;
              margin-right: 6px;
              margin-bottom: 6px;
            }
            .footer-meta {
              font-family: monospace;
              font-size: 11px;
              color: #71717a;
              border-top: 1px solid #f4f4f5;
              padding-top: 10px;
              margin-top: 12px;
              display: flex;
              justify-content: space-between;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>NextSelf — Growth Compass Notes</h1>
            <div class="subtitle">Exported on ${new Date().toLocaleDateString()} · ${targetNotes.length} note${targetNotes.length === 1 ? "" : "s"}</div>
          </div>
          ${targetNotes
            .map(
              (n) => `
            <div class="note-card">
              <h2 class="note-title">${n.title}</h2>
              <div class="note-content">${n.content}</div>
              <div>
                ${n.tags.map((t) => `<span class="tag-pill">#${t}</span>`).join("")}
              </div>
              <div class="footer-meta">
                <span>Created: ${new Date(n.created_at).toLocaleDateString()}</span>
                <span>${n.linked_items.length} linked item${n.linked_items.length === 1 ? "" : "s"}</span>
              </div>
            </div>
          `,
            )
            .join("")}
          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();

    window.setTimeout(() => setExportAck(null), 4000);
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
        <SectionHeading sub="Your captured insights, reading summaries, and growth reflections in one place.">
          Notes and insights
        </SectionHeading>

        <PrimaryButton onClick={() => setShowNewModal(true)} variant="light" size="sm">
          <Plus size={15} /> New note
        </PrimaryButton>
      </div>

      {/* Filter toolbar */}
      <HardCard className="p-4 mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Tag size={15} className="text-neutral-500" />
            <select
              value={tagFilter}
              onChange={(e) => setTagFilter(e.target.value)}
              className="rounded-xl border border-neutral-200 bg-white px-3 py-1.5 text-xs text-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 cursor-pointer"
            >
              <option value="all">All tags</option>
              <option value="productivity">productivity</option>
              <option value="focus">focus</option>
              <option value="systems">systems</option>
              <option value="complexity">complexity</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <Calendar size={15} className="text-neutral-500" />
            <select className="rounded-xl border border-neutral-200 bg-white px-3 py-1.5 text-xs text-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 cursor-pointer">
              <option>All dates</option>
              <option>This week</option>
              <option>This month</option>
            </select>
          </div>
        </div>

        <OutlineButton onClick={handleExportPDF} size="sm" variant="light">
          <Download size={14} /> Export PDF {selectedNotes.length ? `(${selectedNotes.length})` : ""}
        </OutlineButton>
      </HardCard>

      {exportAck ? (
        <div className="mb-6 rounded-xl border border-neutral-200 bg-neutral-50 p-3.5 text-xs text-neutral-800">
          ✓ {exportAck}
        </div>
      ) : null}

      {/* Notes Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {filteredNotes.map((note) => {
          const isSelected = selectedNotes.includes(note.id);
          return (
            <HardCard
              key={note.id}
              className={`p-6 transition-all hover:border-neutral-300 ${
                isSelected ? "border-neutral-900 ring-1 ring-neutral-900/10" : ""
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-2.5">
                <h3 className="serif-heading text-lg text-neutral-900 font-normal">{note.title}</h3>
                <button
                  type="button"
                  onClick={() =>
                    setSelectedNotes((prev) =>
                      prev.includes(note.id) ? prev.filter((i) => i !== note.id) : [...prev, note.id],
                    )
                  }
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border text-xs transition-colors ${
                    isSelected
                      ? "border-neutral-900 bg-neutral-900 text-white"
                      : "border-neutral-300 bg-white hover:border-neutral-400"
                  }`}
                  aria-label="Select note"
                >
                  {isSelected ? <Check size={12} strokeWidth={3} /> : null}
                </button>
              </div>

              <p className="text-sm leading-relaxed text-neutral-600 mb-4">{note.content}</p>

              <div className="flex flex-wrap gap-2 mb-4">
                {note.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center rounded-full border border-neutral-200 bg-neutral-100 px-2.5 py-0.5 font-mono text-[11px] uppercase tracking-wider text-neutral-700 font-medium"
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between border-t border-neutral-100 pt-3 text-xs text-neutral-500 font-mono">
                <span className="flex items-center gap-1.5">
                  <FileText size={13} className="text-neutral-400" />
                  {note.linked_items.length} linked item{note.linked_items.length === 1 ? "" : "s"}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar size={13} className="text-neutral-400" />
                  {new Date(note.created_at).toLocaleDateString()}
                </span>
              </div>
            </HardCard>
          );
        })}
      </div>

      {filteredNotes.length === 0 && (
        <HardCard className="p-12 text-center">
          <Sparkles size={36} className="mx-auto mb-3 text-neutral-400" />
          <h3 className="serif-heading text-xl text-neutral-900 mb-1">No notes found</h3>
          <p className="text-sm text-neutral-500 mb-5">
            Capture thoughts from your feed or create a standalone note.
          </p>
          <PrimaryButton onClick={() => setShowNewModal(true)} variant="light" size="sm">
            <Plus size={15} /> Create a note
          </PrimaryButton>
        </HardCard>
      )}

      {/* New Note Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <HardCard className="w-full max-w-lg p-6 shadow-xl relative animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between mb-4 border-b border-neutral-100 pb-3">
              <h2 className="serif-heading text-xl text-neutral-900">Create new note</h2>
              <button
                onClick={() => setShowNewModal(false)}
                className="rounded-lg p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-800"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateNote} className="space-y-4">
              <div>
                <label className="mono-label block text-neutral-500 mb-1 text-[11px]">Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Key Takeaways on Focus"
                  className="hard-input"
                  autoFocus
                />
              </div>

              <div>
                <label className="mono-label block text-neutral-500 mb-1 text-[11px]">Insights &amp; Content</label>
                <textarea
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  rows={4}
                  placeholder="Capture key ideas, quotes, or action items..."
                  className="hard-input resize-none"
                />
              </div>

              <div>
                <label className="mono-label block text-neutral-500 mb-1 text-[11px]">Tags (comma separated)</label>
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="focus, productivity"
                  className="hard-input"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <OutlineButton type="button" onClick={() => setShowNewModal(false)} variant="light" size="sm">
                  Cancel
                </OutlineButton>
                <PrimaryButton type="submit" variant="light" size="sm">
                  Save Note
                </PrimaryButton>
              </div>
            </form>
          </HardCard>
        </div>
      )}
    </div>
  );
}
