import { promiseMiddleware, localStorageMiddleware } from './middleware';
import {
  ASYNC_START,
  ASYNC_END,
  LOGIN,
  LOGOUT,
  REGISTER
} from './constants/actionTypes';

// Mock agent
jest.mock('./agent', () => ({
  setToken: jest.fn()
}));

const agent = require('./agent');

describe('Middleware Tests', () => {
  describe('promiseMiddleware', () => {
    let store;
    let next;

    beforeEach(() => {
      store = {
        dispatch: jest.fn(),
        getState: jest.fn(() => ({
          viewChangeCounter: 0
        }))
      };
      next = jest.fn();
    });

    test('should pass through non-promise actions', () => {
      const action = {
        type: 'SOME_ACTION',
        payload: 'not a promise'
      };

      promiseMiddleware(store)(next)(action);

      expect(next).toHaveBeenCalledWith(action);
      expect(store.dispatch).not.toHaveBeenCalled();
    });

    test('should dispatch ASYNC_START for promise actions', () => {
      const action = {
        type: 'TEST_ACTION',
        payload: Promise.resolve({ data: 'test' })
      };

      promiseMiddleware(store)(next)(action);

      expect(store.dispatch).toHaveBeenCalledWith({
        type: ASYNC_START,
        subtype: 'TEST_ACTION'
      });
    });

    test('should unwrap promise and dispatch result', async () => {
      const resolvedData = { data: 'test' };
      const action = {
        type: 'TEST_ACTION',
        payload: Promise.resolve(resolvedData)
      };

      promiseMiddleware(store)(next)(action);

      // Wait for promise to resolve
      await new Promise(resolve => setTimeout(resolve, 10));

      expect(store.dispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: ASYNC_END
        })
      );
    });

    test('should handle promise errors', async () => {
      const error = {
        response: {
          body: { errors: { email: ['is invalid'] } }
        }
      };

      const action = {
        type: 'TEST_ACTION',
        payload: Promise.reject(error)
      };

      promiseMiddleware(store)(next)(action);

      // Wait for promise to reject
      await new Promise(resolve => setTimeout(resolve, 10));

      expect(store.dispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: ASYNC_END
        })
      );
    });

    test('should cancel outdated requests when view changes', async () => {
      let viewCounter = 0;
      store.getState = jest.fn(() => ({
        viewChangeCounter: viewCounter
      }));

      const action = {
        type: 'TEST_ACTION',
        payload: new Promise(resolve => {
          setTimeout(() => {
            viewCounter = 1; // Simulate view change
            resolve({ data: 'test' });
          }, 10);
        })
      };

      promiseMiddleware(store)(next)(action);

      await new Promise(resolve => setTimeout(resolve, 20));

      // Should dispatch ASYNC_START but not the final action since view changed
      expect(store.dispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: ASYNC_START
        })
      );
    });
  });

  describe('localStorageMiddleware', () => {
    let store;
    let next;

    beforeEach(() => {
      store = {
        dispatch: jest.fn(),
        getState: jest.fn()
      };
      next = jest.fn();

      // Mock localStorage
      Storage.prototype.setItem = jest.fn();
      agent.setToken.mockClear();
    });

    test('should save JWT token on LOGIN', () => {
      const action = {
        type: LOGIN,
        error: false,
        payload: {
          user: {
            email: 'test@test.com',
            token: 'test-jwt-token',
            username: 'testuser'
          }
        }
      };

      localStorageMiddleware(store)(next)(action);

      expect(window.localStorage.setItem).toHaveBeenCalledWith('jwt', 'test-jwt-token');
      expect(agent.setToken).toHaveBeenCalledWith('test-jwt-token');
      expect(next).toHaveBeenCalledWith(action);
    });

    test('should save JWT token on REGISTER', () => {
      const action = {
        type: REGISTER,
        error: false,
        payload: {
          user: {
            email: 'new@test.com',
            token: 'new-jwt-token',
            username: 'newuser'
          }
        }
      };

      localStorageMiddleware(store)(next)(action);

      expect(window.localStorage.setItem).toHaveBeenCalledWith('jwt', 'new-jwt-token');
      expect(agent.setToken).toHaveBeenCalledWith('new-jwt-token');
      expect(next).toHaveBeenCalledWith(action);
    });

    test('should not save token on LOGIN error', () => {
      const action = {
        type: LOGIN,
        error: true,
        payload: {
          errors: { 'email or password': ['is invalid'] }
        }
      };

      localStorageMiddleware(store)(next)(action);

      expect(window.localStorage.setItem).not.toHaveBeenCalled();
      expect(agent.setToken).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith(action);
    });

    test('should clear token on LOGOUT', () => {
      const action = {
        type: LOGOUT
      };

      localStorageMiddleware(store)(next)(action);

      expect(window.localStorage.setItem).toHaveBeenCalledWith('jwt', '');
      expect(agent.setToken).toHaveBeenCalledWith(null);
      expect(next).toHaveBeenCalledWith(action);
    });

    test('should pass through other actions unchanged', () => {
      const action = {
        type: 'SOME_OTHER_ACTION',
        payload: 'data'
      };

      localStorageMiddleware(store)(next)(action);

      expect(window.localStorage.setItem).not.toHaveBeenCalled();
      expect(agent.setToken).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith(action);
    });
  });
});
