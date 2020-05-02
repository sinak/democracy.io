/**
 * Tests for all /api/{version}/location endpoints.
 */

import supertest from "supertest";
import { mocked } from "ts-jest/utils";
import app from "./../app";

import * as PotcAPI from "./../services/PotcAPI";
import { axiosResponseFixture } from "../fixtures";
jest.mock("./../services/PotcAPI");
const mockedPotcAPI = mocked(PotcAPI);

test("sends the captcha solution to PotC", async () => {
  const solution: PotcAPI.FillOutCaptchaBody = {
    answer: "answer",
    uid: "uid",
  };

  const mockedFillOutCaptcha = mockedPotcAPI.fillOutCaptcha.mockResolvedValueOnce(
    {
      ...axiosResponseFixture(),
      data: {
        status: "success",
      },
    }
  );

  const res = await supertest(app)
    .post("/api/captcha-solution")
    .send(solution)
    .expect(200);

  expect(mockedFillOutCaptcha).toHaveBeenCalledWith(solution);
  expect(res.body).toMatchObject({ status: "success" });
});

test("should respond if the PotC API call fails", async () => {
  const solution: PotcAPI.FillOutCaptchaBody = {
    answer: "answer",
    uid: "uid",
  };

  mockedPotcAPI.fillOutCaptcha.mockRejectedValueOnce({});
  const res = await supertest(app).post("/api/captcha-solution").send(solution);

  expect(res.status).toBeGreaterThan(500);
  expect(res.body).toHaveProperty("error");
});
