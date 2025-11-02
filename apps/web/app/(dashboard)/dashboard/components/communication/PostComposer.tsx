'use client';

import { useEffect } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Badge, cn } from '@workright/ui';
import {
  CommunicationContext,
  CommunicationPost,
  CommunicationAttachment,
  CommunicationMention,
} from '../../../../../lib/api/communications';

const attachmentSchema = z.object({
  url: z.string().url('Provide a valid URL'),
  name: z.string().min(1, 'Attachment name is required'),
  type: z.string().optional().nullable(),
});

const mentionSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
});

const composerSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title is too long'),
  body: z.string().min(1, 'Write a short update'),
  targetTeamIds: z.array(z.string()).min(1, 'Select at least one team'),
  attachments: z.array(attachmentSchema).optional().default([]),
  mentions: z.array(mentionSchema).optional().default([]),
  requireAck: z.boolean().optional().default(false),
  ackDueAt: z.string().optional().nullable(),
});

export type ComposerSubmitData = z.infer<typeof composerSchema>;

interface PostComposerProps {
  context: CommunicationContext;
  mode: 'create' | 'edit';
  initialPost?: CommunicationPost;
  isSubmitting?: boolean;
  onSubmit: (values: ComposerSubmitData) => Promise<void> | void;
  onCancelEdit?: () => void;
}

const EMPTY_ATTACHMENT: CommunicationAttachment = {
  url: '',
  name: '',
  type: '',
};
const EMPTY_MENTION: CommunicationMention = { userId: '' };

function buildDefaultTargets(
  context: CommunicationContext,
  post?: CommunicationPost,
) {
  if (post) {
    return post.targetTeams.map((team) => team.id);
  }
  const defaultIds = context.teamIds.length
    ? context.teamIds
    : context.supervisorTeamIds;
  return defaultIds.length ? Array.from(new Set(defaultIds)) : [];
}

