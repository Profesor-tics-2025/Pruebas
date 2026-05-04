export default function PinturaPage() {
  const tecnicas = [
    {
      nombre: "Acuarela",
      descripcion:
        "Técnica ligera y transparente ideal para paisajes, flores y bocetos rápidos.",
      nivel: "Principiante",
    },
    {
      nombre: "Acrílico",
      descripcion:
        "Secado rápido, colores vibrantes y alta versatilidad para lienzo o madera.",
      nivel: "Intermedio",
    },
    {
      nombre: "Óleo",
      descripcion:
        "Gran profundidad de color y mezclas suaves, perfecto para retratos detallados.",
      nivel: "Avanzado",
    },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-b from-rose-50 via-white to-amber-50 text-slate-800">
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="inline-flex rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-rose-700">
              Arte & Creatividad
            </p>
            <h1 className="mt-4 text-4xl font-extrabold leading-tight text-slate-900 md:text-5xl">
              Descubre el mundo de la pintura
            </h1>
            <p className="mt-5 text-lg text-slate-600">
              Aprende técnicas, explora estilos y transforma ideas en obras visuales.
              Esta página está pensada para artistas principiantes y amantes del color.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button className="rounded-xl bg-rose-600 px-5 py-3 text-sm font-semibold text-white shadow transition hover:bg-rose-700">
                Empezar ahora
              </button>
              <button className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                Ver galería
              </button>
            </div>
          </div>

          <div className="rounded-3xl border border-rose-100 bg-white/90 p-8 shadow-xl shadow-rose-100">
            <h2 className="text-xl font-bold text-slate-900">Paleta recomendada</h2>
            <p className="mt-2 text-sm text-slate-600">
              Una selección de tonos base para composiciones equilibradas:
            </p>
            <div className="mt-6 grid grid-cols-5 gap-3">
              {["#E11D48", "#F97316", "#FACC15", "#10B981", "#3B82F6"].map((color) => (
                <div key={color} className="space-y-2 text-center">
                  <div className="h-12 w-12 rounded-full border border-slate-200" style={{ backgroundColor: color }} />
                  <span className="text-xs text-slate-500">{color}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-20">
        <h2 className="text-2xl font-bold text-slate-900">Técnicas principales</h2>
        <p className="mt-2 text-slate-600">
          Cada técnica aporta una personalidad distinta a tus obras.
        </p>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {tecnicas.map((tecnica) => (
            <article key={tecnica.nombre} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-rose-600">{tecnica.nivel}</p>
              <h3 className="mt-2 text-xl font-bold text-slate-900">{tecnica.nombre}</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">{tecnica.descripcion}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
