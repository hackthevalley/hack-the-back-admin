import RegistrationTimeRange from "@/components/RegistrationTimeRange";

export default function Registration() {
  return (
    <main className="min-w-0 flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">
          Registration dates
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Set when registration opens and closes.
        </p>
      </header>
      <RegistrationTimeRange />
    </main>
  );
}
