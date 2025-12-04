import authReducer from './auth';
import {
  LOGIN,
  REGISTER,
  LOGIN_PAGE_UNLOADED,
  REGISTER_PAGE_UNLOADED,
  ASYNC_START,
  UPDATE_FIELD_AUTH
} from '../constants/actionTypes';

describe('auth reducer', () => {
  test('should return initial state', () => {
    expect(authReducer(undefined, {})).toEqual({});
  });

  test('should handle LOGIN success', () => {
    const action = {
      type: LOGIN,
      error: false,
      payload: {
        user: {
          email: 'test@test.com',
          token: 'jwt-token',
          username: 'testuser'
        }
      }
    };

    const newState = authReducer({}, action);
    expect(newState.inProgress).toBe(false);
    expect(newState.errors).toBe(null);
  });

  test('should handle LOGIN error', () => {
    const action = {
      type: LOGIN,
      error: true,
      payload: {
        errors: {
          'email or password': ['is invalid']
        }
      }
    };

    const newState = authReducer({}, action);
    expect(newState.inProgress).toBe(false);
    expect(newState.errors).toEqual({
      'email or password': ['is invalid']
    });
  });

  test('should handle REGISTER success', () => {
    const action = {
      type: REGISTER,
      error: false,
      payload: {
        user: {
          email: 'test@test.com',
          token: 'jwt-token',
          username: 'testuser'
        }
      }
    };

    const newState = authReducer({}, action);
    expect(newState.inProgress).toBe(false);
    expect(newState.errors).toBe(null);
  });

  test('should handle REGISTER error', () => {
    const action = {
      type: REGISTER,
      error: true,
      payload: {
        errors: {
          email: ['has already been taken']
        }
      }
    };

    const newState = authReducer({}, action);
    expect(newState.errors).toEqual({
      email: ['has already been taken']
    });
  });

  test('should handle LOGIN_PAGE_UNLOADED', () => {
    const initialState = {
      email: 'test@test.com',
      password: 'password123',
      errors: null
    };

    const action = { type: LOGIN_PAGE_UNLOADED };
    const newState = authReducer(initialState, action);
    expect(newState).toEqual({});
  });

  test('should handle REGISTER_PAGE_UNLOADED', () => {
    const initialState = {
      email: 'test@test.com',
      username: 'testuser',
      password: 'password123',
      errors: null
    };

    const action = { type: REGISTER_PAGE_UNLOADED };
    const newState = authReducer(initialState, action);
    expect(newState).toEqual({});
  });

  test('should handle ASYNC_START for LOGIN', () => {
    const action = {
      type: ASYNC_START,
      subtype: LOGIN
    };

    const newState = authReducer({}, action);
    expect(newState.inProgress).toBe(true);
  });

  test('should handle ASYNC_START for REGISTER', () => {
    const action = {
      type: ASYNC_START,
      subtype: REGISTER
    };

    const newState = authReducer({}, action);
    expect(newState.inProgress).toBe(true);
  });

  test('should handle UPDATE_FIELD_AUTH', () => {
    const initialState = {
      email: '',
      password: ''
    };

    const action = {
      type: UPDATE_FIELD_AUTH,
      key: 'email',
      value: 'test@test.com'
    };

    const newState = authReducer(initialState, action);
    expect(newState.email).toBe('test@test.com');
  });

  test('should update multiple fields with UPDATE_FIELD_AUTH', () => {
    let state = { email: '', password: '' };

    state = authReducer(state, {
      type: UPDATE_FIELD_AUTH,
      key: 'email',
      value: 'test@test.com'
    });

    state = authReducer(state, {
      type: UPDATE_FIELD_AUTH,
      key: 'password',
      value: 'password123'
    });

    expect(state.email).toBe('test@test.com');
    expect(state.password).toBe('password123');
  });
});
