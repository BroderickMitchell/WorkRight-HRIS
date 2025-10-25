import { render } from '@testing-library/react';
import { Button } from '@workright/ui';

describe('Button component', () => {
  it('renders the provided label', () => {
    const { getByRole } = render(<Button>Click me</Button>);
    expect(getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });
});
