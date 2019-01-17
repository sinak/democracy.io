const ipThrottle = require("./ip-throttle");
const supertest = require("supertest");

const express = require("express");

describe("ip throttle middleware", () => {
  const mockThrottleAdapter = jest.fn();
  const app = express();
  app.use(ipThrottle.createMiddleware(mockThrottleAdapter));
  app.get("/", (req, res) => {
    res.sendStatus(200);
  });

  test("should send 429 status if throttled", async () => {
    // @ts-ignore
    mockThrottleAdapter.mockResolvedValueOnce(true);
    await supertest(app)
      .get("/")
      .expect(429);
  });

  test("should run the next middleware if not throttled", async () => {
    mockThrottleAdapter.mockResolvedValueOnce(false);
    await supertest(app)
      .get("/")
      .expect(200);
  });
});

describe("ip throttle redis adapter", () => {
  test("it should return false if throttled", async () => {
    const redisAdapter = ipThrottle.createRedisAdapter({
      rate: 1,
      window: 1000,
      expiry: 1000,
      overrides: {}
    });
    const hash = "fake hash";
    const firstCall = await redisAdapter(hash);
    expect(firstCall).toBe(false);
    const shouldBeThrottled = await redisAdapter("fake hash");
    expect(shouldBeThrottled).toBe(true);
  });
});
