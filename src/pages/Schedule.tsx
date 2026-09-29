import { useEffect, useMemo, useState, type SyntheticEvent } from "react";
import {
  CalendarClock,
  Clock3,
  MapPin,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import {
  createScheduleEvent,
  deleteScheduleEvent,
  getSchedule,
  updateScheduleEvent,
  type PublicSchedule,
  type ScheduleEvent,
  type ScheduleEventInput,
} from "@/api/admin";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type FormValues = {
  title: string;
  description: string;
  location: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
};

const EMPTY_FORM: FormValues = {
  title: "",
  description: "",
  location: "",
  startDate: "",
  startTime: "",
  endDate: "",
  endTime: "",
};

function backendDateTimeParts(iso: string): { date: string; time: string } {
  return { date: iso.slice(0, 10), time: iso.slice(11, 16) };
}

function backendOffsetMinutes(iso: string): number {
  if (iso.endsWith("Z")) return 0;
  const match = /([+-])(\d{2}):(\d{2})$/.exec(iso);
  if (!match) return 0;
  const minutes = Number(match[2]) * 60 + Number(match[3]);
  return match[1] === "+" ? minutes : -minutes;
}

function absoluteDateTimeParts(
  iso: string,
  offsetMinutes: number,
): { date: string; time: string } {
  const shifted = new Date(
    new Date(iso).getTime() + offsetMinutes * 60_000,
  ).toISOString();
  return backendDateTimeParts(shifted);
}

function eventLocalToDate(
  date: string,
  time: string,
  offsetMinutes: number,
): Date {
  const [year, month, day] = date.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);
  return new Date(
    Date.UTC(year, month - 1, day, hour, minute) - offsetMinutes * 60_000,
  );
}

function defaultForm(schedule: PublicSchedule): FormValues {
  const start = backendDateTimeParts(schedule.event_start_at);
  const offsetMinutes = backendOffsetMinutes(schedule.event_start_at);
  const endBoundary = new Date(schedule.event_end_at);
  const proposedEnd = new Date(
    Math.min(
      new Date(schedule.event_start_at).getTime() + 60 * 60_000,
      endBoundary.getTime(),
    ),
  );
  const end = absoluteDateTimeParts(proposedEnd.toISOString(), offsetMinutes);
  return {
    ...EMPTY_FORM,
    startDate: start.date,
    startTime: start.time,
    endDate: end.date,
    endTime: end.time,
  };
}

function formatEventTime(iso: string, offsetMinutes: number): string {
  const shifted = new Date(new Date(iso).getTime() + offsetMinutes * 60_000);
  return new Intl.DateTimeFormat("en-CA", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "UTC",
  }).format(shifted);
}

