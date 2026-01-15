/**
 * MSW browser worker setup
 * This is used for e2e testing with Playwright
 */

import { setupWorker } from "msw/browser";
import { handlers } from "./handlers";

export const worker = setupWorker(...handlers);
