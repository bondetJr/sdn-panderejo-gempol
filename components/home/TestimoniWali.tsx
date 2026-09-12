import { Star, Quote } from "lucide-react";

type TestimonialItem = {
  id: string;
  nama: string;
  peran: string | null;
  pesan: string;
  rating: number | null;
};

export function TestimoniWali({
  testimoni,
}: {
  testimoni: TestimonialItem[];
}) {
  if (testimoni.length === 0) return null;

  return (
    <section className="bg-primary-teal-deep py-10 sm:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-center text-lg font-extrabold text-white sm:text-xl">
          Apa Kata Wali Murid?
        </h2>

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {testimoni.slice(0, 3).map((t) => (
            <div
              key={t.id}
              className="flex items-start gap-2.5 rounded-2xl bg-white/10 p-4"
            >
              <Quote className="mt-0.5 h-4 w-4 shrink-0 text-primary-teal-light" />
              <div className="min-w-0">
                <p className="text-xs leading-relaxed text-white/90 line-clamp-2">
                  {t.pesan}
                </p>
                <div className="mt-2 flex items-center justify-between gap-2">
                  <p className="truncate text-xs font-bold text-white">
                    {t.nama}
                  </p>
                  {t.rating && (
                    <div className="flex shrink-0 gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3 w-3 ${
                            i < t.rating!
                              ? "fill-joy-butter text-joy-butter"
                              : "text-white/20"
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
