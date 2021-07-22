import * as Sentry from "@sentry/node";
import { CaptureConsole } from "@sentry/integrations";

const { SENTRY_DSN } = process.env;

export function initSentry() {
  if (SENTRY_DSN) {
    Sentry.init({
      dsn: SENTRY_DSN,
      integrations: [new CaptureConsole({ levels: ["error"] })]
    });
    return Sentry;
  }
  return null;
}
