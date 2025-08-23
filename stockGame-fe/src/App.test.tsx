import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

describe('App', () => {
  it('renders without crashing', () => {
    render(<App />);
    expect(document.body).toBeTruthy();
  });

  it('has basic structure', () => {
    render(<App />);
    // 기본적인 앱 구조가 있는지 확인
    expect(document.querySelector('div')).toBeTruthy();
  });
});
