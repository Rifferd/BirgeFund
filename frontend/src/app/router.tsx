import { Route, Routes } from "react-router-dom";

function HomePage() {
  return (
    <main className="min-h-screen bg-app text-text">
      <section className="container-page py-10 md:py-16">
        <div className="rounded-[32px] border border-border bg-white p-6 shadow-soft md:p-10">
          <p className="mb-4 inline-flex rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-bold text-amber-700">
            TEST MODE: реальные деньги не списываются
          </p>

          <h1 className="max-w-3xl text-4xl font-black leading-tight tracking-tight md:text-6xl">
            Поддерживайте полезные проекты Кыргызстана
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-7 text-muted md:text-lg">
            BirgeFund — demo краудфандинговой платформы. Здесь можно смотреть проекты,
            создавать сборы и поддерживать их только через тестовые платежи.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button className="min-h-11 rounded-2xl bg-primary px-5 py-3 text-sm font-bold text-white hover:bg-primary-dark">
              Найти проект
            </button>
            <button className="min-h-11 rounded-2xl border border-border bg-white px-5 py-3 text-sm font-bold text-text hover:bg-slate-50">
              Создать проект
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
    </Routes>
  );
}