import api from "@/lib/axios";

export const getComments = async (videoId: string) => {
  const response = await api.get(`/comments/${videoId}`);

  return response.data;
};

export const addComment = async (
  videoId: string,
  text: string,
) => {
  const response = await api.post(`/comments/${videoId}`, {
    text,
  });

  return response.data;
};

export const updateComment = async (
  commentId: string,
  text: string,
) => {
  const response = await api.put(`/comments/${commentId}`, {
    text,
  });

  return response.data;
};

export const deleteComment = async (
  commentId: string,
) => {
  const response = await api.delete(
    `/comments/${commentId}`,
  );

  return response.data;
};

// =====================================================
// Reaction
// =====================================================

export const reactToComment = async (
  commentId: string,
  type: "like" | "dislike",
) => {
  const response = await api.post(
    `/comments/${commentId}/reaction`,
    {
      type,
    },
  );

  return response.data;
};

// =====================================================
// Report
// =====================================================

export type ReportReason =
  | "abuse"
  | "spam"
  | "hate"
  | "harassment"
  | "sexual"
  | "violence"
  | "other";

export type ReportCommentPayload = {
  reason: ReportReason;
  details?: string;
};

export const reportComment = async (
  commentId: string,
  data: ReportCommentPayload,
) => {
  const response = await api.post(
    `/comments/${commentId}/report`,
    data,
  );

  return response.data;
};

// =====================================================
// Translation
// =====================================================

export type TranslationLanguage = "en" | "hi";

export const translateComment = async (
  commentId: string,
  targetLanguage: "en" | "hi",
) => {
  const response = await api.post(
    `/comments/translate/${commentId}`,
    {
      targetLanguage,
    },
  );

  return response.data;
};
// =====================================================
// Moderation
// =====================================================

export type ModerationAction =
  | "approve"
  | "remove"
  | "dismiss";

export const getReportedComments = async () => {
  const response = await api.get(
    "/comments/moderation/reported",
  );

  return response.data;
};

export const moderateReportedComment = async (
  commentId: string,
  action: ModerationAction,
) => {
  const response = await api.patch(
    `/comments/${commentId}/moderation`,
    {
      action,
    },
  );

  return response.data;
};