const LegislatorSearch = require("./LegislatorsSearch");

/** @type {DIO.Legislator[]} */
const legislatorsFixture = [
  // reps
  {
    bioguideId: "1",
    chamber: "house",
    district: 1,
    firstName: "First",
    lastName: "Last",
    state: "CA",
    title: "Rep"
  },
  {
    bioguideId: "2",
    chamber: "house",
    district: 2,
    firstName: "First",
    lastName: "Last",
    state: "CA",
    title: "Rep"
  },

  // senators
  {
    bioguideId: "3",
    chamber: "senate",
    district: null,
    firstName: "First",
    lastName: "Last",
    state: "CA",
    title: "Sen"
  },
  {
    bioguideId: "4",
    chamber: "senate",
    district: null,
    firstName: "First",
    lastName: "Last",
    state: "CA",
    title: "Sen"
  }
];

test("findLegislators should return the state's senators and the district's reps", () => {
  const c = new LegislatorSearch();
  c.loadLegislators(legislatorsFixture);

  const legislators = c.findLegislators("CA", 1);
  const ids = legislators.map(l => l.bioguideId);

  expect(ids.length).toBe(3);
  expect(ids).toEqual(expect.arrayContaining(["1", "3", "4"]));
});

test("getLegislatorByID should find legislators by ID", () => {
  const c = new LegislatorSearch();
  c.loadLegislators(legislatorsFixture);

  let fixture = legislatorsFixture[0];
  const legislator = c.getLegislatorByID(fixture.bioguideId);
  expect(legislator).toBe(fixture);
});

test("validDistrict should validate a state and district", () => {
  const c = new LegislatorSearch();
  c.loadLegislators(legislatorsFixture);

  expect(c.validDistrict("invalid", -1)).toBe(false);
  expect(c.validDistrict("CA", -1)).toBe(false);
  expect(c.validDistrict("invalid", 1)).toBe(false);
  // @ts-ignore
  expect(c.validDistrict("invalid", 1)).toBe(false);

  expect(c.validDistrict("CA", 1)).toBe(true);
});

test("loadLegislators should replace the cached legislators", () => {
  const c = new LegislatorSearch();
  c.loadLegislators(legislatorsFixture);

  /** @type {DIO.Legislator} */
  const replacementFixture = {
    bioguideId: "replaced",
    chamber: "senate",
    firstName: "",
    lastName: "",
    district: null,
    state: "AZ",
    title: "Sen"
  };
  c.loadLegislators([replacementFixture]);

  // replaced fixture
  expect(c.getLegislatorByID(replacementFixture.bioguideId)).toEqual(
    replacementFixture
  );
  expect(c.findLegislators(replacementFixture.state, 1)).toEqual(
    expect.arrayContaining([replacementFixture])
  );

  // old fixtures
  expect(c.getLegislatorByID(legislatorsFixture[0].bioguideId)).toBeUndefined();

  expect(
    c.findLegislators(
      legislatorsFixture[0].state,
      legislatorsFixture[0].district
    )
  ).toHaveLength(0);
});
