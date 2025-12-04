import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import Editor from './Editor';

const mockStore = configureMockStore();

// Mock the agent module
jest.mock('../agent', () => ({
  Articles: {
    create: jest.fn(() => Promise.resolve({ article: {} })),
    update: jest.fn(() => Promise.resolve({ article: {} })),
    get: jest.fn(() => Promise.resolve({ article: {} }))
  }
}));

// Mock ListErrors component
jest.mock('./ListErrors', () => {
  return function MockListErrors() {
    return null;
  };
});

describe('Editor Component', () => {
  let store;

  beforeEach(() => {
    store = mockStore({
      editor: {
        title: '',
        description: '',
        body: '',
        tagInput: '',
        tagList: [],
        inProgress: false,
        errors: null
      }
    });
  });

  const renderEditor = (slug = '') => {
    const history = {
      push: jest.fn(),
      listen: jest.fn(),
      createHref: jest.fn(),
      location: { pathname: slug ? `/editor/${slug}` : '/editor' }
    };
    
    const match = {
      params: { slug },
      isExact: true,
      path: '/editor/:slug?',
      url: slug ? `/editor/${slug}` : '/editor'
    };
    
    return render(
      <Provider store={store}>
        <BrowserRouter>
          <Editor history={history} match={match} location={history.location} />
        </BrowserRouter>
      </Provider>
    );
  };

  test('should render form fields', () => {
    renderEditor();

    expect(screen.getByPlaceholderText('Article Title')).toBeInTheDocument();
    expect(screen.getByPlaceholderText("What's this article about?")).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Write your article (in markdown)')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter tags')).toBeInTheDocument();
  });

  test('should render publish button', () => {
    renderEditor();

    expect(screen.getByText('Publish Article')).toBeInTheDocument();
  });

  test('should update title field', () => {
    renderEditor();

    const titleInput = screen.getByPlaceholderText('Article Title');
    fireEvent.change(titleInput, { target: { value: 'Test Title' } });

    const actions = store.getActions();
    expect(actions).toContainEqual({
      type: 'UPDATE_FIELD_EDITOR',
      key: 'title',
      value: 'Test Title'
    });
  });

  test('should update description field', () => {
    renderEditor();

    const descInput = screen.getByPlaceholderText("What's this article about?");
    fireEvent.change(descInput, { target: { value: 'Test Description' } });

    const actions = store.getActions();
    expect(actions).toContainEqual({
      type: 'UPDATE_FIELD_EDITOR',
      key: 'description',
      value: 'Test Description'
    });
  });

  test('should update body field', () => {
    renderEditor();

    const bodyInput = screen.getByPlaceholderText('Write your article (in markdown)');
    fireEvent.change(bodyInput, { target: { value: 'Test Body' } });

    const actions = store.getActions();
    expect(actions).toContainEqual({
      type: 'UPDATE_FIELD_EDITOR',
      key: 'body',
      value: 'Test Body'
    });
  });

  test('should add tag on Enter key press', () => {
    renderEditor();

    const tagInput = screen.getByPlaceholderText('Enter tags');
    fireEvent.keyUp(tagInput, { keyCode: 13 });

    const actions = store.getActions();
    const addTagAction = actions.find(action => action.type === 'ADD_TAG');
    expect(addTagAction).toBeDefined();
  });

  test('should display existing tags', () => {
    store = mockStore({
      editor: {
        title: '',
        description: '',
        body: '',
        tagInput: '',
        tagList: ['react', 'testing'],
        inProgress: false,
        errors: null
      }
    });

    renderEditor();

    expect(screen.getByText('react')).toBeInTheDocument();
    expect(screen.getByText('testing')).toBeInTheDocument();
  });

  test('should dispatch submit action on form submission', () => {
    store = mockStore({
      editor: {
        title: 'Test Title',
        description: 'Test Description',
        body: 'Test Body',
        tagInput: '',
        tagList: ['test'],
        inProgress: false,
        errors: null,
        articleSlug: null
      }
    });

    renderEditor();

    const submitButton = screen.getByText('Publish Article');
    fireEvent.click(submitButton);

    const actions = store.getActions();
    const submitAction = actions.find(action => action.type === 'ARTICLE_SUBMITTED');
    expect(submitAction).toBeDefined();
  });
});
