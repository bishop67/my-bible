import Link from 'next/link';
import { formatTitle } from '@/lib/utils';
import manifest from '@/data/manifest.json';

export default function Home() {
  return (
    <main className="max-w-4xl mx-auto p-8">
      {Object.entries(manifest).map(([testament, sections]) => (
        <div key={testament} className="mb-10">
          <h2 className="text-2xl font-semibold mb-4 border-b pb-2">{testament}</h2>
          {Object.entries(sections).map(([section, books]) => (
            <div key={section} className="mb-6">
              <h3 className="text-sm font-semibold uppercase tracking-widest text-gray-400 mb-3">{section}</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {books.map((slug) => (
                  <Link
                    key={slug}
                    href={`/read/${slug}/1`}
                    className="p-3 border rounded hover:bg-gray-100 transition-colors text-sm font-medium"
                  >
                    {formatTitle(slug)}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      ))}
    </main>
  );
}
