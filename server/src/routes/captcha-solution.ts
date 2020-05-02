import * as PotcAPI from "./../services/PotcAPI";
import { Router } from "express";

const expressRouter = Router();

expressRouter.post("/captcha-solution", async (req, res) => {
  try {
    const solveCaptchaRes = await PotcAPI.fillOutCaptcha(req.body);
    res.json(solveCaptchaRes.data);
  } catch (err) {
    res.status(504).json({
      error: "Request failed"
    });
  }
});

export default expressRouter;
