// Every route arrives the same way: ink settling onto the page. A template remounts
// on each navigation, so the CSS animation replays without waiting for hydration.
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="animate-ink-in">{children}</div>;
}
