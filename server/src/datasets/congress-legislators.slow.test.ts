import { fetch } from "./congress-legislators";

test("smoke test", async () => {
  const legislators = await fetch();
  expect(legislators.length).toBeGreaterThan(1);
  expect(legislators[0]).toHaveProperty("bioguideId");
});
