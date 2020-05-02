import LegislatorSearch from "./LegislatorsSearch";
import { legislatorFixture } from "./../Fixtures";
import { Chamber } from "../models";

const legislatorsFixtures = [
  legislatorFixture({
    bioguideId: "1",
    currentTerm: { state: "CA", chamber: Chamber.House, district: 1 },
  }),
  legislatorFixture({
    bioguideId: "2",
    currentTerm: { state: "CA", chamber: Chamber.House, district: 1 },
  }),
  legislatorFixture({
    bioguideId: "3",
    currentTerm: { state: "CA", chamber: Chamber.Senate },
  }),
  legislatorFixture({
    bioguideId: "different state",
    currentTerm: { state: "AZ", chamber: Chamber.House, district: 1 },
  }),
];

test("findLegislators should return the state's senators and the district's reps", () => {
  const c = new LegislatorSearch();
  c.loadLegislators(legislatorsFixtures);

  const legislators = c.findLegislators("CA", 1);
  const ids = legislators.map((l) => l.bioguideId);

  expect(ids.length).toBe(3);
  expect(ids).toEqual(expect.arrayContaining(["1", "2", "3"]));
});

test("loadLegislators should replace the cached legislators", () => {
  const c = new LegislatorSearch();
  c.loadLegislators(legislatorsFixtures);

  const replacementFixture = legislatorFixture({
    bioguideId: "replaced",
    currentTerm: { state: "GA", chamber: Chamber.Senate },
  });
  c.loadLegislators([replacementFixture]);

  // replaced fixture
  expect(c.getLegislatorByID(replacementFixture.bioguideId)).toEqual(
    replacementFixture
  );
  expect(c.findLegislators(replacementFixture.currentTerm.state, 1)).toEqual(
    expect.arrayContaining([replacementFixture])
  );

  // old fixtures
  expect(
    c.getLegislatorByID(legislatorsFixtures[0].bioguideId)
  ).toBeUndefined();

  expect(
    c.findLegislators(
      legislatorsFixtures[0].currentTerm.state,
      // @ts-ignore
      legislatorsFixtures[0].currentTerm.district!
    )
  ).toHaveLength(0);
});
