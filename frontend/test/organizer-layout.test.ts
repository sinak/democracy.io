import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from '../vendor/vitest/index.js';

describe('testing-library setup', () => {
  it('renders organizer shell copy in the jsdom test environment', () => {
    render(
      React.createElement(
        'section',
        { 'data-testid': 'organizer-shell' },
        React.createElement('h1', null, 'Sign in to manage campaign shells'),
        React.createElement(
          'p',
          null,
          'Magic-link email sign-in stays separate from the supporter flow.'
        ),
        React.createElement('label', null, 'Organizer email')
      )
    );

    expect(screen.getByText(/Sign in to manage campaign shells/i)).toBeTruthy();
    expect(screen.getByText(/Organizer email/i)).toBeTruthy();
  });
});
