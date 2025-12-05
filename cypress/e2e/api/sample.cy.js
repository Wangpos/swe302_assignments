describe("API Tests", () => {
  it("should verify the API is running", () => {
    cy.request("GET", "/api/ping").then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property("message", "pong");
    });
  });
});
