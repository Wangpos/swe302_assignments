// Additional helpful commands for E2E testing

// Command to create a test user
Cypress.Commands.add('createTestUser', (userOverrides = {}) => {
  const timestamp = Date.now();
  const defaultUser = {
    email: `testuser${timestamp}@example.com`,
    username: `testuser${timestamp}`,
    password: 'TestUser123!'
  };
  
  const user = { ...defaultUser, ...userOverrides };
  
  return cy.request({
    method: 'POST',
    url: `${Cypress.env('apiUrl')}/users`,
    body: { user }
  }).then((response) => {
    window.localStorage.setItem('jwt', response.body.user.token);
    return response.body.user;
  });
});

// Command to wait for element and ensure it's interactable
Cypress.Commands.add('waitForElement', (selector, timeout = 10000) => {
  return cy.get(selector, { timeout })
    .should('be.visible')
    .should('not.be.disabled');
});

// Command to handle form submission with loading states
Cypress.Commands.add('submitForm', (buttonSelector = 'button[type="submit"]') => {
  cy.get(buttonSelector).click();
  cy.get(buttonSelector).should('not.contain.text', 'Loading...');
});

// Command to clean up test data
Cypress.Commands.add('cleanupTestData', () => {
  const token = window.localStorage.getItem('jwt');
  if (token) {
    // Delete test articles created by current user
    cy.request({
      method: 'GET',
      url: `${Cypress.env('apiUrl')}/user`,
      headers: { 'Authorization': `Token ${token}` }
    }).then((response) => {
      const username = response.body.user.username;
      if (username.includes('test') || username.includes('cypress')) {
        // This is a test user, clean up their data
        cy.log('Cleaning up test data for user:', username);
      }
    });
  }
});

// Command to intercept API calls for testing
Cypress.Commands.add('interceptArticlesAPI', () => {
  cy.intercept('GET', `${Cypress.env('apiUrl')}/articles*`).as('getArticles');
  cy.intercept('POST', `${Cypress.env('apiUrl')}/articles`).as('createArticle');
  cy.intercept('PUT', `${Cypress.env('apiUrl')}/articles/*`).as('updateArticle');
  cy.intercept('DELETE', `${Cypress.env('apiUrl')}/articles/*`).as('deleteArticle');
});

// Command to wait for API responses
Cypress.Commands.add('waitForArticlesAPI', () => {
  cy.wait('@getArticles');
});

// Command to handle browser-specific behaviors
Cypress.Commands.add('browserSpecificWait', (firefoxWait = 500, defaultWait = 100) => {
  if (Cypress.browser.name === 'firefox') {
    cy.wait(firefoxWait);
  } else {
    cy.wait(defaultWait);
  }
});

// Command to take screenshot with context
Cypress.Commands.add('takeContextualScreenshot', (name, context = '') => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const screenshotName = `${name}-${context}-${timestamp}`;
  cy.screenshot(screenshotName);
});
