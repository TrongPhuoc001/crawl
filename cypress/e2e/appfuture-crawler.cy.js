const _ = require("lodash");
const category = [
  "app-developers",
  "web-developers",
  "seo-companies",
  "software-development-companies",
  "web-design-companies",
  "digital-marketing-companies",
];
const baseUrl = "https://appfutura.com/";
describe("Crawler", () => {
  it("crawls", () => {
    let data = [];
    category.forEach((c) => {
      cy.visit(baseUrl + c + "/vietnam");
      cy.wait(3000);
      cy.get("body")
        .then((el) => {
          const page = [];
          const body = Array.from(el)[0];
          const pagination = body.querySelector(".pagination");
          if (pagination) {
            const maxPage = +body
              .querySelector(".pagination")
              .innerText.split("/")[1]
              .trim();
            for (let i = 2; i <= maxPage; i++) {
              page.push(i);
            }
          }
          return page;
        })
        .then((page) => {
          do {
            cy.get(".developer").then((el) => {
              Array.from(el).forEach((e, idx, arr) => {
                const link = e
                  .querySelector(".row")
                  .querySelectorAll("div")[1]
                  .querySelector("a").href;
                try {
                  if (link.includes("h2-technologies")) return;
                  cy.visit(link);
                  cy.wait(2000);
                  cy.get("#developerInfoFixed").then((e) => {
                    const el = Array.from(e)[0];
                    const img = el.querySelector("img").src;
                    const companyName = el.querySelector(
                      ".big-title.no-mar-top.no-mar-bot.strong"
                    ).innerText;
                    cy.get("ul.list-inline.no-mar").then((ul) => {
                      let [location, linkWebsite] = Array.from(
                        Array.from(ul)[0].querySelectorAll("li")
                      );
                      location = location.innerText;
                      linkWebsite = linkWebsite.querySelector("a").href;
                      cy.get(".developer-description").then((des) => {
                        const description = Array.from(des)[0].innerText;
                        cy.get(".service-container").then((sc) => {
                          const services = Array.from(sc).map(
                            (e) => e.innerText
                          );
                          if (cy.$$("#view-more-works-button").length > 0) {
                            cy.get("#view-more-works-button").click();
                            cy.wait(4000);
                          }
                          if (cy.$$(".row.works-profile").length > 0) {
                            cy.get(".row.works-profile").then((works) => {
                              const portfolios = [];
                              Array.from(
                                Array.from(works)[0].querySelectorAll("a")
                              ).forEach((a) => {
                                const des = a.title;
                                const img = a.querySelector("img")?.src || "";
                                portfolios.push({ des, img });
                              });
                              data.push({
                                img,
                                companyName,
                                location,
                                linkWebsite,
                                description,
                                services,
                                portfolios,
                              });
                            });
                          } else {
                            data.push({
                              img,
                              companyName,
                              location,
                              linkWebsite,
                              description,
                              services,
                              portfolios: [],
                            });
                          }
                          if (idx === arr.length - 1) {
                            cy.writeFile(
                              `cypress/fixtures/appfutura_${c}.json`,
                              data,
                              _,
                              2000
                            );
                            data = [];
                          }
                        });
                      });
                    });
                  });
                } catch (e) {
                  console.log(e);
                }
              });
            });
          } while (
            page.length > 0 &&
            cy.visit(baseUrl + c + "/vietnam?p=" + page.shift()) &&
            cy.wait(3000)
          );
        });
      cy.wait(2000);
    });
  });
});
