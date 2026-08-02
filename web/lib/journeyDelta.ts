import type { JourneyChanges, JourneyEntry } from "@/lib/types";

type Snapshot = JourneyEntry["snapshot"];

function listDelta(before: string[], after: string[]): JourneyChanges["aspirations"] | null {
  const beforeSet = new Set(before);
  const afterSet = new Set(after);
  const added = after.filter((item) => !beforeSet.has(item));
  const removed = before.filter((item) => !afterSet.has(item));
  if (!added.length && !removed.length) return null;
  return { added, removed };
}

export function computeChanges(previous: Snapshot, current: Snapshot): JourneyChanges | null {
  const changes: JourneyChanges = {};
  const prevWho = previous.who_now.trim();
  const currWho = current.who_now.trim();
  if (prevWho !== currWho) {
    changes.who_now = { before: previous.who_now, after: current.who_now };
  }
  const aspirations = listDelta(previous.aspirations, current.aspirations);
  if (aspirations) changes.aspirations = aspirations;
  const habits = listDelta(previous.habits, current.habits);
  if (habits) changes.habits = habits;
  return Object.keys(changes).length ? changes : null;
}

export function resolveEntryChanges(
  entry: JourneyEntry,
  index: number,
  journey: JourneyEntry[],
): JourneyChanges | null {
  if (entry.changes) return entry.changes;
  if (index === 0) return null;
  return computeChanges(journey[index - 1].snapshot, entry.snapshot);
}
