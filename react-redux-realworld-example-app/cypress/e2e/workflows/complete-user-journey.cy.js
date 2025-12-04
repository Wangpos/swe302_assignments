describe('Complete User Journeys', () => {
  it('should complete new user registration and article creation flow', () => {
    const timestamp = Date.now();
    const username = `newuser${timestamp}`;
    const email = `newuser${timestamp}@example.com`;

    // 1. Register
    cy.visit('/register');
    cy.get('input[placeholder="Username"]').type(username);
    cy.get('input[placeholder="Email"]').type(email);
    cy.get('input[placeholder="Password"]').type('Password123!');
    cy.get('button[type="submit"]').click();

    // 2. Should be logged in
    cy.url().should('eq', `${Cypress.config().baseUrl}/`);

    // 3. Navigate to editor
    cy.contains('New Article').click();

    // 4. Create article
    cy.get('input[placeholder="Article Title"]').type('My First Article');
    cy.get('input[placeholder="What\'s this article about?"]').type('Learning Cypress');
    cy.get('textarea').type('This is my first article!');
    cy.get('input[placeholder="Enter tags"]').type('first{enter}');
    cy.get('button[type="submit"]').click();

    // 5. Article should be published
    cy.contains('My First Article').should('be.visible');

    // 6. Go to profile
    cy.get('.nav-link').contains(username).click();

    // 7. Article should appear in profile
    cy.contains('My First Article').should('be.visible');
  });

  it('should complete article interaction flow', () => {
    cy.fixture('users').then((users) => {
      // Login
      cy.login(users.testUser.email, users.testUser.password);
      cy.visit('/');

      // Find an article
      cy.get('.article-preview').first().click();

      // Favorite the article
      cy.get('.btn-outline-primary').contains('Favorite').click();

      // Add a comment
      const comment = `Great article! ${Date.now()}`;
      cy.get('textarea[placeholder="Write a comment..."]').type(comment);
      cy.contains('Post Comment').click();

      // Comment should appear
      cy.contains(comment).should('be.visible');

      // View author profile
      cy.get('.author').first().click();

      // Should be on author's profile
      cy.url().should('include', '/@');
    });
  });

  it('should complete settings update flow', () => {
    cy.fixture('users').then((users) => {
      cy.login(users.testUser.email, users.testUser.password);
      cy.visit('/');

      // Go to settings
      cy.contains('Settings').click();

      // Update profile
      cy.get('textarea[placeholder="Short bio about you"]').clear().type('E2E Testing Expert');
      cy.contains('Update Settings').click();

      // Should redirect to profile
      cy.url().should('include', '/@');
      cy.contains('E2E Testing Expert').should('be.visible');
    });
  });

  it('should complete article discovery and reading workflow', () => {
    cy.fixture('users').then((users) => {
      cy.login(users.testUser.email, users.testUser.password);
      cy.visit('/');

      // 1. Browse global feed
      cy.contains('Global Feed').click();

      // 2. Filter by tag
      cy.get('.tag-pill').first().click();

      // 3. Read an article
      cy.get('.article-preview').first().click();

      // 4. Interact with article (favorite)
      cy.get('.btn-outline-primary').contains('Favorite').click();

      // 5. Go back to home
      cy.get('.navbar-brand').click();
      cy.url().should('eq', `${Cypress.config().baseUrl}/`);

      // 6. Check personal feed
      cy.contains('Your Feed').click();
    });
  });

  it('should complete social interaction workflow', () => {
    cy.fixture('users').then((users) => {
      // Login as first user
      cy.login(users.testUser.email, users.testUser.password);
      
      // Create an article
      cy.visit('/editor');
      const articleTitle = `Social Article ${Date.now()}`;
      cy.get('input[placeholder="Article Title"]').type(articleTitle);
      cy.get('input[placeholder="What\'s this article about?"]').type('Testing social features');
      cy.get('textarea').type('This article is for testing social interactions.');
      cy.get('button[type="submit"]').click();

      // Get article URL
      cy.url().then((articleUrl) => {
        // Logout and login as second user
        cy.logout();
        cy.login(users.secondUser.email, users.secondUser.password);

        // Visit the article
        cy.visit(articleUrl);

        // Follow the author
        cy.get('.btn-outline-secondary').contains('Follow').click();

        // Favorite the article
        cy.get('.btn-outline-primary').contains('Favorite').click();

        // Add a comment
        cy.get('textarea[placeholder="Write a comment..."]').type('Great article!');
        cy.contains('Post Comment').click();

        // Verify comment appears
        cy.contains('Great article!').should('be.visible');
      });
    });
  });
});
