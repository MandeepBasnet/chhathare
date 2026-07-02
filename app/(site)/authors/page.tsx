import Link from "next/link";
import Image from "next/image";
import { User, Users } from "lucide-react";
import { listAuthors } from "@/lib/appwrite/data";
import { photoUrl } from "@/lib/appwrite/storage-url";

export const metadata = { title: "सर्जकहरू" };

export default async function AuthorsPage() {
  const authors = await listAuthors();
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold">सर्जकहरू</h1>
      <p className="mt-1 text-[var(--color-muted)]">छथरे लिम्बु साहित्यका स्रष्टाहरू।</p>

      {authors.length === 0 ? (
        <div className="mt-10 rounded-xl border border-dashed border-[var(--border)] p-12 text-center text-[var(--color-muted)]">
          <Users className="mx-auto h-10 w-10" />
          <p className="mt-2">अहिले कुनै सर्जक थपिएको छैन।</p>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {authors.map((a) => {
            const photo = photoUrl(a.photoId, { width: 200, height: 200, quality: 75, bucket: "general" });
            return (
              <Link
                key={a.$id}
                href={`/authors/${a.slug}`}
                className="flex flex-col items-center rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 text-center transition hover:border-mountain-400 hover:shadow-md"
              >
                <div className="relative h-20 w-20 overflow-hidden rounded-full bg-mountain-50">
                  {photo ? (
                    <Image src={photo} alt={a.name} fill className="object-cover" sizes="80px" />
                  ) : (
                    <div className="absolute inset-0 grid place-items-center text-mountain-300">
                      <User className="h-8 w-8" />
                    </div>
                  )}
                </div>
                <div className="mt-3 font-semibold">{a.name}</div>
                {a.nameLimbu && <div className="font-limbu text-sm text-[var(--color-muted)]">{a.nameLimbu}</div>}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
