import { expect, test } from "@playwright/test";

import type { AppFixture, Fixture } from "./helpers/create-fixture";
import { createAppFixture, createFixture, mdx } from "./helpers/create-fixture";
import { PlaywrightFixture } from "./helpers/playwright-fixture";

let fixture: Fixture;
let appFixture: AppFixture;

const PAGE_TITLE = 'Page Title';
const VIEWPORT_VALUE = 'width=device-width,initial-scale=1';
const HEADER_KEY = 'content-security-policy';
const HEADER_VALUE = 'img-src https://*';

test.describe("MDX", () => {
  test.beforeAll(async () => {
    fixture = await createFixture({
      files: {
        "app/routes/index.mdx": mdx`---
meta:
    viewport: ${VIEWPORT_VALUE}
    title: ${PAGE_TITLE}

headers:
    ${HEADER_KEY}: ${HEADER_VALUE}

message: Hello World!
---

# MDX Message from attributes: {attributes.message}
      `,
      },
    });

    appFixture = await createAppFixture(fixture);
  });

  test("values from frontmatter headers attribute are sent as response headers", async ({ page }) => {
    let response: Response = await fixture.requestDocument("/");
    expect(response.headers.get(HEADER_KEY)).toBe(HEADER_VALUE);
  });

  test("values from frontmatter meta attribute are applied to the response", async ({ page }) => {
    let app = new PlaywrightFixture(appFixture, page);
    await app.goto("/");

    expect(await app.getHtml(`meta[content="${VIEWPORT_VALUE}"]`)).toBeTruthy();
  });

  test("frontmatter attributes can be used in JSX interpolation", async ({ page }) => {
    let app = new PlaywrightFixture(appFixture, page);
    await app.goto(`/`);

    let h1 = await page.waitForSelector("h1");
    expect(await h1.innerText()).toBe(`MDX Message from attributes: Hello World!`);
  });

  test("title value from frontmatter meta attributes is applied to the page", async ({ page }) => {
    let app = new PlaywrightFixture(appFixture, page);
    await app.goto(`/`);

    expect(await page.title()).toBe(PAGE_TITLE);
  });
});
