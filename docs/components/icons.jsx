// ──────────────────────────────────────────────────────────────
// LIULIAN — icon set (Lucide-style strokes · 16×16 · 1.4 stroke)
// ──────────────────────────────────────────────────────────────

function Icon({ name, size = 14, color = "currentColor", strokeWidth = 1.4 }) {
  const common = {
    width: size, height: size, viewBox: "0 0 16 16",
    fill: "none", stroke: color, strokeWidth, strokeLinecap: "round", strokeLinejoin: "round",
    style: { display: "block", flex: "0 0 auto" },
  };
  switch (name) {
    case "sunrise": // Today · morning watch
      return <svg {...common}><circle cx="8" cy="9" r="2.6" /><line x1="8" y1="3.2" x2="8" y2="4.4" /><line x1="3.2" y1="9" x2="4.4" y2="9" /><line x1="11.6" y1="9" x2="12.8" y2="9" /><line x1="4.6" y1="5.6" x2="5.5" y2="6.5" /><line x1="11.4" y1="5.6" x2="10.5" y2="6.5" /><line x1="2" y1="12.5" x2="14" y2="12.5" /></svg>;
    case "activity": // Forecast
      return <svg {...common}><polyline points="1.5,9 4,9 5.5,4.5 8,12 9.5,7 11,9 14.5,9" /></svg>;
    case "database": // Data
      return <svg {...common}><ellipse cx="8" cy="3.4" rx="5.2" ry="1.8" /><path d="M 2.8 3.4 L 2.8 8 C 2.8 9 5.1 9.8 8 9.8 C 10.9 9.8 13.2 9 13.2 8 L 13.2 3.4" /><path d="M 2.8 8 L 2.8 12.6 C 2.8 13.6 5.1 14.4 8 14.4 C 10.9 14.4 13.2 13.6 13.2 12.6 L 13.2 8" /></svg>;
    case "bar-chart": // Visualize
      return <svg {...common}><rect x="2.2" y="9" width="2.4" height="4.8" /><rect x="6.8" y="5.6" width="2.4" height="8.2" /><rect x="11.4" y="2.6" width="2.4" height="11.2" /></svg>;
    case "sparkles": // Train
      return <svg {...common}><path d="M 5 2 L 6 5 L 9 6 L 6 7 L 5 10 L 4 7 L 1 6 L 4 5 Z" /><path d="M 11.5 8 L 12 10 L 14 10.5 L 12 11 L 11.5 13 L 11 11 L 9 10.5 L 11 10 Z" /></svg>;
    case "broadcast": // Inference
      return <svg {...common}><circle cx="8" cy="8" r="1.6" /><path d="M 5.4 5.4 A 3.6 3.6 0 0 0 5.4 10.6" /><path d="M 10.6 5.4 A 3.6 3.6 0 0 1 10.6 10.6" /><path d="M 3.2 3.2 A 6.8 6.8 0 0 0 3.2 12.8" /><path d="M 12.8 3.2 A 6.8 6.8 0 0 1 12.8 12.8" /></svg>;
    case "newspaper": // Reports
      return <svg {...common}><rect x="2.4" y="3" width="9.4" height="10" rx="0.6" /><path d="M 11.8 5.4 L 13.6 5.4 L 13.6 11.6 A 1.4 1.4 0 0 1 12.2 13 L 11.8 13" /><line x1="4.5" y1="5.6" x2="9.7" y2="5.6" /><line x1="4.5" y1="7.8" x2="9.7" y2="7.8" /><line x1="4.5" y1="10" x2="9.7" y2="10" /></svg>;
    case "box": // Models
      return <svg {...common}><path d="M 8 2 L 13.6 5 L 13.6 11 L 8 14 L 2.4 11 L 2.4 5 Z" /><polyline points="2.4,5 8,8 13.6,5" /><line x1="8" y1="8" x2="8" y2="14" /></svg>;
    case "library": // Library (cross-project)
      return <svg {...common}><line x1="3" y1="3" x2="3" y2="13" /><line x1="5.5" y1="3" x2="5.5" y2="13" /><rect x="7.6" y="3.2" width="2.4" height="9.6" /><path d="M 11.2 4.2 L 13.6 13 L 11.6 13.4 L 9.2 4.6 Z" /></svg>;
    case "agent": // Agent
      return <svg {...common}><rect x="2.4" y="3.4" width="11.2" height="8" rx="2" /><line x1="6" y1="6.6" x2="6" y2="7.4" /><line x1="10" y1="6.6" x2="10" y2="7.4" /><path d="M 6 9 Q 8 10.4 10 9" /><line x1="8" y1="1.6" x2="8" y2="3.4" /><line x1="5.4" y1="13.4" x2="10.6" y2="13.4" /></svg>;
    case "sliders": // Settings
      return <svg {...common}><line x1="2" y1="5" x2="14" y2="5" /><circle cx="6" cy="5" r="1.6" /><line x1="2" y1="11" x2="14" y2="11" /><circle cx="11" cy="11" r="1.6" /></svg>;
    case "help": // ? guides
      return <svg {...common}><circle cx="8" cy="8" r="6" /><path d="M 6 6.4 Q 6 4.6 8 4.6 Q 10 4.6 10 6.4 Q 10 7.6 8 8.4 L 8 9.4" /><circle cx="8" cy="11.4" r="0.4" fill={color} stroke="none" /></svg>;
    case "command":
      return <svg {...common}><path d="M 6 4 L 6 12 M 10 4 L 10 12 M 4 6 L 12 6 M 4 10 L 12 10" /><circle cx="4" cy="4" r="1.4" /><circle cx="12" cy="4" r="1.4" /><circle cx="4" cy="12" r="1.4" /><circle cx="12" cy="12" r="1.4" /></svg>;
    case "chevron-down":
      return <svg {...common}><polyline points="4,6.5 8,10 12,6.5" /></svg>;
    case "chevron-right":
      return <svg {...common}><polyline points="6.5,4 10,8 6.5,12" /></svg>;
    case "plus":
      return <svg {...common}><line x1="8" y1="3" x2="8" y2="13" /><line x1="3" y1="8" x2="13" y2="8" /></svg>;
    case "arrow-right":
      return <svg {...common}><line x1="3" y1="8" x2="13" y2="8" /><polyline points="9.5,4.5 13,8 9.5,11.5" /></svg>;
    case "doorway":
      return <svg {...common}><rect x="4" y="2.4" width="8" height="11.2" /><circle cx="9.6" cy="8.4" r="0.6" fill={color} /></svg>;
    case "drop":
      return <svg {...common}><path d="M 8 2 Q 4 7 4 10 A 4 4 0 0 0 12 10 Q 12 7 8 2 Z" /></svg>;
    case "light":
      return <svg {...common}><path d="M 5.6 9.6 A 3 3 0 1 1 10.4 9.6 L 9.6 11 L 6.4 11 Z" /><line x1="6.8" y1="13" x2="9.2" y2="13" /><line x1="8" y1="2.4" x2="8" y2="3.6" /><line x1="3.2" y1="6.5" x2="4.2" y2="6.5" /><line x1="11.8" y1="6.5" x2="12.8" y2="6.5" /><line x1="4.4" y1="3.6" x2="5.2" y2="4.4" /><line x1="11.6" y1="3.6" x2="10.8" y2="4.4" /></svg>;
    case "pencil":
      return <svg {...common}><path d="M 3 13 L 3 11 L 11 3 L 13 5 L 5 13 Z" /><line x1="10" y1="4" x2="12" y2="6" /></svg>;
    case "graft":
      return <svg {...common}><circle cx="4" cy="4" r="1.4" /><circle cx="4" cy="12" r="1.4" /><circle cx="12" cy="8" r="1.4" /><line x1="5.2" y1="4.6" x2="10.8" y2="7.4" /><line x1="5.2" y1="11.4" x2="10.8" y2="8.6" /></svg>;
    case "easel":
      return <svg {...common}><line x1="3" y1="13.5" x2="13" y2="13.5" /><line x1="5" y1="13.5" x2="6" y2="9" /><line x1="11" y1="13.5" x2="10" y2="9" /><rect x="3.6" y="2.4" width="8.8" height="6.6" rx="0.5" /><polyline points="5.4,7.4 7,5.6 8.4,6.6 10.6,4.4" /></svg>;
    default:
      return <svg {...common}><circle cx="8" cy="8" r="2" /></svg>;
  }
}

Object.assign(window, { Icon });
