import type { Project } from "@/entities/project/types";
import { useSubmitProjectToReview } from "@/features/projects/hooks/useSubmitProjectToReview";
import { getApiErrorMessage } from "@/shared/api";
import { buildProjectUrl } from "@/shared/config/routes";
import { Button } from "@/shared/ui";
import { Link } from "react-router-dom";

type AuthorProjectActionsProps = {
  project: Project;
};

export function AuthorProjectActions({ project }: AuthorProjectActionsProps) {
  const submitMutation = useSubmitProjectToReview();

  const canSubmitToReview = project.status === "draft" || project.status === "rejected";

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row">
        <Link to={buildProjectUrl(project.slug)}>
          <Button type="button" variant="secondary" className="w-full sm:w-auto">
            Открыть
          </Button>
        </Link>

        <Link to={`/author/projects/${project.id}/manage`}>
          <Button type="button" variant="secondary" className="w-full sm:w-auto">
            Управлять
          </Button>
        </Link>

        {canSubmitToReview ? (
          <Button
            type="button"
            className="w-full sm:w-auto"
            isLoading={submitMutation.isPending}
            onClick={() => submitMutation.mutate(project.id)}
          >
            На модерацию
          </Button>
        ) : null}
      </div>

      {submitMutation.isError ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-200">
          {getApiErrorMessage(submitMutation.error)}
        </div>
      ) : null}
    </div>
  );
}
