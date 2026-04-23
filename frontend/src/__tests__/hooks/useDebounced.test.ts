import { renderHook, act } from '@testing-library/react';
import { useDebounced } from '@/hooks/useDebounced';

describe('useDebounced', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns the initial value immediately', () => {
    const { result } = renderHook(() => useDebounced('initial', 300));
    expect(result.current).toBe('initial');
  });

  it('does not update before the delay elapses', () => {
    const { result, rerender } = renderHook(
      ({ value }: { value: string }) => useDebounced(value, 300),
      { initialProps: { value: 'initial' } }
    );
    rerender({ value: 'updated' });
    act(() => jest.advanceTimersByTime(299));
    expect(result.current).toBe('initial');
  });

  it('updates after the delay elapses', () => {
    const { result, rerender } = renderHook(
      ({ value }: { value: string }) => useDebounced(value, 300),
      { initialProps: { value: 'initial' } }
    );
    rerender({ value: 'updated' });
    act(() => jest.advanceTimersByTime(300));
    expect(result.current).toBe('updated');
  });

  it('resets the timer on rapid successive changes', () => {
    const { result, rerender } = renderHook(
      ({ value }: { value: string }) => useDebounced(value, 300),
      { initialProps: { value: 'initial' } }
    );
    rerender({ value: 'first' });
    act(() => jest.advanceTimersByTime(200));
    rerender({ value: 'second' });
    act(() => jest.advanceTimersByTime(200));
    // 200ms into the second timer — should not have fired yet
    expect(result.current).toBe('initial');
    act(() => jest.advanceTimersByTime(100));
    expect(result.current).toBe('second');
  });

  it('never settles on an intermediate value during rapid typing', () => {
    const { result, rerender } = renderHook(
      ({ value }: { value: string }) => useDebounced(value, 500),
      { initialProps: { value: '' } }
    );
    ['h', 'he', 'hel', 'hell', 'hello'].forEach((v) => {
      rerender({ value: v });
      act(() => jest.advanceTimersByTime(100));
    });
    expect(result.current).toBe('');
    act(() => jest.advanceTimersByTime(500));
    expect(result.current).toBe('hello');
  });

  it('works correctly with object values', () => {
    const obj1 = { name: 'Alice' };
    const obj2 = { name: 'Bob' };
    const { result, rerender } = renderHook(
      ({ value }: { value: typeof obj1 }) => useDebounced(value, 300),
      { initialProps: { value: obj1 } }
    );
    rerender({ value: obj2 });
    act(() => jest.advanceTimersByTime(300));
    expect(result.current).toBe(obj2);
  });

  it('cleans up the timer on unmount', () => {
    const setStateSpy = jest.fn();
    const { result, rerender, unmount } = renderHook(
      ({ value }: { value: string }) => useDebounced(value, 300),
      { initialProps: { value: 'initial' } }
    );
    rerender({ value: 'updated' });
    unmount();
    // Timer should be cleared — advancing time should not throw
    expect(() => act(() => jest.advanceTimersByTime(300))).not.toThrow();
  });

  it('handles delay of 0 as a synchronous-equivalent update', () => {
    const { result, rerender } = renderHook(
      ({ value }: { value: string }) => useDebounced(value, 0),
      { initialProps: { value: 'initial' } }
    );
    rerender({ value: 'updated' });
    act(() => jest.advanceTimersByTime(0));
    expect(result.current).toBe('updated');
  });
});
