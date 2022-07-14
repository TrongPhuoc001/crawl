const _ = require("lodash");
const links = [
  // "https://clutch.co/agencies",
  // "https://clutch.co/agencies/digital-marketing",
  "https://clutch.co/agencies/social-media-marketing",
  // "https://clutch.co/agencies/app-marketing",
  // "https://clutch.co/agencies/content-marketing",
  // "https://clutch.co/agencies/digital",
  // "https://clutch.co/agencies/creative",
  // "https://clutch.co/agencies/branding",
  // "https://clutch.co/agencies/naming",
  // "https://clutch.co/agencies/video-production",
  // "https://clutch.co/pr-firms",
  // "https://clutch.co/agencies/media-buying",
  // "https://clutch.co/agencies/digital-strategy",
  // "https://clutch.co/agencies/email",
  // "https://clutch.co/agencies/inbound-marketing",
  // "https://clutch.co/agencies/market-research",
  // "https://clutch.co/agencies/experiential",
  // "https://clutch.co/agencies/event",
  // "https://clutch.co/marketing",
  // "https://clutch.co/seo-firms",
  // "https://clutch.co/agencies/ppc",
  // "https://clutch.co/agencies/sem",
  // "https://clutch.co/directory/mobile-application-developers",
  // "https://clutch.co/directory/iphone-application-developers",
  // "https://clutch.co/directory/android-application-developers",
  // "https://clutch.co/app-development",
  // "https://clutch.co/web-developers",
  // "https://clutch.co/developers",
  // "https://clutch.co/developers/ecommerce",
  // "https://clutch.co/website-builders",
  // "https://clutch.co/developers/dot-net",
  // "https://clutch.co/developers/virtual-reality",
  // "https://clutch.co/developers/artificial-intelligence",
  // "https://clutch.co/developers/blockchain",
  // "https://clutch.co/developers/drupal",
  // "https://clutch.co/developers/internet-of-things",
  // "https://clutch.co/developers/magento",
  // "https://clutch.co/web-developers/php",
  // "https://clutch.co/developers/ruby-rails",
  // "https://clutch.co/developers/shopify",
  // "https://clutch.co/developers/wordpress",
  // "https://clutch.co/web-designers",
  // "https://clutch.co/agencies/ui-ux",
  // "https://clutch.co/agencies/digital-design",
  // "https://clutch.co/agencies/graphic-designers",
  // "https://clutch.co/agencies/logo-designers",
  // "https://clutch.co/agencies/product-design",
  // "https://clutch.co/agencies/design",
  // "https://clutch.co/agencies/packaging-design",
  // "https://clutch.co/agencies/print-design",
  // "https://clutch.co/it-services/msp",
  // "https://clutch.co/it-services",
  // "https://clutch.co/it-services/cloud",
  // "https://clutch.co/it-services/analytics",
  // "https://clutch.co/it-services/cybersecurity",
  // "https://clutch.co/it-services/staff-augmentation",
  // "https://clutch.co/cloud",
  // "https://clutch.co/bpo",
  // "https://clutch.co/call-centers/telemarketing",
  // "https://clutch.co/consulting",
  // "https://clutch.co/accounting",
  // "https://clutch.co/hr",
  // "https://clutch.co/call-centers/answering-services",
  // "https://clutch.co/real-estate",
  // "https://clutch.co/logistics/supply-chain-management",
  // "https://clutch.co/call-centers",
  // "https://clutch.co/call-centers/sales-outsourcing",
  // "https://clutch.co/call-centers/telemarketing",
  // "https://clutch.co/call-centers/inbound",
];

