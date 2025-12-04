import articleListReducer from './articleList';
import {
  ARTICLE_FAVORITED,
  ARTICLE_UNFAVORITED,
  SET_PAGE,
  APPLY_TAG_FILTER,
  HOME_PAGE_LOADED,
  HOME_PAGE_UNLOADED,
  CHANGE_TAB
} from '../constants/actionTypes';

describe('articleList reducer', () => {
  test('should return initial state', () => {
    expect(articleListReducer(undefined, {})).toEqual({});
  });

  test('should handle ARTICLE_FAVORITED', () => {
    const initialState = {
      articles: [
        {
          slug: 'test-article',
          title: 'Test Article',
          favorited: false,
          favoritesCount: 5
        },
        {
          slug: 'another-article',
          title: 'Another Article',
          favorited: false,
          favoritesCount: 3
        }
      ]
    };

    const action = {
      type: ARTICLE_FAVORITED,
      payload: {
        article: {
          slug: 'test-article',
          favorited: true,
          favoritesCount: 6
        }
      }
    };

    const newState = articleListReducer(initialState, action);
    expect(newState.articles[0].favorited).toBe(true);
    expect(newState.articles[0].favoritesCount).toBe(6);
    expect(newState.articles[1].favorited).toBe(false); // Other article unchanged
  });

  test('should handle ARTICLE_UNFAVORITED', () => {
    const initialState = {
      articles: [
        {
          slug: 'test-article',
          title: 'Test Article',
          favorited: true,
          favoritesCount: 6
        }
      ]
    };

    const action = {
      type: ARTICLE_UNFAVORITED,
      payload: {
        article: {
          slug: 'test-article',
          favorited: false,
          favoritesCount: 5
        }
      }
    };

    const newState = articleListReducer(initialState, action);
    expect(newState.articles[0].favorited).toBe(false);
    expect(newState.articles[0].favoritesCount).toBe(5);
  });

  test('should handle SET_PAGE', () => {
    const initialState = {
      articles: [],
      articlesCount: 0,
      currentPage: 0
    };

    const newArticles = [
      { slug: 'article-1', title: 'Article 1' },
      { slug: 'article-2', title: 'Article 2' }
    ];

    const action = {
      type: SET_PAGE,
      payload: {
        articles: newArticles,
        articlesCount: 20
      },
      page: 2
    };

    const newState = articleListReducer(initialState, action);
    expect(newState.articles).toEqual(newArticles);
    expect(newState.articlesCount).toBe(20);
    expect(newState.currentPage).toBe(2);
  });

  test('should handle APPLY_TAG_FILTER', () => {
    const initialState = {
      articles: [],
      tag: null,
      currentPage: 0
    };

    const tagArticles = [
      { slug: 'tagged-article', title: 'Tagged Article', tagList: ['react'] }
    ];

    const action = {
      type: APPLY_TAG_FILTER,
      payload: {
        articles: tagArticles,
        articlesCount: 5
      },
      tag: 'react',
      pager: {}
    };

    const newState = articleListReducer(initialState, action);
    expect(newState.articles).toEqual(tagArticles);
    expect(newState.tag).toBe('react');
    expect(newState.articlesCount).toBe(5);
    expect(newState.currentPage).toBe(0);
    expect(newState.tab).toBe(null);
  });

  test('should handle HOME_PAGE_LOADED', () => {
    const action = {
      type: HOME_PAGE_LOADED,
      payload: [
        { tags: ['react', 'testing'] },
        {
          articles: [{ slug: 'home-article', title: 'Home Article' }],
          articlesCount: 10
        }
      ],
      tab: 'all',
      pager: {}
    };

    const newState = articleListReducer({}, action);
    expect(newState.articles).toEqual([{ slug: 'home-article', title: 'Home Article' }]);
    expect(newState.articlesCount).toBe(10);
    expect(newState.tags).toEqual(['react', 'testing']);
  });

  test('should handle HOME_PAGE_UNLOADED', () => {
    const initialState = {
      articles: [{ slug: 'article-1' }],
      articlesCount: 10,
      tab: 'all'
    };

    const action = { type: HOME_PAGE_UNLOADED };
    const newState = articleListReducer(initialState, action);
    expect(newState).toEqual({});
  });

  test('should handle CHANGE_TAB', () => {
    const action = {
      type: CHANGE_TAB,
      payload: {
        articles: [{ slug: 'feed-article' }],
        articlesCount: 5
      },
      tab: 'feed',
      pager: {}
    };

    const newState = articleListReducer({}, action);
    expect(newState.tab).toBe('feed');
    expect(newState.articles).toEqual(action.payload.articles);
    expect(newState.tag).toBe(null);
  });
});
