import { Link } from "react-router-dom";

import { useBanners } from "@/features/banners/hooks/useBanners";
import { getTranslation } from "@/shared/lib/getTranslation";
import type { LanguageCode } from "@/shared/types/api";
import { Button, Card, CardContent, ErrorState, LoadingState, StatusBadge } from "@/shared/ui";

type HomeBannersProps = {
  language: LanguageCode;
};

function normalizeLink(url: string | null | undefined) {
  if (!url) {
    return "/projects";
  }

  if (url.startsWith("http")) {
    return url;
  }

  return url.startsWith("/") ? url : `/${url}`;
}

export function HomeBanners({ language }: HomeBannersProps) {
  const bannersQuery = useBanners();

  const rawBanners = Array.isArray(bannersQuery.data) ? bannersQuery.data : [];

  const banners = rawBanners
    .filter((banner) => banner.is_active !== false)
    .filter((banner) => banner.placement === "home_hero" || banner.placement === "home_top")
    .sort((a, b) => Number(a.sort_order ?? 0) - Number(b.sort_order ?? 0));

  if (bannersQuery.isLoading) {
    return <LoadingState text="Загружаем баннеры..." />;
  }

  if (bannersQuery.isError) {
    return <ErrorState description="Не удалось загрузить баннеры." />;
  }

  if (banners.length === 0) {
    return null;
  }

  return (
    <section className="mx-auto max-w-7xl px-5 pb-12">
      <div className="grid gap-5 lg:grid-cols-2">
        {banners.map((banner) => {
          const translation = getTranslation(banner.translations, language);
          const linkUrl = normalizeLink(banner.link_url);

          return (
            <Card
              key={banner.id}
              className="overflow-hidden border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-amber-50 dark:border-emerald-900 dark:from-emerald-950/30 dark:via-slate-900 dark:to-amber-950/20"
            >
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <StatusBadge tone="emerald">BirgeFund</StatusBadge>
                  <StatusBadge tone="amber">TEST MODE</StatusBadge>
                </div>

                <h2 className="mt-5 text-2xl font-black leading-tight md:text-3xl">
                  {translation?.title ?? banner.slug}
                </h2>

                {translation?.subtitle ? (
                  <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300 md:text-base">
                    {translation.subtitle}
                  </p>
                ) : null}

                <Link
                  to={linkUrl}
                  className="mt-5 inline-flex"
                  target={linkUrl.startsWith("http") ? "_blank" : undefined}
                  rel={linkUrl.startsWith("http") ? "noreferrer" : undefined}
                >
                  <Button>
                    {translation?.cta_text || "Открыть"}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
