import { Request, Response, Router } from "express";

import fs from "fs";
import path from "path";

interface Page {
  title: string;
  ref?: string; // if no ref specified, the "page" is just a category; no page route is created
  view?: string;
  dataSources?: Record<string, string>;
  children?: Page[];
}

interface PipedData {
  navItems;
  footer;
  data?;
  title: string;
  ref?: string;
  sources?: Record<string, object | any[] | null>;
  dataEndpoints?: string[];
}

export class PageLoader {
  static navItems = require("../config/navbar.json");
  static footer = require("../config/footer.json");

  static buildRoutes(pageArray: Page[], router: Router) {
    for (const page of pageArray) {
      if (page.ref) {
        router.get(page.ref, async (req: Request, res: Response) => {
          const data: PipedData = {
            navItems: PageLoader.navItems,
            footer: PageLoader.footer,
            data: PageLoader.getPageData(page.ref ?? ""),
            title: page.title,
            ref: page.ref,
          };

          // Load any additional sources of data for the page
          if (page.dataSources) {
            const sources = Object.keys(page.dataSources);
            data.sources = {};
            data.dataEndpoints = [];

            for (const source of sources) {
              data.sources[source] = PageLoader.getPageData(
                `/${page.dataSources[source]}`
              );
              data.dataEndpoints[source] = page.dataSources[source];
            }
          }

          res.render(`pages/${page.view}.pug`, data);
        });
      }

      if (page.children) {
        PageLoader.buildRoutes(page.children, router);
      }
    }
  }

  // require() automatically caches what is retrieved.  This function ensures that cache is erased when relevant.
  static getPageData(pageRef?: string): object | any[] | null {
    if (fs.existsSync(`server/data${pageRef}.json`)) {
      const url = path.join(__dirname, `../../server/data/${pageRef}.json`);
      delete require.cache[url];
      return require(`../data${pageRef}.json`);
    } else {
      return null;
    }
  }
}
