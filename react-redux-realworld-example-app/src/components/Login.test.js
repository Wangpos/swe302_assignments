import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import Login from './Login';

const mockStore = configureMockStore();

// Mock the agent module
jest.mock('../agent', () => ({
  Auth: {
    login: jest.fn(() => Promise.resolve({ user: { email: 'test@test.com', token: 'test-token' } }))
  }
}));

// Mock ListErrors component
jest.mock('./ListErrors', () => {
  return function MockListErrors({ errors }) {
    if (!errors) return null;
    return <div data-testid="errors">{JSON.stringify(errors)}</div>;
  };
});

describe('Login Component', () => {
  let store;
  
  beforeEach(() => {
    store = mockStore({
      auth: {
        email: '',
        password: '',
        errors: null,
        inProgress: false
      }
    });
  });

  test('should render login form', () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      </Provider>
    );

    expect(screen.getByText('Sign In')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    expect(screen.getByText('Sign in')).toBeInTheDocument();
  });

  test('should render link to registration page', () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      </Provider>
    );

    const registerLink = screen.getByText('Need an account?');
    expect(registerLink).toBeInTheDocument();
    expect(registerLink.closest('a')).toHaveAttribute('href', '/register');
  });

  test('should update email field on input', () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      </Provider>
    );

    const emailInput = screen.getByPlaceholderText('Email');
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

    const actions = store.getActions();
    expect(actions).toContainEqual({
      type: 'UPDATE_FIELD_AUTH',
      key: 'email',
      value: 'test@example.com'
    });
  });

  test('should update password field on input', () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      </Provider>
    );

    const passwordInput = screen.getByPlaceholderText('Password');
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    const actions = store.getActions();
    expect(actions).toContainEqual({
      type: 'UPDATE_FIELD_AUTH',
      key: 'password',
      value: 'password123'
    });
  });

  test('should dispatch login action on form submission', () => {
    store = mockStore({
      auth: {
        email: 'test@test.com',
        password: 'password123',
        errors: null,
        inProgress: false
      }
    });

    render(
      <Provider store={store}>
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      </Provider>
    );

    const form = screen.getByText('Sign in').closest('form');
    fireEvent.submit(form);

    const actions = store.getActions();
    const loginAction = actions.find(action => action.type === 'LOGIN');
    expect(loginAction).toBeDefined();
  });

  test('should display error messages when errors exist', () => {
    store = mockStore({
      auth: {
        email: '',
        password: '',
        errors: { 'email or password': ['is invalid'] },
        inProgress: false
      }
    });

    render(
      <Provider store={store}>
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      </Provider>
    );

    expect(screen.getByTestId('errors')).toBeInTheDocument();
  });
});
