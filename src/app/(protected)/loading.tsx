export default function Loading() {
  return <main className="page-content" aria-busy="true"><div className="skeleton title-skeleton" /><div className="metrics-grid">{Array.from({length:9},(_,i)=><div className="skeleton metric-skeleton" key={i} />)}</div><div className="skeleton content-skeleton" /></main>;
}