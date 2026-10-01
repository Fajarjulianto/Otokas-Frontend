import { api, extractData } from "@/src/lib/api";
export const FACEBOOK_ENABLED =
  process.env.EXPO_PUBLIC_FACEBOOK_ENABLED === "true";
export type FacebookStatus = {
  enabled: boolean;
  connected: boolean;
  pageId?: string;
  pageName?: string;
  needsReconnect?: boolean;
};
export type FacebookDraft = {
  id: string;
  caption: string;
  link: string;
  imageUrl: string;
  pageId: string;
  pageName: string;
  status: string;
  facebookPostId?: string;
  errorCode?: string;
};
export const facebookServices = {
  status: async () =>
    extractData<FacebookStatus>(await api.get("/integrations/facebook/status")),
  start: async () =>
    extractData<{ url: string }>(
      await api.post("/integrations/facebook/oauth"),
    ),
  pages: async () =>
    extractData<{ id: string; name: string }[]>(
      await api.get("/integrations/facebook/pages"),
    ),
  selectPage: async (pageId: string) =>
    extractData<FacebookStatus>(
      await api.post("/integrations/facebook/page", { pageId }),
    ),
  disconnect: async () => {
    await api.delete("/integrations/facebook");
  },
  draft: async (id: string) =>
    extractData<FacebookDraft>(
      await api.post(`/motors/${encodeURIComponent(id)}/facebook-post/draft`),
    ),
  publish: async (id: string, publicationId: string, caption: string) =>
    extractData<{ status: string }>(
      await api.post(`/motors/${encodeURIComponent(id)}/facebook-post`, {
        publicationId,
        caption,
      }),
    ),
  postStatus: async (id: string, publicationId: string) =>
    extractData<Pick<
      FacebookDraft,
      "status" | "errorCode" | "facebookPostId"
    > | null>(
      await api.get(`/motors/${encodeURIComponent(id)}/facebook-post`, {
        params: { publicationId },
      }),
    ),
};
