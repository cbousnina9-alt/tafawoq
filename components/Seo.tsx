import Link from 'next/link';
import { abs } from '@/lib/site';

export function JsonLd({ data }: { data: object | object[] }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }} />;
}

export type Crumb = { name: string; href: string };

/** مسار التنقل + بيانات BreadcrumbList لجوجل */
export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav className="crumbs" aria-label="breadcrumb">
      <ol>
        {items.map((c, i) => (
          <li key={c.href}>
            {i === items.length - 1 ? <span aria-current="page">{c.name}</span> : <Link href={c.href}>{c.name}</Link>}
          </li>
        ))}
      </ol>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: items.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.name, item: abs(c.href) })),
        }}
      />
    </nav>
  );
}
