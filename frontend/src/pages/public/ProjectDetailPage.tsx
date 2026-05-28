import { useParams } from "react-router-dom";

export function ProjectDetailPage() {
  const { slug } = useParams();

  return (
    <main className="mx-auto max-w-7xl px-5 py-12">
      <h1 className="text-4xl font-black">Страница проекта</h1>
      <p className="mt-3 text-slate-600 dark:text-slate-300">
        Slug проекта: {slug}
      </p>
    </main>
  );
}
