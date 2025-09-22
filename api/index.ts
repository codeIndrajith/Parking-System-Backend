import type { VercelRequest, VercelResponse } from "@vercel/node";
import serverless from "serverless-http";
import app from "../src/index";

// Wrap Express in serverless handler
const handler = serverless(app);

export default (req: VercelRequest, res: VercelResponse) => {
  return handler(req, res);
};
