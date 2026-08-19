"use client";

import { CircleAlert } from "lucide-react";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main className="page-content error-state"><CircleAlert size={32} /><h1>Project data unavailable</h1><p>The data could not be loaded. No internal error details were exposed.</p><button className="primary-button" onClick={reset}>Try again</button></main>;
}