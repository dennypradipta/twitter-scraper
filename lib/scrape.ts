import d from "debug";
import parse, { HTMLElement } from "node-html-parser";
import puppeteer from "puppeteer";
import { Meta } from "../interfaces/meta";

interface ScrapeData {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
  site_name?: string;
}

const readMT = (el: HTMLElement, name: string) => {
  let prop = el.getAttribute("name") || el.getAttribute("property");
  return prop == name ? el.getAttribute("content") : null;
};

export async function scrape(url: string): Promise<Meta | null> {
  // Validate URL
  if (!/(^http(s?):\/\/[^\s$.?#].[^\s]*)/i.test(url)) return null;

  // Run Puppeteer to get the website content
  const browser = await puppeteer.launch({
    executablePath: "/usr/bin/google-chrome",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();
  await page.setJavaScriptEnabled(true);
  await page.goto(url);
  await page.waitForSelector(`article`);

  // Get the head and body element from the page
  const [head, body] = await page.evaluate(() => {
    return [
      document.querySelector("head").innerHTML,
      document.querySelector("body").innerHTML,
    ];
  });

  // Parse the head element
  const parsedHead = parse(head);
  // Parse the body element
  const parsedBody = parse(body);

  // Scrape the HTML
  const og: ScrapeData = {};
  const meta: ScrapeData = {};
  const images = [];

  // Scrape the page title
  const title = parsedHead.querySelector("title");
  if (title) meta.title = title.text;

  // Scrape the page canonical
  const canonical = parsedHead.querySelector("link[rel=canonical]");
  if (canonical) {
    meta.url = canonical.getAttribute("href");
  }

  // Scrape the meta tags
  const metas = parsedHead.querySelectorAll("meta");
  for (const meta of metas) {
    ["title", "description", "image"].forEach((s) => {
      const val = readMT(meta, s);
      if (val) meta[s] = val;
    });

    [
      "og:title",
      "og:description",
      "og:image",
      "og:url",
      "og:site_name",
      "og:type",
    ].forEach((s) => {
      const val = readMT(meta, s);
      if (val) og[s.split(":")[1]] = val;
    });
  }

  // Scrape the images
  parsedBody.querySelectorAll("img").forEach((meta) => {
    let src: string = meta.getAttribute("src");
    if (src) {
      src = new URL(src, url).href;
      images.push({ src });
    }
  });

  d("scraper:scraper")(JSON.stringify({ meta, og, images }));

  // Return the results
  return { meta, og, images };
}
