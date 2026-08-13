export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-foreground">
            Personal Finance
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track income, expenses, and budgets in one place.
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
