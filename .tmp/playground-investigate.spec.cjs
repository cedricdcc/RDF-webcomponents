const { test, expect } = require("playwright/test");
const fs = require("fs");
const path = require("path");

const relevantPathFragments = [
  "/playground",
  "/rdf-webcomponents.js",
  "/demo/config-css-selector.json",
  "/demo/books.ttl",
  "/demo/book-shapes.ttl",
  "/demo/book-card.html",
];

const isRelevantUrl = (url) =>
  relevantPathFragments.some((fragment) => url.includes(fragment));

const safeDetail = (detail) => {
  try {
    return JSON.parse(JSON.stringify(detail));
  } catch {
    return String(detail);
  }
};

test("investigate first playground example", async ({ page }) => {
  const consoleMessages = [];
  const pageErrors = [];
  const requests = [];
  const responses = [];
  const requestFailures = [];

  await page.addInitScript(() => {
    const eventNames = [
      "orchestrator-scan-start",
      "orchestrator-scan-complete",
      "orchestrator-link-loading",
      "orchestrator-link-ready",
      "orchestrator-link-error",
      "orchestrator-link-rollback",
      "triplestore-loading",
      "triplestore-ready",
      "triplestore-error",
      "shapes-loaded",
      "shape-processed",
      "shape-error",
      "render-complete",
      "render-error",
    ];

    const toSerializable = (value) => {
      try {
        return JSON.parse(JSON.stringify(value));
      } catch {
        return String(value);
      }
    };

    window.__rdfDebug = {
      events: [],
      windowErrors: [],
      rejections: [],
    };

    for (const eventName of eventNames) {
      window.addEventListener(
        eventName,
        (event) => {
          window.__rdfDebug.events.push({
            name: eventName,
            detail: toSerializable(event.detail),
            targetTag:
              event.target && event.target.tagName
                ? event.target.tagName
                : null,
            time: Date.now(),
          });
        },
        true,
      );
    }

    window.addEventListener("error", (event) => {
      window.__rdfDebug.windowErrors.push({
        message: event.message,
        source: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      });
    });

    window.addEventListener("unhandledrejection", (event) => {
      const reason = event.reason;
      window.__rdfDebug.rejections.push({
        message: reason && reason.message ? reason.message : String(reason),
      });
    });
  });

  page.on("console", (msg) => {
    const location = msg.location();
    consoleMessages.push({
      type: msg.type(),
      text: msg.text(),
      url: location.url || null,
      lineNumber: location.lineNumber || null,
      columnNumber: location.columnNumber || null,
    });
  });

  page.on("pageerror", (error) => {
    pageErrors.push({
      message: error.message,
      stack: error.stack,
    });
  });

  page.on("request", (request) => {
    if (isRelevantUrl(request.url())) {
      requests.push({
        url: request.url(),
        method: request.method(),
        resourceType: request.resourceType(),
      });
    }
  });

  page.on("response", async (response) => {
    if (!isRelevantUrl(response.url())) {
      return;
    }

    responses.push({
      url: response.url(),
      status: response.status(),
      ok: response.ok(),
      contentType: response.headers()["content-type"] || null,
    });
  });

  page.on("requestfailed", (request) => {
    requestFailures.push({
      url: request.url(),
      method: request.method(),
      resourceType: request.resourceType(),
      errorText: request.failure() ? request.failure().errorText : null,
    });
  });

  await page.goto("http://localhost:3000/playground/", {
    waitUntil: "domcontentloaded",
  });
  await page.waitForLoadState("networkidle");

  const iframe = page.locator('iframe[title="CSS Attribute Selector"]');
  await expect(iframe).toBeVisible();

  const iframeHandle = await iframe.elementHandle();
  const frame = await iframeHandle.contentFrame();
  if (!frame) {
    throw new Error("Unable to resolve first playground iframe");
  }

  await frame.waitForLoadState("domcontentloaded");
  await frame.waitForFunction(
    () => {
      const debug = window.__rdfDebug;
      const link = document.querySelector('a[href$="books.ttl"]');
      return !!debug && !!link;
    },
    { timeout: 10000 },
  );

  await frame
    .waitForFunction(
      () => {
        const debug = window.__rdfDebug;
        if (!debug) {
          return false;
        }
        return debug.events.some(
          (event) =>
            event.name === "orchestrator-link-ready" ||
            event.name === "orchestrator-link-error" ||
            event.name === "render-complete" ||
            event.name === "render-error" ||
            event.name === "shape-error" ||
            event.name === "triplestore-error",
        );
      },
      { timeout: 10000 },
    )
    .catch(() => null);

  await iframe.screenshot({
    path: "playwright-artifacts/playground-css-selector.png",
  });

  const frameReport = await frame.evaluate(() => {
    const link = document.querySelector('a[href$="books.ttl"]');
    const otherLink = document.querySelector('a[href$="people.ttl"]');
    const host = document.querySelector(".orchestrated-link-host");
    const display = host ? host.querySelector("lens-display") : null;
    const lens = host ? host.querySelector("rdf-lens") : null;
    const adapter = host ? host.querySelector("rdf-adapter") : null;

    const attrMap = (element) => {
      if (!element) {
        return null;
      }
      return Object.fromEntries(
        Array.from(element.attributes).map((attr) => [attr.name, attr.value]),
      );
    };

    const serializeElement = (element) => {
      if (!element) {
        return null;
      }
      return {
        tag: element.tagName,
        attrs: attrMap(element),
        text: element.textContent,
        outerHTML: element.outerHTML.slice(0, 2000),
      };
    };

    return {
      locationHref: window.location.href,
      debug: window.__rdfDebug,
      booksLink: serializeElement(link),
      peopleLink: serializeElement(otherLink),
      host: serializeElement(host),
      display: serializeElement(display),
      lens: serializeElement(lens),
      adapter: serializeElement(adapter),
      bodyText: document.body.innerText,
    };
  });

  const report = {
    frameReport,
    consoleMessages,
    pageErrors,
    requests,
    responses,
    requestFailures,
  };

  fs.mkdirSync(path.join(process.cwd(), "playwright-artifacts"), {
    recursive: true,
  });
  fs.writeFileSync(
    path.join(
      process.cwd(),
      "playwright-artifacts",
      "playground-css-selector-report.json",
    ),
    JSON.stringify(report, null, 2),
    "utf8",
  );

  console.log(JSON.stringify(report, null, 2));
});
