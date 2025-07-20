// src/middleware/cors.ts
import { NextApiRequest, NextApiResponse } from "next";

export function cors(
  req: NextApiRequest,
  res: NextApiResponse,
  next: () => void,
) {
  const allowedOrigins = [
    "http://localhost:3002",
    "http://rubujakcyp.online:3002",
    "https://nfc-custom-domain.vercel.app",
    "https://rubujakcyp.online",
  ];
  const origin = req.headers.origin || "";
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  } else {
    res.setHeader("Access-Control-Allow-Origin", "*");
  }
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }
  next();
}
