import d from "debug";
import dotenv from "dotenv";
import { performance } from "perf_hooks";
import { draw } from "./lib/draw";

import { scrape } from "./lib/scrape";

dotenv.config();

(async () => {
  d("scraper:main")("Starting main");
  const mainStartTime = performance.now();

  d("scraper:scraper")("Starting scraper...");
  const scraperStartTime = performance.now();
  const result = await scrape(process.env.TWEET_URL);
  const scraperEndTime = performance.now();
  d("scraper:scraper")(
    `Scraper took ${scraperEndTime - scraperStartTime} milliseconds`
  );

  if (!result) {
    console.info("No metadata available");
    process.exit(1);
  }

  d("scraper:canvas")("Starting canvas");
  const startTime = performance.now();
  await draw(result);
  const endTime = performance.now();
  d("scraper:canvas")(`Canvas took ${endTime - startTime} milliseconds`);

  const mainEndTime = performance.now();
  d("scraper:main")(`Main took ${mainEndTime - mainStartTime} milliseconds`);
  process.exit(0);
})();
