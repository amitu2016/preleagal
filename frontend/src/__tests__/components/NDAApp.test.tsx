import React from 'react';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import NDAApp from '@/components/NDAApp';
import { DEFAULT_FORM_DATA } from '@/types/nda';

// Render NDAPreview as a simple div that serialises what it receives so we can
// assert on the data passed to it without involving PDF rendering.
jest.mock('../../components/NDAPreview', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return function MockNDAPreview({ data }: { data: any }) {
    return (
      <div data-testid="nda-preview">
        <span data-testid="preview-purpose">{data.purpose}</span>
        <span data-testid="preview-governing-law">{data.governingLaw}</span>
      </div>
    );
  };
});

describe('NDAApp — layout', () => {
  it('renders the application header', () => {
    render(<NDAApp />);
    expect(screen.getByText('Mutual NDA Creator')).toBeInTheDocument();
  });

  it('renders the subtitle', () => {
    render(<NDAApp />);
    expect(
      screen.getByText(/fill in the details on the left/i)
    ).toBeInTheDocument();
  });

  it('renders the form panel', () => {
    render(<NDAApp />);
    expect(screen.getByDisplayValue(DEFAULT_FORM_DATA.purpose)).toBeInTheDocument();
  });

  it('renders the preview panel', () => {
    render(<NDAApp />);
    expect(screen.getByTestId('nda-preview')).toBeInTheDocument();
  });

  it('preview initially shows the default purpose', () => {
    render(<NDAApp />);
    expect(screen.getByTestId('preview-purpose')).toHaveTextContent(
      DEFAULT_FORM_DATA.purpose
    );
  });
});

describe('NDAApp — form reactivity', () => {
  it('form input updates immediately as user types', async () => {
    const user = userEvent.setup();
    render(<NDAApp />);
    const textarea = screen.getByDisplayValue(DEFAULT_FORM_DATA.purpose);
    await user.clear(textarea);
    await user.type(textarea, 'Instant update');
    expect(screen.getByDisplayValue('Instant update')).toBeInTheDocument();
  });

  it('governing law input updates immediately', async () => {
    const user = userEvent.setup();
    render(<NDAApp />);
    const input = screen.getByPlaceholderText('Delaware');
    await user.type(input, 'Texas');
    expect(screen.getByDisplayValue('Texas')).toBeInTheDocument();
  });
});

describe('NDAApp — debounced preview', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('preview does not update immediately when user types', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime.bind(jest) });
    render(<NDAApp />);
    const textarea = screen.getByDisplayValue(DEFAULT_FORM_DATA.purpose);

    await user.clear(textarea);
    await user.type(textarea, 'Not yet in preview');

    // Timer hasn't fired — preview should still show original purpose
    expect(screen.getByTestId('preview-purpose')).toHaveTextContent(
      DEFAULT_FORM_DATA.purpose
    );
  });

  it('preview updates after debounce delay elapses', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime.bind(jest) });
    render(<NDAApp />);
    const textarea = screen.getByDisplayValue(DEFAULT_FORM_DATA.purpose);

    await user.clear(textarea);
    await user.type(textarea, 'After debounce');

    act(() => jest.advanceTimersByTime(700));

    expect(screen.getByTestId('preview-purpose')).toHaveTextContent('After debounce');
  });

  it('preview only picks up the final value after rapid typing', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime.bind(jest) });
    render(<NDAApp />);
    const input = screen.getByPlaceholderText('Delaware');

    await user.type(input, 'C');
    act(() => jest.advanceTimersByTime(200));
    await user.type(input, 'A');
    act(() => jest.advanceTimersByTime(200));

    // Still within debounce window — preview has empty governing law
    expect(screen.getByTestId('preview-governing-law')).toHaveTextContent('');

    act(() => jest.advanceTimersByTime(600));

    expect(screen.getByTestId('preview-governing-law')).toHaveTextContent('CA');
  });
});
