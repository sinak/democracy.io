const CongressLegislatorsCache = require("./../../server/services/CongressLegislators/CongressLegislatorsCache");
const expect = require("chai").expect;

/** @type {Congress.Legislator[]} */
const legislatorsFixture = [
  // reps
  {
    bioguideId: "1",
    chamber: "house",
    district: "1",
    firstName: "First",
    lastName: "Last",
    state: "CA",
    title: "Rep"
  },
  {
    bioguideId: "2",
    chamber: "house",
    district: "2",
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

it("findLegislatorsByDistrict should find legislators by district", function() {
  const c = new CongressLegislatorsCache();
  c.importLegislators(legislatorsFixture);

  const legislators = c.findLegislatorsByDistrict("CA", "1");
  const ids = legislators.map(l => l.bioguideId);

  expect(ids.length).to.equal(3);
  expect(ids).to.have.members(["1", "3", "4"]);
});

it("getLegislatorByID should find legislators by ID", function() {
  const c = new CongressLegislatorsCache();
  c.importLegislators(legislatorsFixture);

  let fixture = legislatorsFixture[0];
  const legislator = c.getLegislatorByID(fixture.bioguideId);
  expect(legislator).to.equal(fixture);
});

it("validDistrict should validate a state and district", function() {
  const c = new CongressLegislatorsCache();
  c.importLegislators(legislatorsFixture);

  expect(c.validDistrict("invalid", "invalid")).to.equal(false);
  expect(c.validDistrict("CA", "1")).to.equal(true);
});

it("importLegislators should replace the cached legislators", function() {
  const c = new CongressLegislatorsCache();
  c.importLegislators(legislatorsFixture);

  /** @type {Congress.Legislator} */
  const replacementFixture = {
    bioguideId: "replaced",
    chamber: "senate",
    firstName: "",
    lastName: "",
    district: null,
    state: "AZ",
    title: "Sen"
  };
  c.importLegislators([replacementFixture]);

  // replaced fixture
  expect(c.getLegislatorByID(replacementFixture.bioguideId)).to.contain(
    replacementFixture
  );
  expect(c.findLegislatorsByDistrict(replacementFixture.state, "1")).to.contain(
    replacementFixture
  );

  // old fixtures
  expect(c.getLegislatorByID(legislatorsFixture[0].bioguideId)).to.be.undefined;

  expect(
    c.findLegislatorsByDistrict(
      legislatorsFixture[0].state,
      legislatorsFixture[0].district
    )
  ).to.be.empty;
});
