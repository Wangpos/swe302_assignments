import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import ArticlePreview from './ArticlePreview';

const mockStore = configureMockStore();

describe('ArticlePreview Component', () => {
  const mockArticle = {
    slug: 'test-article',
    title: 'Test Article Title',
    description: 'Test article description',
    body: 'Test article body',
    tagList: ['react', 'testing'],
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    favorited: false,
    favoritesCount: 5,
    author: {
      username: 'testuser',
      bio: 'Test bio',
      image: 'https://example.com/avatar.jpg',
      following: false
    }
  };

  let store;

  beforeEach(() => {
    store = mockStore({});
  });

  test('should render article data correctly', () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <ArticlePreview article={mockArticle} />
        </BrowserRouter>
      </Provider>
    );

    expect(screen.getByText('Test Article Title')).toBeInTheDocument();
    expect(screen.getByText('Test article description')).toBeInTheDocument();
    expect(screen.getByText('testuser')).toBeInTheDocument();
  });

  test('should render author image', () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <ArticlePreview article={mockArticle} />
        </BrowserRouter>
      </Provider>
    );

    const authorImage = screen.getByAltText('testuser');
    expect(authorImage).toBeInTheDocument();
    expect(authorImage).toHaveAttribute('src', 'https://example.com/avatar.jpg');
  });

  test('should render tag list', () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <ArticlePreview article={mockArticle} />
        </BrowserRouter>
      </Provider>
    );

    expect(screen.getByText('react')).toBeInTheDocument();
    expect(screen.getByText('testing')).toBeInTheDocument();
  });

  test('should display favorites count', () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <ArticlePreview article={mockArticle} />
        </BrowserRouter>
      </Provider>
    );

    expect(screen.getByText('5')).toBeInTheDocument();
  });

  test('should show correct button style when article is not favorited', () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <ArticlePreview article={mockArticle} />
        </BrowserRouter>
      </Provider>
    );

    const favoriteButton = screen.getByText('5').closest('button');
    expect(favoriteButton).toHaveClass('btn-outline-primary');
  });

  test('should show correct button style when article is favorited', () => {
    const favoritedArticle = { ...mockArticle, favorited: true };
    
    render(
      <Provider store={store}>
        <BrowserRouter>
          <ArticlePreview article={favoritedArticle} />
        </BrowserRouter>
      </Provider>
    );

    const favoriteButton = screen.getByText('5').closest('button');
    expect(favoriteButton).toHaveClass('btn-primary');
  });

  test('should dispatch favorite action when clicking favorite button', () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <ArticlePreview article={mockArticle} />
        </BrowserRouter>
      </Provider>
    );

    const favoriteButton = screen.getByText('5').closest('button');
    fireEvent.click(favoriteButton);

    const actions = store.getActions();
    expect(actions.length).toBe(1);
    expect(actions[0].type).toBe('ARTICLE_FAVORITED');
  });

  test('should have clickable author link', () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <ArticlePreview article={mockArticle} />
        </BrowserRouter>
      </Provider>
    );

    const authorLinks = screen.getAllByText('testuser');
    expect(authorLinks[0].closest('a')).toHaveAttribute('href', '/@testuser');
  });
});