const query = "geona_id=704";
describe("Crawler", () => {
  it("crawls", () => {
    let datas = [];
    links.forEach((link) => {
      getData({ link: `${link}?${query}`, nextAble: true }, datas);
    });
  });

  const getData = (link, datas) => {
    if (!link.nextAble) {
      console.log(link);
      const cate = link.link.split("/").slice(-1)[0].split("?")[0];
      cy.writeFile(`cypress/fixtures/clutch/${cate}.json`, datas, _, 2000);
      datas = [];
      return;
    }
    console.log(link);
    cy.visit(link.link);
    cy.wait(2000);
    cy.get("#providers")
      .then((el) => {
        const p = Array.from(el)[0];
        const nextPage = p.querySelector(".next a");
        if (nextPage) {
          return { link: nextPage.href, nextAble: true };
        } else {
          return { link: link.link, nextAble: false };
        }
      })
      .then((href) => {
        cy.get(".provider-row")
          .then((el) => {
            let data = {};

            Array.from(el).forEach((e, idx, arr) => {
              const locality = e.querySelector(".locality")?.innerText;
              if (!locality || !locality.includes("Vietnam")) {
                return;
              }
              const link = e.querySelector(".website-profile a").href;
              try {
                cy.visit(link);
                cy.wait(2000);
                cy.get(".company_logotype")
                  .then((el) => {
                    const elm = Array.from(el)[0];

                    const img = elm.querySelector("a").querySelector("img").src;

                    const companyName = elm
                      .querySelector("h1")
                      .querySelector("a").innerText;
                    data = {
                      ...data,
                      companyName,
                      img,
                    };
                  })
                  .then(() => {
                    cy.get("#summary_section").then((el) => {
                      const elm = Array.from(el)[0];

                      const summary = elm.querySelectorAll("div")[1];

                      const location =
                        summary.querySelector(".offset-md-2")?.innerText;

                      if (!location.includes("Vietnam")) return;

                      const description = summary.querySelector(
                        ".summary-description"
                      );
                      const companyTitle = description
                        .querySelector(".field")
                        .querySelector("h2")?.innerText;

                      const something = description.querySelectorAll(".row")[1];
                      const sectionSummary = something
                        .querySelectorAll("div")[0]
                        ?.querySelector("p")?.innerText;
                      const sectionSummaryHidden =
                        something
                          .querySelectorAll("div")[0]
                          .querySelector("p")
                          .querySelector("span")?.innerText ||
                        something
                          .querySelectorAll("div")[0]
                          .querySelectorAll("p")?.innerText;

                      const projectDetail = something
                        .querySelector(".col-md-3")
                        ?.innerText.split("\n");

                      const projectSize = projectDetail[0]
                        .replace(/[(a-z)(A-Z)(/$+)]/g, "")
                        .trim();
                      const hoursRate = projectDetail[1]
                        .replace(/[(a-z)(A-Z)(/$)]/g, "")
                        .trim();
                      const employeeSize = projectDetail[2].trim();
                      const founded = projectDetail[3]
                        .replace(/[(a-z)(A-Z)]/g, "")
                        .trim();

                      const sectionText = sectionSummary + sectionSummaryHidden;

                      data = {
                        ...data,
                        companyTitle,
                        projectDetail,
                        projectSize,
                        hoursRate,
                        employeeSize,
                        founded,
                        sectionText,
                        location,
                      };
                      cy.get("#focus")
                        .then((el) => {
                          const elm = Array.from(el)[0];
                          const servicesLine = Array.from(
                            elm
                              .querySelector(".section-accordion")
                              .querySelectorAll(".chart-wrapper")
                          )?.map((e) => {
                            return {
                              skilldistributionName:
                                e.querySelector(".graph-title")?.innerText,
                              skilldistributionValue: Array.from(
                                e.querySelectorAll(".chartAreaContainer div")
                              )?.map((div) => {
                                return {
                                  field: div?.dataset?.content?.slice(3, -4),
                                  quantity: +div?.innerText.slice(0, -1),
                                };
                              }),
                            };
                          });
                          data.servicesLine = servicesLine;
                        })
                        .then(() => {
                          if (cy.$$("#portfolio").length > 0) {
                            cy.get("#portfolio")
                              .should("exist")
                              .then((el) => {
                                const elm = Array.from(el)[0];
                                const keyClient =
                                  elm
                                    .querySelector(".col-md-9")
                                    .querySelector(".field")
                                    ?.querySelector(".field-item")
                                    ?.innerText.split(",") || [];
                                const portfolio = elm
                                  .querySelector(".view-content")
                                  ?.querySelectorAll(".p-element");
                                const portfolioList = [];
                                (portfolio ? portfolio : []).forEach(
                                  (p_element) => {
                                    let img = p_element
                                      .querySelector(".image-style-one")
                                      .querySelector(".image-source")
                                      ?.getAttribute("data-source");
                                    let caption = p_element
                                      .querySelector(".image-style-one")
                                      ?.querySelector(".image-hover")
                                      ?.innerText.trim();
                                    let des = p_element
                                      .querySelector(".project-description")
                                      ?.innerText.trim();
                                    portfolioList.push({ img, caption, des });
                                  }
                                );
                                data.keyClients = keyClient;
                                data.portfolios = portfolioList;
                              });
                          }
                          cy.log(data);
                          datas.push(data);
                        });
                    });
                  });
                //cy.log(data);
              } catch (error) {
                cy.log(error);
              }
            });
          })
          .then(() => {
            getData(href, datas);
          });
      });
  };
});
