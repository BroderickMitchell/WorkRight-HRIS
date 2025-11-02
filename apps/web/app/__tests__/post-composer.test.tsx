import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import PostComposer, { ComposerSubmitData } from '../(dashboard)/dashboard/components/communication/PostComposer';
import { CommunicationContext } from '../../lib/api/communications';

const baseContext: CommunicationContext = {
  role: 'EMPLOYEE',
  roleKeys: ['EMPLOYEE'],
  departmentId: 'dept-1',
  teamIds: ['team-member'],
  supervisorTeamIds: [],
  allowMultiTeamCommunication: false,
  canRequireAck: false,
  teams: [
    { id: 'team-member', name: 'My Team', departmentId: 'dept-1', departmentName: 'Operations', isMember: true },
    { id: 'team-other', name: 'Other Team', departmentId: 'dept-1', departmentName: 'Operations', isMember: false }
  ]
};

function renderComposer(context: CommunicationContext) {
  const handleSubmit = vi.fn<[(values: ComposerSubmitData) => void], void>();
  render(<PostComposer context={context} mode="create" onSubmit={handleSubmit} />);
  return { handleSubmit };
}

describe('PostComposer permissions', () => {
  it('disables non-member team selection for standard employees by default', () => {
    renderComposer(baseContext);
    const otherTeamCheckbox = screen.getByLabelText(/Other Team/);
    expect(otherTeamCheckbox).toBeDisabled();
  });

  it('enables cross-team selection when multi-team flag is set', async () => {
    const context: CommunicationContext = { ...baseContext, allowMultiTeamCommunication: true };
    renderComposer(context);
    const otherTeamCheckbox = screen.getByLabelText(/Other Team/);
    expect(otherTeamCheckbox).not.toBeDisabled();
    await userEvent.click(otherTeamCheckbox);
    expect(otherTeamCheckbox).toBeChecked();
  });

  it('hides acknowledgement toggle when user cannot require acknowledgements', () => {
    renderComposer(baseContext);
    expect(screen.queryByText(/Require acknowledgement/)).not.toBeInTheDocument();
  });
});
