const base = { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true };

export const SearchIcon = () => (<svg {...base}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>);
export const DownloadIcon = () => (<svg {...base}><path d="M12 3v12" /><path d="m7 10 5 5 5-5" /><path d="M5 21h14" /></svg>);
export const StarIcon = ({ filled }: { filled?: boolean }) => (<svg {...base} fill={filled ? 'currentColor' : 'none'}><path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.3 6.5 20.2l1-6.2L3 9.6l6.2-.9z" /></svg>);
export const MenuIcon = () => (<svg {...base}><path d="M4 7h16M4 12h16M4 17h16" /></svg>);
export const CloseIcon = () => (<svg {...base}><path d="M6 6l12 12M18 6 6 18" /></svg>);
export const CheckIcon = () => (<svg {...base}><path d="m5 12 5 5 9-10" /></svg>);
