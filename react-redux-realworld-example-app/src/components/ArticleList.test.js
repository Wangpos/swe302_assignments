import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ArticleList from './ArticleList';

// Mock the ArticlePreview component to avoid testing it here
jest.mock('./ArticlePreview', () => {
  return function MockArticlePreview({ article }) {
    return <div data-testid="article-preview">{article.title}</div>;
  };
});

// Mock ListPagination
jest.mock('./ListPagination', () => {
  return function MockListPagination() {
    return <div data-testid="pagination">Pagination</div>;
  };
});

describe('ArticleList Component', () => {
  test('should render loading state when articles is null/undefined', () => {
    render(
      <BrowserRouter>
        <ArticleList articles={null} />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  test('should render empty message when articles array is empty', () => {
    render(
      <BrowserRouter>
        <ArticleList articles={[]} />
      </BrowserRouter>
    );
    
    expect(screen.getByText('No articles are here... yet.')).toBeInTheDocument();
  });

  test('should render multiple articles', () => {
    const mockArticles = [
      {
        slug: 'test-article-1',
        title: 'Test Article 1',
        description: 'Description 1',
        author: { username: 'testuser1' },
        createdAt: '2024-01-01',
        favorited: false,
        favoritesCount: 0,
        tagList: []
      },
      {
        slug: 'test-article-2',
        title: 'Test Article 2',
        description: 'Description 2',
        author: { username: 'testuser2' },
        createdAt: '2024-01-02',
        favorited: false,
        favoritesCount: 0,
        tagList: []
      }
    ];

    render(
      <BrowserRouter>
        <ArticleList articles={mockArticles} />
      </BrowserRouter>
    );

    const articlePreviews = screen.getAllByTestId('article-preview');
    expect(articlePreviews).toHaveLength(2);
    expect(screen.getByText('Test Article 1')).toBeInTheDocument();
    expect(screen.getByText('Test Article 2')).toBeInTheDocument();
  });

  test('should render pagination when articles exist', () => {
    const mockArticles = [
      {
        slug: 'test-article-1',
        title: 'Test Article 1',
        description: 'Description 1',
        author: { username: 'testuser1' },
        createdAt: '2024-01-01',
        favorited: false,
        favoritesCount: 0,
        tagList: []
      }
    ];

    render(
      <BrowserRouter>
        <ArticleList articles={mockArticles} pager={{}} articlesCount={10} currentPage={0} />
      </BrowserRouter>
    );

    expect(screen.getByTestId('pagination')).toBeInTheDocument();
  });
});
