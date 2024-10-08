// /lib/auth.ts
import { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET as string;

export const authenticate =
  (handler: any) => async (req: NextApiRequest, res: NextApiResponse) => {
    const token = req.headers["x-auth-token"] as string;

    if (!token) {
      return res.status(401).json({ msg: "No token, authorization denied" });
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      (req as any).user = decoded;
      return handler(req, res);
    } catch (err) {
      return res.status(401).json({ msg: "Token is not valid" });
    }
  };
