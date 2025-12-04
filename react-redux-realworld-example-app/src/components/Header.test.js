import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Header from './Header';

describe('Header Component', () => {
  const defaultProps = {
    appName: 'Conduit'
  };

  test('should render navigation links for guest users', () => {
    render(
      <BrowserRouter>
        <Header {...defaultProps} currentUser={null} />
      </BrowserRouter>
    );

    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Sign in')).toBeInTheDocument();
    expect(screen.getByText('Sign up')).toBeInTheDocument();
  });

  test('should render navigation links for logged-in users', () => {
    const currentUser = {
      username: 'testuser',
      email: 'test@test.com',
      token: 'test-token',
      image: 'https://example.com/avatar.jpg'
    };

    render(
      <BrowserRouter>
        <Header {...defaultProps} currentUser={currentUser} />
      </BrowserRouter>
    );

    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText(/New Post/)).toBeInTheDocument();
    expect(screen.getByText(/Settings/)).toBeInTheDocument();
    expect(screen.getByText('testuser')).toBeInTheDocument();
  });

  test('should not show Sign in/Sign up when user is logged in', () => {
    const currentUser = {
      username: 'testuser',
      email: 'test@test.com',
      token: 'test-token'
    };

    render(
      <BrowserRouter>
        <Header {...defaultProps} currentUser={currentUser} />
      </BrowserRouter>
    );

    expect(screen.queryByText('Sign in')).not.toBeInTheDocument();
    expect(screen.queryByText('Sign up')).not.toBeInTheDocument();
  });

  test('should not show New Post/Settings when user is logged out', () => {
    render(
      <BrowserRouter>
        <Header {...defaultProps} currentUser={null} />
      </BrowserRouter>
    );

    expect(screen.queryByText(/New Post/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Settings/)).not.toBeInTheDocument();
  });

  test('should render app name as brand', () => {
    render(
      <BrowserRouter>
        <Header {...defaultProps} currentUser={null} />
      </BrowserRouter>
    );

    const brandLink = screen.getByText('conduit');
    expect(brandLink).toBeInTheDocument();
    expect(brandLink.closest('a')).toHaveAttribute('href', '/');
  });

  test('should render user profile link for logged-in users', () => {
    const currentUser = {
      username: 'testuser',
      email: 'test@test.com',
      token: 'test-token'
    };

    render(
      <BrowserRouter>
        <Header {...defaultProps} currentUser={currentUser} />
      </BrowserRouter>
    );

    const userLink = screen.getByText('testuser').closest('a');
    expect(userLink).toHaveAttribute('href', '/@testuser');
  });

  test('should render user avatar for logged-in users', () => {
    const currentUser = {
      username: 'testuser',
      email: 'test@test.com',
      token: 'test-token',
      image: 'https://example.com/avatar.jpg'
    };

    render(
      <BrowserRouter>
        <Header {...defaultProps} currentUser={currentUser} />
      </BrowserRouter>
    );

    const avatar = screen.getByAltText('testuser');
    expect(avatar).toBeInTheDocument();
    expect(avatar).toHaveAttribute('src', 'https://example.com/avatar.jpg');
  });
});