function formatDay(date: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T12:00:00Z`));
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Something went wrong";
}

export default function Schedule() {
  const [schedule, setSchedule] = useState<PublicSchedule | null>(null);
  const [form, setForm] = useState<FormValues>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function loadSchedule(signal?: AbortSignal) {
    try {
      const data = await getSchedule(signal);
      setSchedule(data);
      setForm((current) => (current.startDate ? current : defaultForm(data)));
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      toast.error(errorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const controller = new AbortController();
    void loadSchedule(controller.signal);
    return () => {
      controller.abort();
    };
  }, []);

  const bounds = useMemo(() => {
    if (!schedule) return null;
    const start = backendDateTimeParts(schedule.event_start_at);
    const end = backendDateTimeParts(schedule.event_end_at);
    const days: string[] = [];
    const cursor = new Date(`${start.date}T12:00:00Z`);
    const last = new Date(`${end.date}T12:00:00Z`);
    while (cursor <= last) {
      days.push(cursor.toISOString().slice(0, 10));
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }
    return {
      start,
      end,
      days,
      offsetMinutes: backendOffsetMinutes(schedule.event_start_at),
    };
  }, [schedule]);

  function updateField(field: keyof FormValues, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function resetForm() {
    setForm(schedule ? defaultForm(schedule) : EMPTY_FORM);
    setEditingId(null);
  }

  function beginEdit(event: ScheduleEvent) {
    const offsetMinutes = bounds?.offsetMinutes ?? 0;
    setEditingId(event.id);
    setForm({
      title: event.title,
      description: event.description ?? "",
      location: event.location ?? "",
      startDate: absoluteDateTimeParts(event.starts_at, offsetMinutes).date,
      startTime: absoluteDateTimeParts(event.starts_at, offsetMinutes).time,
      endDate: absoluteDateTimeParts(event.ends_at, offsetMinutes).date,
      endTime: absoluteDateTimeParts(event.ends_at, offsetMinutes).time,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function submit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    const offsetMinutes = bounds?.offsetMinutes ?? 0;
    const start = eventLocalToDate(
      form.startDate,
      form.startTime,
      offsetMinutes,
    );
    const end = eventLocalToDate(form.endDate, form.endTime, offsetMinutes);
    if (start >= end) {
      toast.error("The end time must be after the start time.");
      return;
    }

    const payload: ScheduleEventInput = {
      title: form.title.trim(),
      description: form.description.trim() || null,
      location: form.location.trim() || null,
      starts_at: start.toISOString(),
      ends_at: end.toISOString(),
    };

    setSaving(true);
    try {
      if (editingId) {
        await updateScheduleEvent(editingId, payload);
        toast.success("Event updated");
      } else {
        await createScheduleEvent(payload);
        toast.success("Event added to the schedule");
      }
      resetForm();
      await loadSchedule();
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  function setDuration(minutes: number) {
    if (!form.startDate || !form.startTime || !schedule) return;
    const offsetMinutes = bounds?.offsetMinutes ?? 0;
    const start = eventLocalToDate(
      form.startDate,
      form.startTime,
      offsetMinutes,
    );
    const eventEnd = new Date(schedule.event_end_at);
    const end = new Date(
      Math.min(start.getTime() + minutes * 60_000, eventEnd.getTime()),
    );
    const endParts = absoluteDateTimeParts(end.toISOString(), offsetMinutes);
    setForm((current) => ({
      ...current,
      endDate: endParts.date,
      endTime: endParts.time,
    }));
  }

  async function removeEvent(event: ScheduleEvent) {
    if (!window.confirm(`Delete “${event.title}” from the schedule?`)) return;
    setDeletingId(event.id);
    try {
      await deleteScheduleEvent(event.id);
      toast.success("Event deleted");
      if (editingId === event.id) resetForm();
      await loadSchedule();
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <main className="min-w-0 flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <header className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight">Schedule</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Add and manage events during the hackathon.
          </p>
          {schedule && (
            <p className="mt-2 inline-flex items-center gap-2 text-sm font-medium">
              <CalendarClock className="h-4 w-4" />
              {formatEventTime(
                schedule.event_start_at,
                bounds?.offsetMinutes ?? 0,
              )}{" "}
              –{" "}
              {formatEventTime(
                schedule.event_end_at,
                bounds?.offsetMinutes ?? 0,
              )}
            </p>
          )}
        </header>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg">
              {editingId ? "Edit event" : "Add an event"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit} className="grid gap-5">
              <div className="grid gap-2">
                <Label htmlFor="event-title">Title</Label>
                <Input
                  id="event-title"
                  maxLength={120}
                  required
                  value={form.title}
                  onChange={(event) => {
                    updateField("title", event.target.value);
                  }}
                  placeholder="Opening ceremony"
                />
              </div>
              <fieldset className="grid gap-4 rounded-lg border bg-muted/20 p-4">
                <legend className="px-1 text-sm font-medium">When</legend>
                <div className="grid gap-5 lg:grid-cols-2">
                  <div className="grid gap-3">
                    <Label>Starts</Label>
                    <div
                      className="flex flex-wrap gap-2"
                      aria-label="Start day"
                    >
                      {bounds?.days.map((day) => (
                        <Button
                          key={`start-${day}`}
                          type="button"
                          size="sm"
                          variant={
                            form.startDate === day ? "default" : "outline"
                          }
                          onClick={() => {
                            setForm((current) => ({
                              ...current,
                              startDate: day,
                              endDate:
                                current.endDate < day ? day : current.endDate,
                            }));
                          }}
                        >
                          {formatDay(day)}
                        </Button>
                      ))}
                    </div>
                    <Input
                      id="event-start-time"
                      className="schedule-time-input"
                      aria-label="Start time"
                      type="time"
                      step={300}
                      min={
                        form.startDate === bounds?.start.date
                          ? bounds.start.time
                          : undefined
                      }
                      max={
                        form.startDate === bounds?.end.date
                          ? bounds.end.time
                          : undefined
                      }
                      required
                      value={form.startTime}
                      onChange={(event) => {
                        updateField("startTime", event.target.value);
                      }}
                    />
                  </div>

                  <div className="grid gap-3">
                    <Label>Ends</Label>
                    <div className="flex flex-wrap gap-2" aria-label="End day">
                      {bounds?.days.map((day) => (
                        <Button
                          key={`end-${day}`}
                          type="button"
                          size="sm"
                          variant={form.endDate === day ? "default" : "outline"}
                          disabled={day < form.startDate}
                          onClick={() => {
                            updateField("endDate", day);
                          }}
                        >
                          {formatDay(day)}
                        </Button>
                      ))}
                    </div>
                    <Input
                      id="event-end-time"
                      className="schedule-time-input"
                      aria-label="End time"
                      type="time"
                      step={300}
                      min={
                        form.endDate === form.startDate
                          ? form.startTime
                          : form.endDate === bounds?.start.date
                            ? bounds.start.time
                            : undefined
                      }
                      max={
                        form.endDate === bounds?.end.date
                          ? bounds.end.time
                          : undefined
                      }
                      required
                      value={form.endTime}
                      onChange={(event) => {
                        updateField("endTime", event.target.value);
                      }}
                    />
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 border-t pt-3">
                  <span className="mr-1 text-xs font-medium text-muted-foreground">
                    Quick duration
                  </span>
                  {[30, 60, 90, 120].map((minutes) => (
                    <Button
                      key={minutes}
                      type="button"
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        setDuration(minutes);
                      }}
                    >
                      {minutes < 60
                        ? `${String(minutes)} min`
                        : `${String(minutes / 60)} hr`}
                    </Button>
                  ))}
                </div>
              </fieldset>
              <div className="grid gap-2">
                <Label htmlFor="event-location">Location (optional)</Label>
                <Input
                  id="event-location"
                  maxLength={160}
                  value={form.location}
                  onChange={(event) => {
                    updateField("location", event.target.value);
                  }}
                  placeholder="The Launchpad"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="event-description">
                  Description (optional)
                </Label>
                <Textarea
                  id="event-description"
                  maxLength={1000}
                  value={form.description}
                  onChange={(event) => {
                    updateField("description", event.target.value);
                  }}
                  placeholder="What attendees need to know"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Button type="submit" disabled={saving || !schedule}>
                  {editingId ? <Pencil /> : <Plus />}
                  {saving
                    ? "Saving…"
                    : editingId
                      ? "Save changes"
                      : "Add event"}
                </Button>
                {editingId && (
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        <section aria-labelledby="scheduled-events-heading">
          <h2
            id="scheduled-events-heading"
            className="mb-4 text-lg font-semibold"
          >
            Scheduled events
          </h2>
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading schedule…</p>
          ) : !schedule?.events.length ? (
            <div className="rounded-lg border border-dashed p-10 text-center text-sm text-muted-foreground">
              No events yet. Add the first event above.
            </div>
          ) : (
            <div className="grid gap-3">
              {schedule.events.map((event) => (
                <Card key={event.id}>
                  <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <h3 className="font-semibold">{event.title}</h3>
                      <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock3 className="h-4 w-4 shrink-0" />
                        {formatEventTime(
                          event.starts_at,
                          bounds?.offsetMinutes ?? 0,
                        )}{" "}
                        –{" "}
                        {formatEventTime(
                          event.ends_at,
                          bounds?.offsetMinutes ?? 0,
                        )}
                      </p>
                      {event.location && (
                        <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4 shrink-0" />{" "}
                          {event.location}
                        </p>
                      )}
                      {event.description && (
                        <p className="mt-2 max-w-2xl whitespace-pre-wrap text-sm">
                          {event.description}
                        </p>
                      )}
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          beginEdit(event);
                        }}
                      >
                        <Pencil /> Edit
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        disabled={deletingId === event.id}
                        onClick={() => void removeEvent(event)}
                      >
                        <Trash2 />{" "}
                        {deletingId === event.id ? "Deleting…" : "Delete"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
