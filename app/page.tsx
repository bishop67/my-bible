import { Bitcount_Prop_Double_Ink } from 'next/font/google';
import Link from 'next/link';


const BOOKS = [
  { slug: "genesis", name: "Genesis" },
  { slug: "exodus", name: "Exodus" },
  { slug: "leviticus", name: "Leviticus" },
  { slug: "numbers", name: "Numbers" },
  { slug: "deuteronomy", name: "Deuteronomy" },
  { slug: "joshua", name: "Joshua" },
  { slug: "judges", name: "Judges" },
  { slug: "ruth", name: "Ruth" },
  { slug: "1-samuel", name: "1 Samuel" },
  { slug: "2-samuel", name: "2 Samuel" },
  { slug: "1-kings", name: "1 Kings" },
  { slug: "2-kings", name: "2 Kings" },
  { slug: "1-chronicles", name: "1 Chronicles" },
  { slug: "2-chronicles", name: "2 Chronicles" },
  { slug: "ezra", name: "Ezra" },
  { slug: "nehemiah", name: "Nehemiah" },
  { slug: "esther", name: "Esther" },
  { slug: "job", name: "Job" },
  { slug: "psalms", name: "Psalms" },
  { slug: "proverbs", name: "Proverbs" },
  { slug: "ecclesiastes", name: "Ecclesiastes" },
  { slug: "song-of-solomon", name: "Song of Solomon" },
  { slug: "isaiah", name: "Isaiah" },
  { slug: "jeremiah", name: "Jeremiah" },
  { slug: "lamentations", name: "Lamentations" },
  { slug: "ezekiel", name: "Ezekiel" },
  { slug: "daniel", name: "Daniel" },
  { slug: "hosea", name: "Hosea" },
  { slug: "joel", name: "Joel" },
  { slug: "amos", name: "Amos" },
  { slug: "obadiah", name: "Obadiah" },
  { slug: "jonah", name: "Jonah" },
  { slug: "micah", name: "Micah" },
  { slug: "nahum", name: "Nahum" },
  { slug: "habakkuk", name: "Habakkuk" },
  { slug: "zephaniah", name: "Zephaniah" },
  { slug: "haggai", name: "Haggai" },
  { slug: "zechariah", name: "Zechariah" },
  { slug: "malachi", name: "Malachi" },
  { slug: "matthew", name: "Matthew" },
  { slug: "mark", name: "Mark" },
  { slug: "luke", name: "Luke" },
  { slug: "john", name: "John" },
  { slug: "acts", name: "Acts" },
  { slug: "romans", name: "Romans" },
  { slug: "1-corinthians", name: "1 Corinthians" },
  { slug: "2-corinthians", name: "2 Corinthians" },
  { slug: "galatians", name: "Galatians" },
  { slug: "ephesians", name: "Ephesians" },
  { slug: "philippians", name: "Philippians" },
  { slug: "colossians", name: "Colossians" },
  { slug: "1-thessalonians", name: "1 Thessalonians" },
  { slug: "2-thessalonians", name: "2 Thessalonians" },
  { slug: "1-timothy", name: "1 Timothy" },
  { slug: "2-timothy", name: "2 Timothy" },
  { slug: "titus", name: "Titus" },
  { slug: "philemon", name: "Philemon" },
  { slug: "hebrews", name: "Hebrews" },
  { slug: "james", name: "James" },
  { slug: "1-peter", name: "1 Peter" },
  { slug: "2-peter", name: "2 Peter" },
  { slug: "1-john", name: "1 John" },
  { slug: "2-john", name: "2 John" },
  { slug: "3-john", name: "3 John" },
  { slug: "jude", name: "Jude" },
  { slug: "revelation", name: "Revelation" },
];

export default function Home() {
  return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {BOOKS.map((book) => (
          <Link
          key={book.slug}
          href={`/read/${book.slug}/1`}
          className="p-3 border rounded hover:bg-gray-100 transition-colors text-sm font-medium"
          >
            {book.name}
          </Link>
        ))}
      </div>
  )
}
