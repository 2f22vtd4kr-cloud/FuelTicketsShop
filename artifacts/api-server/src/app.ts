import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import { rateLimit } from "express-rate-limit";
import router from "./routes";
import { logger } from "./lib/logger";

const IS_DEV = process.env.NODE_ENV !== "production";

const ALLOWED_ORIGINS = [
  "https://web.telegram.org",
  "https://webk.telegram.org",
  "https://webz.telegram.org",
];

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  })
);

// CORS — open in dev, restricted to Telegram origins in production
app.use(
  cors({
    origin: IS_DEV
      ? true
      : (origin, callback) => {
          if (!origin || ALLOWED_ORIGINS.some((o) => origin.startsWith(o))) {
            callback(null, true);
          } else {
            callback(new Error("Not allowed by CORS"));
          }
        },
    credentials: true,
  })
);

// General rate limit: 200 req/min per IP
app.use(
  "/api",
  rateLimit({
    windowMs: 60_000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many requests, please slow down" },
    skip: () => IS_DEV,
  })
);

// Strict limit for payment creation: 15 req/min per IP
app.use(
  "/api/payments/create-order",
  rateLimit({
    windowMs: 60_000,
    max: 15,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Слишком много платёжных запросов, подождите минуту" },
    skip: () => IS_DEV,
  })
);

// Capture raw body for CryptoBot webhook HMAC verification before JSON parsing
app.use(
  express.json({
    verify: (req: any, _res, buf) => {
      req.rawBody = buf;
    },
  })
);
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

export default app;
