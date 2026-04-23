import React from 'react';

export const StyleSheet = {
  create: (styles: Record<string, object>) => styles,
};

export const Document = ({
  children,
}: React.PropsWithChildren<Record<string, unknown>>) => (
  <div data-testid="pdf-document">{children}</div>
);

export const Page = ({ children }: React.PropsWithChildren<{ size?: string; style?: unknown }>) => (
  <div data-testid="pdf-page">{children}</div>
);

export const Text = ({ children }: React.PropsWithChildren<{ style?: unknown }>) => (
  <span data-testid="pdf-text">{children}</span>
);

export const View = ({ children }: React.PropsWithChildren<{ style?: unknown }>) => (
  <div data-testid="pdf-view">{children}</div>
);

export const usePDF = jest.fn(() => [
  { loading: false, url: 'blob:mock-pdf-url', error: null },
  jest.fn(),
]);
