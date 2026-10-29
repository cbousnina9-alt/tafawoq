// أيقونة لكل مادة: لون خاص + رسم بسيط (أو حروف للغات)
type Def = { fg: string; bg: string; d?: string[]; text?: string; extra?: React.ReactNode };

const C = (fg: string, bg: string) => ({ fg, bg });

const defs: Record<string, Def> = {
  math: { ...C('#2f4be0', '#eceffd'), d: ['M18 5H7l5.5 7L7 19h11'] },
  physics: {
    ...C('#7c3aed', '#f3edff'),
    extra: (
      <>
        <circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none" />
        <ellipse cx="12" cy="12" rx="9.5" ry="3.8" />
        <ellipse cx="12" cy="12" rx="9.5" ry="3.8" transform="rotate(60 12 12)" />
        <ellipse cx="12" cy="12" rx="9.5" ry="3.8" transform="rotate(120 12 12)" />
      </>
    ),
  },
  science: { ...C('#15803d', '#e6f5ec'), d: ['M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.5 19 2c1 2 2 4.2 2 8 0 5.5-4.8 10-10 10Z', 'M2 21c0-3 1.9-5.4 5.1-6'] },
  scientific: { ...C('#15803d', '#e6f5ec'), d: ['M9 3h6', 'M10 3v6L5 18a2 2 0 0 0 1.7 3h10.6a2 2 0 0 0 1.7-3l-5-9V3', 'M7.5 15h9'] },
  arabic: { ...C('#b45309', '#fff3e2'), text: 'ض' },
  french: { ...C('#1d4ed8', '#e7efff'), text: 'Fr' },
  english: { ...C('#be123c', '#ffeaf0'), text: 'En' },
  tamazight: { ...C('#c2410c', '#ffefe5'), text: 'ⵣ' },
  german: { ...C('#4b5563', '#f0f1f4'), text: 'De' },
  spanish: { ...C('#4b5563', '#f0f1f4'), text: 'Es' },
  italian: { ...C('#4b5563', '#f0f1f4'), text: 'It' },
  islamic: { ...C('#0f766e', '#e3f5f2'), d: ['M20 14.5A8.5 8.5 0 1 1 9.5 4 6.8 6.8 0 0 0 20 14.5Z', 'm17 4 .7 1.5 1.6.2-1.2 1.1.3 1.6-1.4-.8-1.4.8.3-1.6-1.2-1.1 1.6-.2Z'] },
  civic: { ...C('#475569', '#edf1f6'), d: ['M3 21h18', 'M5 21v-9', 'M9.7 21v-9', 'M14.3 21v-9', 'M19 21v-9', 'M2.5 9 12 3l9.5 6Z'] },
  'history-geo': {
    ...C('#9a3412', '#fcede4'),
    extra: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18" />
        <path d="M12 3a14 14 0 0 1 0 18 14 14 0 0 1 0-18" />
      </>
    ),
  },
  geography: {
    ...C('#0369a1', '#e4f3fb'),
    d: ['M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2Z', 'M9 4v14', 'M15 6v14'],
  },
  history: { ...C('#9a3412', '#fcede4'), d: ['M7 3h10', 'M7 21h10', 'M8 3c0 6 8 6 8 9s-8 3-8 9', 'M16 3c0 6-8 6-8 9s8 3 8 9'] },
  philosophy: { ...C('#a16207', '#fdf5d8'), d: ['M9 18h6', 'M10 21h4', 'M12 3a6 6 0 0 0-4 10.5c.8.8 1 1.5 1 2.5h6c0-1 .2-1.7 1-2.5A6 6 0 0 0 12 3Z'] },
  informatics: { ...C('#0e7490', '#e3f6f9'), d: ['M5 4h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z', 'M8 20h8', 'M12 16v4'] },
  economics: { ...C('#4d7c0f', '#eff6e1'), d: ['M3 3v18h18', 'm7 15 4-4 3 3 6-7'] },
  accounting: { ...C('#6d28d9', '#f1ebfe'), d: ['M7 3h10a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z', 'M8.5 7h7', 'M9 12h.01', 'M12 12h.01', 'M15 12h.01', 'M9 16h.01', 'M12 16h.01', 'M15 16h.01'] },
  law: { ...C('#334155', '#edf0f5'), d: ['M12 3v18', 'M7 21h10', 'M4 7h16', 'm5 7-3 6a3 3 0 0 0 6 0Z', 'm19 7-3 6a3 3 0 0 0 6 0Z'] },
  engineering: {
    ...C('#57534e', '#f2f0ee'),
    extra: (
      <>
        <circle cx="12" cy="12" r="3.2" />
        <path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1" />
      </>
    ),
  },
};

const fallback: Def = { ...C('#475569', '#edf1f6'), d: ['M4 5h16v14H4Z', 'M8 9h8', 'M8 13h5'] };

export function subjectColor(s: string) {
  const x = defs[s] || fallback;
  return { fg: x.fg, bg: x.bg };
}

export default function SubjectIcon({ subject, size = 44 }: { subject: string; size?: number }) {
  const x = defs[subject] || fallback;
  return (
    <span className="subj-icon" style={{ width: size, height: size, background: x.bg, color: x.fg }} aria-hidden>
      {x.text ? (
        <span className="subj-text" style={{ fontSize: x.text.length > 1 ? size * 0.36 : size * 0.5 }}>{x.text}</span>
      ) : (
        <svg width={size * 0.52} height={size * 0.52} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
          {x.d?.map((p, i) => <path key={i} d={p} />)}
          {x.extra}
        </svg>
      )}
    </span>
  );
}
