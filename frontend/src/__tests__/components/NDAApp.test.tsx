import React from 'react';
import { render, screen, act } from '@testing-library/react';
import NDAApp from '@/components/NDAApp';
import { NDAFormData } from '@/types/nda';

// Render NDAPreview as a simple div so we can assert on the data passed to it
// without involving PDF rendering.
jest.mock('../../components/NDAPreview', () => {
  return function MockNDAPreview({ data }: { data: NDAFormData }) {
    return (
      <div data-testid="nda-preview">
        <span data-testid="preview-governing-law">{data.governingLaw}</span>
        <span data-testid="preview-party1-company">{data.party1.company}</span>
      </div>
    );
  };
});

// Mock NDAChat so tests can trigger field updates without a real AI call
const mockOnFieldsUpdate = jest.fn();
jest.mock('../../components/NDAChat', () => {
  return function MockNDAChat({ onFieldsUpdate }: { onFieldsUpdate: (f: Partial<NDAFormData>) => void }) {
    mockOnFieldsUpdate.mockImplementation(onFieldsUpdate);
    return <div data-testid="nda-chat">Chat panel</div>;
  };
});

beforeEach(() => {
  mockOnFieldsUpdate.mockClear();
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

describe('NDAApp — layout', () => {
  it('renders the application header', () => {
    render(<NDAApp />);
    expect(screen.getByText('Mutual NDA Creator')).toBeInTheDocument();
  });

  it('renders the chat panel', () => {
    render(<NDAApp />);
    expect(screen.getByTestId('nda-chat')).toBeInTheDocument();
  });

  it('renders the preview panel', () => {
    render(<NDAApp />);
    expect(screen.getByTestId('nda-preview')).toBeInTheDocument();
  });
});

describe('NDAApp — field merging', () => {
  it('merges top-level fields from AI into preview after debounce', () => {
    render(<NDAApp />);
    act(() => { mockOnFieldsUpdate({ governingLaw: 'Delaware' }); });
    act(() => { jest.advanceTimersByTime(700); });
    expect(screen.getByTestId('preview-governing-law')).toHaveTextContent('Delaware');
  });

  it('merges nested party fields from AI into preview after debounce', () => {
    render(<NDAApp />);
    act(() => {
      mockOnFieldsUpdate({
        party1: { company: 'Acme Corp', signerName: null, title: null, noticeAddress: null },
      });
    });
    act(() => { jest.advanceTimersByTime(700); });
    expect(screen.getByTestId('preview-party1-company')).toHaveTextContent('Acme Corp');
  });

  it('does not overwrite existing fields when AI returns null', () => {
    render(<NDAApp />);
    act(() => { mockOnFieldsUpdate({ governingLaw: 'California' }); });
    act(() => { mockOnFieldsUpdate({ governingLaw: null }); });
    act(() => { jest.advanceTimersByTime(700); });
    expect(screen.getByTestId('preview-governing-law')).toHaveTextContent('California');
  });

  it('preview does not update before debounce delay', () => {
    render(<NDAApp />);
    act(() => { mockOnFieldsUpdate({ governingLaw: 'Texas' }); });
    // No timer advancement — preview should still show empty
    expect(screen.getByTestId('preview-governing-law')).toHaveTextContent('');
  });

  it('preview updates after debounce delay', () => {
    render(<NDAApp />);
    act(() => { mockOnFieldsUpdate({ governingLaw: 'Texas' }); });
    act(() => { jest.advanceTimersByTime(700); });
    expect(screen.getByTestId('preview-governing-law')).toHaveTextContent('Texas');
  });
});
