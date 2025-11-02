'use client';

import { useMemo, useState } from 'react';
import { Loader2, SendHorizonal } from 'lucide-react';
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, EmptyState } from '@workright/ui';
import { CommunicationPost, CommunicationContext } from '../../../../../lib/api/communications';
import {
  useCommunicationFeed,
  useCommunicationContext,
  useCreateCommunication,
  useUpdateCommunication,
  useDeleteCommunication,
  useAcknowledgeCommunication,
  useMyPendingAcks
} from '../../../../../lib/hooks/useCommunications';
import PostComposer, { ComposerSubmitData } from './PostComposer';
import PostCard from './PostCard';

interface EditingState {
  post: CommunicationPost;
}

function flattenFeed(pages?: { pages: { items: CommunicationPost[] }[] }): CommunicationPost[] {
  if (!pages) return [];
  return pages.pages.flatMap((page) => page.items);
}

export default function CommunicationFeed() {
  const [editing, setEditing] = useState<EditingState | null>(null);

  const contextQuery = useCommunicationContext();
  const feedQuery = useCommunicationFeed();
  const createMutation = useCreateCommunication();
  const updateMutation = useUpdateCommunication();
  const deleteMutation = useDeleteCommunication();
  const acknowledgeMutation = useAcknowledgeCommunication();
  const pendingAcksQuery = useMyPendingAcks();

  const posts = useMemo(() => flattenFeed(feedQuery.data), [feedQuery.data]);

  const handleCreate = async (payload: ComposerSubmitData) => {
    await createMutation.mutateAsync(payload);
  };

  const handleUpdate = async (postId: string, payload: ComposerSubmitData) => {
    await updateMutation.mutateAsync({ id: postId, payload });
    setEditing(null);
  };

  const handleDelete = async (post: CommunicationPost) => {
    await deleteMutation.mutateAsync(post.id);
  };

  const handleAcknowledge = async (post: CommunicationPost) => {
    await acknowledgeMutation.mutateAsync(post.id);
  };

  const isLoading = contextQuery.isLoading || feedQuery.isLoading;
  const hasMore = Boolean(feedQuery.hasNextPage);

  const pendingAckItems = pendingAcksQuery.data?.items ?? [];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <SendHorizonal className="h-5 w-5 text-primary" />
            Communications
          </CardTitle>
          <CardDescription>Share updates with the teams you collaborate with.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading context…
            </div>
          ) : contextQuery.isError ? (
            <EmptyState
              title="Unable to load context"
              description="We couldn’t determine your teams. Try refreshing the page."
            />
          ) : contextQuery.data ? (
            <PostComposer
              context={contextQuery.data as CommunicationContext}
              mode={editing ? 'edit' : 'create'}
              initialPost={editing?.post}
              isSubmitting={createMutation.isPending || updateMutation.isPending}
              onSubmit={async (values) => {
                if (editing) {
                  await handleUpdate(editing.post.id, values);
                } else {
                  await handleCreate(values);
                }
              }}
              onCancelEdit={() => setEditing(null)}
            />
          ) : null}
        </CardContent>
      </Card>

      <PendingAcknowledgementsTray
        isLoading={pendingAcksQuery.isLoading}
        items={pendingAckItems}
        onAcknowledge={handleAcknowledge}
      />

      <div className="space-y-4">
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            onEdit={() => setEditing({ post })}
            onDelete={() => handleDelete(post)}
            onAcknowledge={() => handleAcknowledge(post)}
          />
        ))}

        {posts.length === 0 && !isLoading ? (
          <EmptyState
            title="No communications yet"
            description="Start the conversation by sharing an update with your teams."
          />
        ) : null}

        {hasMore ? (
          <div className="flex justify-center">
            <Button
              variant="outline"
              onClick={() => feedQuery.fetchNextPage()}
              disabled={feedQuery.isFetchingNextPage}
            >
              {feedQuery.isFetchingNextPage ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" /> Loading…
                </span>
              ) : (
                'Load older updates'
              )}
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

interface PendingAcknowledgementsTrayProps {
  isLoading: boolean;
  items: {
    post: CommunicationPost;
    acknowledged: boolean;
    acknowledgedAt?: string;
  }[];
  onAcknowledge: (post: CommunicationPost) => void | Promise<void>;
}

function PendingAcknowledgementsTray({ isLoading, items, onAcknowledge }: PendingAcknowledgementsTrayProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex-row items-center justify-between gap-3">
          <div>
            <CardTitle>Your required acknowledgements</CardTitle>
            <CardDescription>We’re checking for pending updates…</CardDescription>
          </div>
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        </CardHeader>
      </Card>
    );
  }

  if (!items.length) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your required acknowledgements</CardTitle>
        <CardDescription>Review and confirm updates shared with your teams.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map(({ post }) => (
          <div
            key={post.id}
            className="flex flex-col gap-2 rounded-xl border border-border bg-panel/70 p-4 md:flex-row md:items-center md:justify-between"
          >
            <div>
              <p className="font-medium text-foreground">{post.title}</p>
              <p className="text-sm text-muted-foreground">
                {post.targetTeams.map((team) => team.name).join(', ')} • Shared by {post.author.givenName}{' '}
                {post.author.familyName}
              </p>
              {post.ackDueAt ? (
                <p className="text-sm text-warning">Due by {new Date(post.ackDueAt).toLocaleDateString()}</p>
              ) : null}
            </div>
            <Button size="sm" onClick={() => onAcknowledge(post)} disabled={post.myAck?.acknowledged}>
              {post.myAck?.acknowledged ? 'Acknowledged' : 'Acknowledge'}
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
