'use client';

// Variable Mapping: o -> isPerfEnabledCached, a -> isPerfEnabled, i -> getNow, u -> perfLog, f -> perfLog, s -> perfMeasure, O -> perfMeasure

let isPerfEnabledCached = null;

function isPerfEnabled() {
  if (isPerfEnabledCached !== null) return isPerfEnabledCached;
  try {
    isPerfEnabledCached =
      new URLSearchParams(window.location.search).has('perf') ||
      window.localStorage?.getItem('anm-perf') === '1';
  } catch {
    isPerfEnabledCached = false;
  }
  if (isPerfEnabledCached) {
    console.log(
      '%c[perf] debug logging ON (remove ?perf=1 to silence)',
      'color:#fd551d;font-weight:bold'
    );
  }
  return isPerfEnabledCached;
}

const getNow = () => (typeof performance !== 'undefined' ? performance.now() : 0);

// NOTE: module id: 991763
export function perfLog(label, data) {
  if (!isPerfEnabled()) return;
  const elapsedSeconds = (getNow() / 1000).toFixed(2);
  if (data !== undefined) {
    console.log(`[perf +${elapsedSeconds}s] ${label}`, data);
  } else {
    console.log(`[perf +${elapsedSeconds}s] ${label}`);
  }
}

export function perfMeasure(label, fn) {
  if (!isPerfEnabled()) return fn();
  const start = getNow();
  const result = fn();
  console.log(`[perf] ${label} took ${(getNow() - start).toFixed(1)}ms`);
  return result;
}