import { useEffect, useState, type SubmitEvent } from "react";
import { toast } from "sonner";
import {
  getRegistrationTimeRange,
  updateRegistrationTimeRange,
  type RegistrationTimeRange as TimeRange,
} from "@/api/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function utcDate(timestamp: string) {
  return new Date(timestamp).toISOString().slice(0, 10);
}

function utcTimestamp(timestamp: string) {
  return new Date(timestamp)
    .toISOString()
    .replace("T", " ")
    .replace(".000Z", " UTC");
}

export default function RegistrationTimeRange() {
  const [range, setRange] = useState<TimeRange | null>(null);
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await getRegistrationTimeRange(controller.signal);
        if (controller.signal.aborted) return;
        if (!data)
          throw new Error("No registration date range has been configured.");
        setRange(data);
        setStart(utcDate(data.start_at));
        setEnd(utcDate(data.end_at));
      } catch (error) {
        if (!controller.signal.aborted) {
          setError(
            error instanceof Error
              ? error.message
              : "Failed to load registration dates.",
          );
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    void load();
    return () => {
      controller.abort();
    };
  }, [attempt]);

  const invalidRange = Boolean(start && end && start >= end);
  const changed =
    range !== null &&
    (start !== utcDate(range.start_at) || end !== utcDate(range.end_at));

  async function save(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!range || !start || !end || invalidRange || saving || !changed) return;
    setSaving(true);
    setError(null);
    try {
      const updated = await updateRegistrationTimeRange({
        start_at: start,
        end_at: end,
      });
      setRange(updated);
      setStart(utcDate(updated.start_at));
      setEnd(utcDate(updated.end_at));
      toast.success("Registration dates updated");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to save registration dates.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <section
      aria-labelledby="registration-heading"
      className="mb-6 rounded-lg border bg-card p-5"
    >
      <h2 id="registration-heading" className="text-lg font-semibold">
        Registration date range
      </h2>
      {loading ? (
        <p role="status" className="mt-3 text-sm text-muted-foreground">
          Loading registration dates…
        </p>
      ) : (
        <>
          {range && (
            <form
              onSubmit={(event) => void save(event)}
              className="mt-3 space-y-4"
            >
              <p className="text-sm text-muted-foreground">
                Currently opens {utcTimestamp(range.start_at)} and closes{" "}
                {utcTimestamp(range.end_at)}.
              </p>
              <div className="grid gap-4 sm:max-w-xl sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="registration-start">Opening date (UTC)</Label>
                  <Input
                    id="registration-start"
                    type="date"
                    required
                    value={start}
                    disabled={saving}
                    onChange={(event) => {
                      setStart(event.target.value);
                    }}
                    aria-describedby="registration-date-help"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="registration-end">Closing date (UTC)</Label>
                  <Input
                    id="registration-end"
                    type="date"
                    required
                    value={end}
                    disabled={saving}
                    onChange={(event) => {
                      setEnd(event.target.value);
                    }}
                    aria-invalid={invalidRange}
                    aria-describedby={
                      invalidRange
                        ? "registration-range-error registration-date-help"
                        : "registration-date-help"
                    }
                  />
                </div>
              </div>
              <p
                id="registration-date-help"
                className="text-sm text-muted-foreground"
              >
                Saving sets both dates to 00:00 UTC. Registration closes at the
                start of the closing date. Existing times of day will be
                replaced.
              </p>
              {invalidRange && (
                <p
                  id="registration-range-error"
                  role="alert"
                  className="text-sm text-destructive"
                >
                  The closing date must be after the opening date.
                </p>
              )}
              <Button
                type="submit"
                disabled={saving || !start || !end || invalidRange || !changed}
              >
                {saving ? "Saving…" : "Save registration dates"}
              </Button>
            </form>
          )}
          {error && (
            <p role="alert" className="mt-3 text-sm text-destructive">
              {error}
            </p>
          )}
          {!range && (
            <Button
              type="button"
              variant="outline"
              className="mt-3"
              onClick={() => {
                setAttempt((value) => value + 1);
              }}
            >
              Retry
            </Button>
          )}
        </>
      )}
    </section>
  );
}
