import { useState } from "react";
import { Link } from "react-router-dom";

import type { ProjectComment } from "@/entities/comment/types";
import { useCreateProjectComment } from "@/features/comments/hooks/useCreateProjectComment";
import { useProjectComments } from "@/features/comments/hooks/useProjectComments";
import { useAuthStore } from "@/features/auth/model/authStore";
import { getApiErrorMessage } from "@/shared/api";
import { routes } from "@/shared/config/routes";
import { formatDate } from "@/shared/lib/formatDate";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  EmptyState,
  ErrorState,
  LoadingState,
  StatusBadge,
  Textarea,
} from "@/shared/ui";

type CommentSectionProps = {
  projectId: number;
};

function getAuthorLabel(comment: ProjectComment) {
  return (
    comment.author?.full_name ||
    comment.author?.email ||
    (comment.author_id ? `Пользователь #${comment.author_id}` : "Пользователь")
  );
}

export function CommentSection({ projectId }: CommentSectionProps) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const commentsQuery = useProjectComments(projectId);
  const createCommentMutation = useCreateProjectComment(projectId);

  const comments = commentsQuery.data ?? [];
  const [text, setText] = useState("");

  return (
    <Card>
      <CardHeader>
        <CardTitle>Комментарии</CardTitle>
      </CardHeader>

      <CardContent>
        <div className="space-y-6">
          {isAuthenticated ? (
            <form
              className="space-y-3"
              onSubmit={(event) => {
                event.preventDefault();

                createCommentMutation.mutate(
                  {
                    text,
                    parent_id: null,
                  },
                  {
                    onSuccess: () => setText(""),
                  },
                );
              }}
            >
              <Textarea
                label="Ваш комментарий"
                placeholder="Напишите вопрос или поддержку автору проекта"
                value={text}
                onChange={(event) => setText(event.target.value)}
              />

              {createCommentMutation.isError ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-200">
                  {getApiErrorMessage(createCommentMutation.error)}
                </div>
              ) : null}

              <Button
                type="submit"
                isLoading={createCommentMutation.isPending}
                disabled={text.trim().length < 2}
              >
                Отправить комментарий
              </Button>
            </form>
          ) : (
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-800">
              <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
                Войдите в аккаунт, чтобы оставить комментарий.
              </p>
              <Link to={routes.login} className="mt-4 inline-flex">
                <Button>Войти</Button>
              </Link>
            </div>
          )}

          {commentsQuery.isLoading ? <LoadingState text="Загружаем комментарии..." /> : null}

          {commentsQuery.isError ? (
            <ErrorState description="Не удалось загрузить комментарии проекта." />
          ) : null}

          {!commentsQuery.isLoading && !commentsQuery.isError && comments.length === 0 ? (
            <EmptyState
              title="Комментариев пока нет"
              description="Станьте первым, кто задаст вопрос автору проекта."
            />
          ) : null}

          {!commentsQuery.isLoading && !commentsQuery.isError && comments.length > 0 ? (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950/40"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge tone="slate">
                      {getAuthorLabel(comment)}
                    </StatusBadge>
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                      {formatDate(comment.created_at)}
                    </span>
                  </div>

                  <p className="mt-3 whitespace-pre-line text-sm leading-6 text-slate-700 dark:text-slate-200">
                    {comment.text}
                  </p>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
