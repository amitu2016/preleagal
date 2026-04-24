import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import NDAChat from '@/components/NDAChat';

function chatResponse(message: string, fields = {}) {
  return Promise.resolve({ ok: true, json: () => Promise.resolve({ message, fields }) });
}

beforeEach(() => {
  global.fetch = jest.fn().mockImplementation(() =>
    chatResponse('Hello! What companies are involved in this NDA?')
  ) as jest.Mock;
});

afterEach(() => {
  delete (global as Record<string, unknown>).fetch;
});

describe('NDAChat — initial load', () => {
  it('calls the AI on mount and shows the greeting', async () => {
    render(<NDAChat onFieldsUpdate={jest.fn()} />);
    await waitFor(() =>
      expect(
        screen.getByText('Hello! What companies are involved in this NDA?')
      ).toBeInTheDocument()
    );
    expect(global.fetch).toHaveBeenCalledWith('/api/chat/nda', expect.objectContaining({ method: 'POST' }));
  });

  it('calls onFieldsUpdate on mount', async () => {
    const onFieldsUpdate = jest.fn();
    render(<NDAChat onFieldsUpdate={onFieldsUpdate} />);
    await waitFor(() => expect(onFieldsUpdate).toHaveBeenCalledTimes(1));
  });
});

describe('NDAChat — sending messages', () => {
  it('renders the input and send button', async () => {
    render(<NDAChat onFieldsUpdate={jest.fn()} />);
    await waitFor(() => screen.getByPlaceholderText('Type a message…'));
    expect(screen.getByRole('button', { name: /send/i })).toBeInTheDocument();
  });

  it('sends user message and shows AI reply', async () => {
    const user = userEvent.setup();
    (global.fetch as jest.Mock)
      .mockImplementationOnce(() => chatResponse('Hello! What companies are involved in this NDA?'))
      .mockImplementationOnce(() =>
        chatResponse('Got it. What is the purpose of this NDA?', {
          party1: { company: 'Acme Corp', signerName: null, title: null, noticeAddress: null },
        })
      );

    render(<NDAChat onFieldsUpdate={jest.fn()} />);
    await waitFor(() => screen.getByPlaceholderText('Type a message…'));

    await user.type(screen.getByPlaceholderText('Type a message…'), 'Party 1 is Acme Corp');
    await user.click(screen.getByRole('button', { name: /send/i }));

    await waitFor(() =>
      expect(screen.getByText('Got it. What is the purpose of this NDA?')).toBeInTheDocument()
    );
    expect(screen.getByText('Party 1 is Acme Corp')).toBeInTheDocument();
  });

  it('calls onFieldsUpdate with extracted fields', async () => {
    const user = userEvent.setup();
    (global.fetch as jest.Mock)
      .mockImplementationOnce(() => chatResponse('Hello!'))
      .mockImplementationOnce(() => chatResponse('Great!', { governingLaw: 'Delaware' }));

    const onFieldsUpdate = jest.fn();
    render(<NDAChat onFieldsUpdate={onFieldsUpdate} />);
    // Wait for initial greeting to confirm first AI call is done
    await waitFor(() => screen.getByText('Hello!'));

    await user.type(screen.getByPlaceholderText('Type a message…'), 'Delaware law');
    await user.click(screen.getByRole('button', { name: /send/i }));

    await waitFor(() => expect(onFieldsUpdate).toHaveBeenCalledTimes(2));
    expect(onFieldsUpdate).toHaveBeenLastCalledWith({ governingLaw: 'Delaware' });
  });

  it('sends with Enter key', async () => {
    const user = userEvent.setup();
    (global.fetch as jest.Mock)
      .mockImplementationOnce(() => chatResponse('Hello!'))
      .mockImplementationOnce(() => chatResponse('Noted!'));

    render(<NDAChat onFieldsUpdate={jest.fn()} />);
    await waitFor(() => screen.getByText('Hello!'));

    await user.type(screen.getByPlaceholderText('Type a message…'), 'test message{Enter}');
    await waitFor(() => expect(screen.getByText('Noted!')).toBeInTheDocument());
  });

  it('disables input and button while loading', async () => {
    let resolveAI!: (v: unknown) => void;
    (global.fetch as jest.Mock)
      .mockImplementationOnce(() => chatResponse('Hello!'))
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveAI = resolve;
          })
      );

    const user = userEvent.setup();
    render(<NDAChat onFieldsUpdate={jest.fn()} />);
    await waitFor(() => screen.getByText('Hello!'));

    await user.type(screen.getByPlaceholderText('Type a message…'), 'hello');
    await user.click(screen.getByRole('button', { name: /send/i }));

    // After click, loading=true; input and button should be disabled
    await waitFor(() =>
      expect(screen.getByPlaceholderText('Type a message…')).toBeDisabled()
    );
    expect(screen.getByRole('button', { name: /send/i })).toBeDisabled();

    await act(async () => {
      resolveAI({ ok: true, json: () => Promise.resolve({ message: 'Done', fields: {} }) });
    });
  });
});
