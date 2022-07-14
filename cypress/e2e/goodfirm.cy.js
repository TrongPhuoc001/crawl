const _ = require("lodash");
const link = [
  "https://www.goodfirms.co/directory/platform/app-development",
  "https://www.goodfirms.co/directory/languages/top-software-development-companies",
  //"https://www.goodfirms.co/directory/cms/top-website-development-companies",
  //"https://www.goodfirms.co/ecommerce-development-companies",
  //"https://www.goodfirms.co/directory/services/list-blockchain-technology-companies",
  //"https://www.goodfirms.co/directory/marketing-services/top-digital-marketing-companies",
  // "https://www.goodfirms.co/seo-agencies",
  // "https://www.goodfirms.co/directory/platforms/top-web-design-companies",
  //"https://www.goodfirms.co/big-data-analytics",
  //"https://www.goodfirms.co/artificial-intelligence",
];
describe("empty spec", () => {
  it("passes", () => {
    for (let i = 0; i < link.length; i++) {
      getData(link[i], 1, []);
    }
  });

  const getData = (link, page, datas) => {
    const href = [];
    cy.visit(`${link}?location[159]=vn&page=${page}`).then((_resp) => {
      cy.wait(3000);
      cy.url().then((url) => {
        if (!url.includes("page=")) {
          return;
        }
        cy.wait(3000);
        cy.get(".service-directory-list").each(function (e, i) {
          cy.wrap(e)
            .within(function () {
              cy.get(".profile-short-info").within(function () {
                cy.get("a").each(function (k, i) {
                  href.push(k[0].href);
                });
              });
            })
            .then(() => {
              cy.get(".firm-location")
                .each(function (data, i) {
                  if (data[0].innerText.includes("Vietnam")) {
                    if (!href[i]) return;
                    cy.visit(href[i]);
                    const form = {};
                    cy.wait(3000);
                    cy.get(".container-bg", { timeout: 10000 })
                      .should("be.visible")
                      .then(($ele) => {
                        cy.get(".entity-detail-name-wrapper").then((data) => {
                          const dataSplit = data[0].textContent.split("\n");
                          form.teamName = dataSplit[1];
                          form.slogan = dataSplit[2];
                        });
                        cy.get(".entity-detail-header-logo")
                          .should("be.visible")
                          .each(function (d) {
                            cy.wrap(d).within(function () {
                              cy.get("img").then((data) => {
                                form.imageUrl = data[0].src;
                              });
                            });
                          });
                        if ($ele.find(".entity-employees").length > 0) {
                          cy.get(".entity-employees")
                            .should("be.visible")
                            .then((employees) => {
                              cy.wrap(employees).within(function () {
                                cy.get(".entity-services-txt").then((em) => {
                                  form.totalEmployees = em[0].innerText;
                                });
                              });
                            });
                        }
                        if ($ele.find(".entity-founded").length > 0) {
                          cy.get(".entity-founded")
                            .should("be.visible")
                            .then((founded) => {
                              cy.wrap(founded).within(function () {
                                cy.get(".entity-services-txt").then((fo) => {
                                  form.founded = fo[0].innerText;
                                });
                              });
                            });
                        }
                        if (
                          $ele.find(".entity-profile-full-summary").length > 0
                        ) {
                          cy.get(".entity-profile-full-summary").then(
                            (description) => {
                              cy.wrap(description).within(function () {
                                cy.get("p").then((des) => {
                                  if (!des) return;
                                  form.description = des[0].innerText;
                                });
                              });
                            }
                          );
                        }
                        if (
                          $ele.find(".entity-profile-key-client").length > 0
                        ) {
                          cy.get(".entity-profile-key-client").then(
                            (keyClient) => {
                              cy.wrap(keyClient).within(function () {
                                if (
                                  cy.$$(".entity-profile-key-client p").length >
                                    0 &&
                                  cy.$$(".entity-profile-key-client ul")
                                    .length === 0 &&
                                  cy.$$(".entity-profile-key-client ol")
                                    .length === 0
                                ) {
                                  cy.get("p").then((key) => {
                                    form.keyClient = [
                                      {
                                        keyName: key[0].innerText.split(
                                          new RegExp("[,;\n]", "g")
                                        ),
                                      },
                                    ];
                                  });
                                } else if (
                                  cy.$$(".entity-profile-key-client ul")
                                    .length > 0 &&
                                  cy.$$(".entity-profile-key-client ol")
                                    .length === 0
                                ) {
                                  form.keyClient = [];
                                  cy.get("ul").each((key) => {
                                    form.keyClient.push({
                                      keyName: key[0].innerHTML
                                        .trim()
                                        .split("\n"),
                                    });
                                  });
                                } else {
                                  form.keyClient = [];
                                  cy.get("ol").each((key) => {
                                    form.keyClient.push({
                                      keyName: key[0].innerHTML
                                        .trim()
                                        .split("\n"),
                                    });
                                  });
                                }
                              });
                            }
                          );
                        }
                        cy.get(".entity-focus-area-section-wrapper")
                          .should("be.visible")
                          .then((focus) => {
                            const skillDis = [];
                            Array.from(focus).forEach((f) => {
                              const divs = f.querySelectorAll("div");
                              const lis = divs[2].querySelectorAll("div");
                              skillDis.push({
                                skillDistributionName: divs[0].innerText,
                                skillDistributionValue: Array.from(lis).map(
                                  (l) => {
                                    if (!l) return;
                                    return {
                                      field: l.dataset.content.slice(
                                        3,
                                        l.dataset.content.length - 4
                                      ),
                                      quantity: l.innerText,
                                    };
                                  }
                                ),
                              });
                            });
                            form.skillDistribution = skillDis;
                          });

                        if ($ele.find(".entity-portfolio-card").length > 0) {
                          cy.get(".entity-portfolio-card")
                            .should("be.visible")
                            .then((port) => {
                              const portfolios = [];
                              cy.wait(3000);
                              Array.from(port).forEach((card) => {
                                const name = card.querySelector(
                                  ".portfolio-meta-wrapper"
                                ).innerText;
                                const detail = Array.from(
                                  card.querySelectorAll(".modal-portfolio-meta")
                                ).map((m) => m.innerText);
                                const description = card.querySelector(
                                  ".modal-portfolio-summary"
                                ).innerText;
                                const img = card.querySelector("img").src;
                                portfolios.push({
                                  name,
                                  description: description.slice(1, -1),
                                  img,
                                  detail: {
                                    amount: detail[0]
                                      .split("\n")
                                      .join()
                                      .slice(8, detail[0].length - 1),
                                    timeline: detail[1]
                                      .split("\n")
                                      .join()
                                      .slice(10, detail[0].length - 1),
                                    industry: detail[2]
                                      .split("\n")
                                      .join()
                                      .slice(10, detail[0].length - 1),
                                  },
                                });
                              });
                              form.portfolio = portfolios;
                            });
                        }
                        datas.push(form);
                      });
                  }
                })
                .then(() => {
                  const cate = link.split("/").slice(-1)[0];
                  cy.writeFile(
                    `cypress/fixtures/goodfirm/${cate}${page}.json`,
                    datas,
                    _,
                    2000
                  );
                  datas = null;
                  getData(link, page + 1, []);
                });
            });
        });
      });
    });
  };
});
