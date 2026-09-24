import { useState } from "react";

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-[var(--sz-24)] bg-bg-neutral-normal text-typo-neutral-normal">
      <h1 className="text-2xl font-bold">Vite + React + Tailwind v4</h1>
      <button
        onClick={() => setCount((c) => c + 1)}
        className="rounded-md bg-bg-brand-normal px-[var(--sz-16)] py-[var(--sz-8)] text-xs font-normal text-typo-inverse-normal shadow-black-sm transition-colors"
      >
        count is {count}
      </button>
      <p className="text-xs text-typo-neutral-light">
        Edit <code className="font-normal">src/App.tsx</code> and save to test
        HMR
      </p>
    </div>
  );
}

export default App;
