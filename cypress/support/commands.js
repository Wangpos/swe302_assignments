// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// Example custom command for API testing
Cypress.Commands.add("apiRequest", (method, endpoint, body = null) => {
  return cy.request({
    method: method,
    url: endpoint,
    body: body,
    failOnStatusCode: false,
  });
});
