const _ = require("lodash");
describe("Crawler", () => {
  it("crawls", () => {
    cy.visit(
      "https://www.goodfirms.co/ecommerce-development-companies?location%5B159%5D=vn&page=4"
    ).then(() => {
      cy.url().then((url) => {
        console.log(url);
        console.log(url.includes("page=4"));
      });
    });
  });
});
