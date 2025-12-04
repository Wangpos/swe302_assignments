import editorReducer from './editor';
import {
  EDITOR_PAGE_LOADED,
  EDITOR_PAGE_UNLOADED,
  ARTICLE_SUBMITTED,
  ASYNC_START,
  ADD_TAG,
  REMOVE_TAG,
  UPDATE_FIELD_EDITOR
} from '../constants/actionTypes';

describe('editor reducer', () => {
  test('should return initial state', () => {
    expect(editorReducer(undefined, {})).toEqual({});
  });

  test('should handle EDITOR_PAGE_LOADED with article (edit mode)', () => {
    const action = {
      type: EDITOR_PAGE_LOADED,
      payload: {
        article: {
          slug: 'test-article',
          title: 'Test Article',
          description: 'Test Description',
          body: 'Test Body',
          tagList: ['react', 'testing']
        }
      }
    };

    const newState = editorReducer({}, action);
    expect(newState.articleSlug).toBe('test-article');
    expect(newState.title).toBe('Test Article');
    expect(newState.description).toBe('Test Description');
    expect(newState.body).toBe('Test Body');
    expect(newState.tagList).toEqual(['react', 'testing']);
    expect(newState.tagInput).toBe('');
  });

  test('should handle EDITOR_PAGE_LOADED without article (new mode)', () => {
    const action = {
      type: EDITOR_PAGE_LOADED,
      payload: null
    };

    const newState = editorReducer({}, action);
    expect(newState.articleSlug).toBe('');
    expect(newState.title).toBe('');
    expect(newState.description).toBe('');
    expect(newState.body).toBe('');
    expect(newState.tagList).toEqual([]);
    expect(newState.tagInput).toBe('');
  });

  test('should handle EDITOR_PAGE_UNLOADED', () => {
    const initialState = {
      title: 'Test',
      description: 'Desc',
      body: 'Body',
      tagList: ['tag']
    };

    const action = { type: EDITOR_PAGE_UNLOADED };
    const newState = editorReducer(initialState, action);
    expect(newState).toEqual({});
  });

  test('should handle UPDATE_FIELD_EDITOR for title', () => {
    const action = {
      type: UPDATE_FIELD_EDITOR,
      key: 'title',
      value: 'New Title'
    };

    const newState = editorReducer({}, action);
    expect(newState.title).toBe('New Title');
  });

  test('should handle UPDATE_FIELD_EDITOR for description', () => {
    const action = {
      type: UPDATE_FIELD_EDITOR,
      key: 'description',
      value: 'New Description'
    };

    const newState = editorReducer({}, action);
    expect(newState.description).toBe('New Description');
  });

  test('should handle UPDATE_FIELD_EDITOR for body', () => {
    const action = {
      type: UPDATE_FIELD_EDITOR,
      key: 'body',
      value: 'New Body Content'
    };

    const newState = editorReducer({}, action);
    expect(newState.body).toBe('New Body Content');
  });

  test('should handle ADD_TAG', () => {
    const initialState = {
      tagInput: 'newtag',
      tagList: ['existingtag']
    };

    const action = { type: ADD_TAG };
    const newState = editorReducer(initialState, action);
    
    expect(newState.tagList).toEqual(['existingtag', 'newtag']);
    expect(newState.tagInput).toBe('');
  });

  test('should handle REMOVE_TAG', () => {
    const initialState = {
      tagList: ['react', 'testing', 'javascript']
    };

    const action = {
      type: REMOVE_TAG,
      tag: 'testing'
    };

    const newState = editorReducer(initialState, action);
    expect(newState.tagList).toEqual(['react', 'javascript']);
  });

  test('should handle ARTICLE_SUBMITTED success', () => {
    const action = {
      type: ARTICLE_SUBMITTED,
      error: false,
      payload: {
        article: { slug: 'submitted-article' }
      }
    };

    const newState = editorReducer({}, action);
    expect(newState.inProgress).toBe(null);
    expect(newState.errors).toBe(null);
  });

  test('should handle ARTICLE_SUBMITTED error', () => {
    const action = {
      type: ARTICLE_SUBMITTED,
      error: true,
      payload: {
        errors: {
          title: ["can't be blank"]
        }
      }
    };

    const newState = editorReducer({}, action);
    expect(newState.inProgress).toBe(null);
    expect(newState.errors).toEqual({
      title: ["can't be blank"]
    });
  });

  test('should handle ASYNC_START for ARTICLE_SUBMITTED', () => {
    const action = {
      type: ASYNC_START,
      subtype: ARTICLE_SUBMITTED
    };

    const newState = editorReducer({}, action);
    expect(newState.inProgress).toBe(true);
  });

  test('should manage tag list correctly through multiple operations', () => {
    let state = { tagInput: '', tagList: [] };

    // Add first tag
    state = { ...state, tagInput: 'react' };
    state = editorReducer(state, { type: ADD_TAG });
    expect(state.tagList).toEqual(['react']);

    // Add second tag
    state = { ...state, tagInput: 'testing' };
    state = editorReducer(state, { type: ADD_TAG });
    expect(state.tagList).toEqual(['react', 'testing']);

    // Remove first tag
    state = editorReducer(state, { type: REMOVE_TAG, tag: 'react' });
    expect(state.tagList).toEqual(['testing']);
  });
});
