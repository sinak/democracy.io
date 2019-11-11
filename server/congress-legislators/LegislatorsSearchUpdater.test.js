const LegislatorsSearch = require("./LegislatorsSearch");
const LegislatorsSearchUpdater = require("./LegislatorsSearchUpdater");
jest.useFakeTimers();

/** @type {DIO.Senator} */
const senatorFixture = {
  bioguideId: "test bioguide",
  state: "CA",
  district: null,
  firstName: "",
  lastName: "",
  chamber: "senate",
  title: "Sen"
};

test("it should load legislators", async () => {
  const search = new LegislatorsSearch();
  const fixture = {
    ...senatorFixture,
    bioguideId: "1"
  };
  const updaterAdapter = jest.fn().mockResolvedValue([fixture]);
  const updater = new LegislatorsSearchUpdater(search, updaterAdapter);
  await updater.update();
  expect(search.getLegislatorByID("1")).toEqual(fixture);
});

/*
 * need to figure out a better way to test this
 * this does not actually test if the legislators were updated
 * there are currently no fake timer libraries that support running promises
 */
test("it should schedule updates", async () => {
  const search = new LegislatorsSearch();

  const updateAdapter = jest
    .fn()
    .mockResolvedValueOnce([{ ...senatorFixture, bioguideId: "1" }])
    .mockResolvedValueOnce([{ ...senatorFixture, bioguideId: "2" }])
    .mockResolvedValueOnce([{ ...senatorFixture, bioguideId: "3" }])
    .mockResolvedValueOnce([{ ...senatorFixture, bioguideId: "4" }]);

  const updater = new LegislatorsSearchUpdater(search, updateAdapter);
  const scheduler = updater.schedule(1000);

  /**
   * only tests if the adapter was called
   * since fake timers don't wait for the promises to execute,
   * we can't determine if the data was actually updated
   */
  jest.advanceTimersByTime(4000);
  expect(updateAdapter).toHaveBeenCalledTimes(4);
  clearInterval(scheduler);
});