export default function PostComposer({
  context,
  mode,
  initialPost,
  isSubmitting,
  onSubmit,
  onCancelEdit,
}: PostComposerProps) {
  const form = useForm<ComposerSubmitData>({
    resolver: zodResolver(composerSchema),
    defaultValues: {
      title: initialPost?.title ?? '',
      body: initialPost?.body ?? '',
      targetTeamIds: buildDefaultTargets(context, initialPost),
      attachments: initialPost?.attachments ?? [],
      mentions: initialPost?.mentions ?? [],
      requireAck: initialPost?.requireAck ?? false,
      ackDueAt: initialPost?.ackDueAt ?? undefined,
    },
  });

  const {
    register,
    handleSubmit,
    watch,
    control,
    setValue,
    formState: { errors },
  } = form;

  const attachmentsField = useFieldArray({ control, name: 'attachments' });
  const mentionsField = useFieldArray({ control, name: 'mentions' });

  useEffect(() => {
    if (mode === 'edit' && initialPost) {
      setValue('title', initialPost.title);
      setValue('body', initialPost.body);
      setValue('targetTeamIds', buildDefaultTargets(context, initialPost));
      setValue('attachments', initialPost.attachments ?? []);
      setValue('mentions', initialPost.mentions ?? []);
      setValue('requireAck', initialPost.requireAck);
      setValue('ackDueAt', initialPost.ackDueAt ?? undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialPost?.id]);

  const selectedTeamIds = watch('targetTeamIds');
  const requireAck = watch('requireAck');

  const isEmployee = context.role === 'EMPLOYEE';
  const teamLimitExplanation =
    isEmployee && !context.allowMultiTeamCommunication ? (
      <p className="text-xs text-muted-foreground">
        Employees can only post to the teams they belong to.
      </p>
    ) : null;

  return (
    <form
      onSubmit={handleSubmit(async (values) => {
        const trimmed: ComposerSubmitData = {
          ...values,
          attachments: values.attachments?.filter(
            (attachment) => attachment.url && attachment.name,
          ),
          mentions: values.mentions?.filter(
            (mention) => mention.userId.trim().length > 0,
          ),
        };
        await onSubmit(trimmed);
        if (mode === 'create') {
          form.reset({
            title: '',
            body: '',
            targetTeamIds: buildDefaultTargets(context),
            attachments: [],
            mentions: [],
            requireAck: false,
            ackDueAt: undefined,
          });
        }
      })}
      className="space-y-6"
    >
      <div className="grid gap-4">
        <div className="space-y-1">
          <label className="text-sm font-medium" htmlFor="comm-title">
            Title
          </label>
          <input
            id="comm-title"
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary"
            placeholder="What should people know?"
            {...register('title')}
          />
          {errors.title ? (
            <p className="text-xs text-destructive">{errors.title.message}</p>
          ) : null}
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium" htmlFor="comm-body">
            Update
          </label>
          <textarea
            id="comm-body"
            rows={5}
            className="w-full resize-y rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary"
            placeholder="Write a brief update. Markdown supported."
            {...register('body')}
          />
          {errors.body ? (
            <p className="text-xs text-destructive">{errors.body.message}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Target teams</span>
            {teamLimitExplanation}
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {context.teams.map((team) => {
              const disabled =
                isEmployee &&
                !context.allowMultiTeamCommunication &&
                !team.isMember;
              const checked = selectedTeamIds?.includes(team.id);
              return (
                <label
                  key={team.id}
                  className={cn(
                    'flex cursor-pointer items-start gap-3 rounded-lg border border-border px-3 py-2 text-sm transition',
                    disabled ? 'opacity-50' : 'hover:border-primary',
                    checked && 'border-primary bg-primary/5',
                  )}
                >
                  <input
                    type="checkbox"
                    value={team.id}
                    className="mt-1"
                    disabled={disabled}
                    {...register('targetTeamIds')}
                  />
                  <span>
                    <span className="font-medium text-foreground">
                      {team.name}
                    </span>
                    <span className="block text-xs text-muted-foreground">
                      {team.departmentName ?? '—'}
                    </span>
                    {team.isMember ? (
                      <Badge className="mt-1 border-border bg-muted/60 text-foreground">
                        My team
                      </Badge>
                    ) : null}
                  </span>
                </label>
              );
            })}
          </div>
          {errors.targetTeamIds ? (
            <p className="text-xs text-destructive">
              {errors.targetTeamIds.message}
            </p>
          ) : null}
        </div>

        {context.canRequireAck ? (
          <div className="flex flex-col gap-2 rounded-lg border border-border p-3">
            <label className="flex items-center gap-2 text-sm font-medium">
              <input
                type="checkbox"
                className="h-4 w-4"
                {...register('requireAck')}
              />
              Require acknowledgement
            </label>
            <p className="text-xs text-muted-foreground">
              Recipients must click acknowledge. Recommended for policy changes
              and safety alerts.
            </p>
            {requireAck ? (
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium" htmlFor="comm-ack-due">
                  Due date (optional)
                </label>
                <input
                  id="comm-ack-due"
                  type="date"
                  className="w-fit rounded-md border border-border bg-background px-2 py-1 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  {...register('ackDueAt')}
                />
              </div>
            ) : null}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-muted-foreground/40 p-3 text-xs text-muted-foreground">
            Acknowledgements can be requested by managers, supervisors or
            administrators.
          </div>
        )}

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm font-medium">
            <span>Attachments</span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => attachmentsField.append({ ...EMPTY_ATTACHMENT })}
            >
              Add attachment
            </Button>
          </div>
          {attachmentsField.fields.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              Link to documents stored in your document library.
            </p>
          ) : null}
          <div className="grid gap-3">
            {attachmentsField.fields.map((field, index) => (
              <div
                key={field.id}
                className="grid gap-2 rounded-md border border-border p-3 text-xs sm:grid-cols-3"
              >
                <input
                  placeholder="https://example.com/document.pdf"
                  className="rounded-md border border-border bg-background px-2 py-1 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  {...register(`attachments.${index}.url` as const)}
                />
                <input
                  placeholder="File name"
                  className="rounded-md border border-border bg-background px-2 py-1 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  {...register(`attachments.${index}.name` as const)}
                />
                <div className="flex items-center gap-2">
                  <input
                    placeholder="Type (optional)"
                    className="flex-1 rounded-md border border-border bg-background px-2 py-1 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    {...register(`attachments.${index}.type` as const)}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => attachmentsField.remove(index)}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm font-medium">
            <span>@ Mentions</span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => mentionsField.append({ ...EMPTY_MENTION })}
            >
              Add mention
            </Button>
          </div>
          {mentionsField.fields.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              Enter a user ID to notify a specific teammate.
            </p>
          ) : null}
          <div className="grid gap-2">
            {mentionsField.fields.map((field, index) => (
              <div key={field.id} className="flex items-center gap-2">
                <input
                  placeholder="user-id"
                  className="flex-1 rounded-md border border-border bg-background px-2 py-1 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  {...register(`mentions.${index}.userId` as const)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => mentionsField.remove(index)}
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col justify-end gap-3 border-t border-border pt-4 sm:flex-row">
        {mode === 'edit' ? (
          <Button
            type="button"
            variant="ghost"
            onClick={onCancelEdit}
            disabled={isSubmitting}
          >
            Cancel edit
          </Button>
        ) : null}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? 'Saving…'
            : mode === 'edit'
              ? 'Update post'
              : 'Post update'}
        </Button>
      </div>
    </form>
  );
}
