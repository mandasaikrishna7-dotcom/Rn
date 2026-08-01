"use client";

import { useState } from "react";
import { Plus, FileText, Tag, Calendar, Download } from "lucide-react";

export default function NotesPage() {
  const [selectedNotes, setSelectedNotes] = useState<string[]>([]);
  
  // Placeholder notes data
  const notes = [
    {
      id: "1",
      title: "Deep Work Insights",
      content: "Key takeaways from exploring focused work strategies...",
      tags: ["productivity", "focus"],
      created_at: "2024-01-15T10:30:00Z",
      linked_items: ["item_001"]
    },
    {
      id: "2", 
      title: "Systems Thinking Notes",
      content: "Understanding emergent behaviors in complex systems...",
      tags: ["systems", "complexity"],
      created_at: "2024-01-12T14:20:00Z",
      linked_items: ["item_002"]
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="serif-heading text-3xl mb-2 text-ink">Notes</h1>
          <p className="text-muted">Your captured insights and reflections</p>
        </div>
        <button className="btn-primary-new">
          <Plus size={16} />
          New Note
        </button>
      </div>

      {/* Filters */}
      <div className="hard-card p-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <Tag size={16} className="text-lagoon" />
            <select className="input-base">
              <option>All tags</option>
              <option>productivity</option>
              <option>systems</option>
              <option>complexity</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-lagoon" />
            <select className="input-base">
              <option>All dates</option>
              <option>This week</option>
              <option>This month</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <Download size={16} className="text-lagoon" />
            <button className="btn-secondary-new">
              Export PDF
            </button>
          </div>
        </div>
      </div>

      {/* Notes Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {notes.map((note, index) => (
          <div 
            key={note.id}
            className={`hard-card p-6 cursor-pointer settle stagger-${index + 1}`}
            onClick={() => {
              const newSelected = selectedNotes.includes(note.id)
                ? selectedNotes.filter(id => id !== note.id)
                : [...selectedNotes, note.id];
              setSelectedNotes(newSelected);
            }}
          >
            <div className="flex items-start justify-between mb-3">
              <h3 className="serif-heading text-lg text-ink">{note.title}</h3>
              <input 
                type="checkbox"
                checked={selectedNotes.includes(note.id)}
                onChange={() => {}}
                className="ml-2"
              />
            </div>
            
            <p className="text-sm leading-relaxed mb-4 text-muted">
              {note.content}
            </p>
            
            <div className="flex flex-wrap gap-2 mb-3">
              {note.tags.map(tag => (
                <span 
                  key={tag}
                  className="accent-chip px-2 py-1 text-xs rounded-md"
                >
                  {tag}
                </span>
              ))}
            </div>
            
            <div className="flex items-center gap-4 text-xs text-muted">
              <div className="flex items-center gap-1">
                <FileText size={12} />
                <span>{note.linked_items.length} linked items</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar size={12} />
                <span>{new Date(note.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {notes.length === 0 && (
        <div className="journal-card p-12 text-center">
          <FileText size={48} className="text-lagoon mx-auto mb-4" />
          <h3 className="serif-heading text-xl text-ink mb-2">No notes yet</h3>
          <p className="text-muted mb-6">
            Start capturing insights from your curated content
          </p>
          <button className="btn-base btn-primary">
            <Plus size={16} />
            Create your first note
          </button>
        </div>
      )}
    </div>
  );
}
