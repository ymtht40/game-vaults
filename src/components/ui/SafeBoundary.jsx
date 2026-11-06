'use client';
import React from 'react';

// Keeps a failing non-essential widget (e.g. the WebGL globe) from taking
// down the whole page. Renders `fallback` (default: nothing) on error.
export default class SafeBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error) {
    console.error('SafeBoundary caught:', error);
  }

  render() {
    if (this.state.failed) return this.props.fallback ?? null;
    return this.props.children;
  }
}
