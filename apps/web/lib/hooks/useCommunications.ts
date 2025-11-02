import {
  InfiniteData,
  QueryKey,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import {
  AckListResponse,
  CommunicationAckSummary,
  CommunicationContext,
  CommunicationListResponse,
  CommunicationPost,
  CreateCommunicationPayload,
  UpdateCommunicationPayload,
  acknowledgeCommunication,
  createCommunication,
  deleteCommunication,
  getCommunicationAckSummary,
  getCommunicationContext,
  getMyRequiredAcks,
  listCommunications,
  updateCommunication,
} from '../api/communications';

const FEED_QUERY_KEY: QueryKey = ['communications', 'feed'];
const CONTEXT_QUERY_KEY: QueryKey = ['communications', 'context'];
const ACKS_QUERY_KEY: QueryKey = ['communications', 'acks', 'mine'];

type FeedData = InfiniteData<CommunicationListResponse>;

const addPostToFeed = (
  data: FeedData | undefined,
  post: CommunicationPost,
): FeedData | undefined => {
  if (!data) return data;
  const [firstPage, ...rest] = data.pages;
  if (!firstPage) return data;
  const updatedFirstPage: CommunicationListResponse = {
    ...firstPage,
    items: [
      post,
      ...firstPage.items.filter((existing) => existing.id !== post.id),
    ],
  };
  return {
    ...data,
    pages: [updatedFirstPage, ...rest],
  };
};

const updatePostInFeed = (
  data: FeedData | undefined,
  post: CommunicationPost,
): FeedData | undefined => {
  if (!data) return data;
  const pages = data.pages.map((page) => ({
    ...page,
    items: page.items.map((item) => (item.id === post.id ? post : item)),
  }));
  return { ...data, pages };
};

const removePostFromFeed = (
  data: FeedData | undefined,
  postId: string,
): FeedData | undefined => {
  if (!data) return data;
  const pages = data.pages.map((page) => ({
    ...page,
    items: page.items.filter((item) => item.id !== postId),
  }));
  return { ...data, pages };
};

export function useCommunicationContext() {
  return useQuery<CommunicationContext>({
    queryKey: CONTEXT_QUERY_KEY,
    queryFn: () => getCommunicationContext(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useCommunicationFeed() {
  return useInfiniteQuery<CommunicationListResponse>({
    queryKey: FEED_QUERY_KEY,
    queryFn: ({ pageParam }) =>
      listCommunications({
        cursor: (pageParam as string | undefined) ?? undefined,
        includeAckSummary: true,
      }),
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    initialPageParam: undefined,
  });
}

export function useCreateCommunication() {
  const queryClient = useQueryClient();
  return useMutation<CommunicationPost, unknown, CreateCommunicationPayload>({
    mutationFn: createCommunication,
    onSuccess: (post) => {
      queryClient.setQueryData<FeedData>(FEED_QUERY_KEY, (data) =>
        addPostToFeed(data, post),
      );
      queryClient.invalidateQueries({ queryKey: ACKS_QUERY_KEY, exact: false });
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: FEED_QUERY_KEY });
    },
  });
}

export function useUpdateCommunication() {
  const queryClient = useQueryClient();
  return useMutation<
    CommunicationPost,
    unknown,
    { id: string; payload: UpdateCommunicationPayload }
  >({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateCommunicationPayload;
    }) => updateCommunication(id, payload),
    onSuccess: (post) => {
      queryClient.setQueryData<FeedData>(FEED_QUERY_KEY, (data) =>
        updatePostInFeed(data, post),
      );
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: FEED_QUERY_KEY });
    },
  });
}

export function useDeleteCommunication() {
  const queryClient = useQueryClient();
  return useMutation<void, unknown, string>({
    mutationFn: (id: string) => deleteCommunication(id),
    onSuccess: (_data, id) => {
      queryClient.setQueryData<FeedData>(FEED_QUERY_KEY, (data) =>
        removePostFromFeed(data, id),
      );
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: FEED_QUERY_KEY });
    },
  });
}

export function useAcknowledgeCommunication() {
  const queryClient = useQueryClient();
  return useMutation<CommunicationPost, unknown, string>({
    mutationFn: (id: string) => acknowledgeCommunication(id),
    onSuccess: (post) => {
      queryClient.setQueryData<FeedData>(FEED_QUERY_KEY, (data) =>
        updatePostInFeed(data, post),
      );
      queryClient.invalidateQueries({ queryKey: ACKS_QUERY_KEY });
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: FEED_QUERY_KEY });
    },
  });
}

export function useCommunicationAckSummary(
  postId: string | null,
  enabled: boolean,
) {
  return useQuery<CommunicationAckSummary>({
    queryKey: ['communications', 'ackSummary', postId],
    queryFn: () => {
      if (!postId) throw new Error('postId required');
      return getCommunicationAckSummary(postId);
    },
    enabled: Boolean(postId && enabled),
  });
}

export function useMyPendingAcks() {
  return useQuery<AckListResponse>({
    queryKey: ACKS_QUERY_KEY,
    queryFn: () => getMyRequiredAcks({ onlyPending: true, take: 20 }),
    staleTime: 60 * 1000,
  });
}
