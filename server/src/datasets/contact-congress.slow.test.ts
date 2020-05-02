import { fetch, filterSenators } from "./contact-congress";
import { InputStep } from "./contact-congress-types";
import _ from "lodash";
import { fetch as fetchCongressLegislators } from "./congress-legislators";
import { fstat, writeFileSync } from "fs";

test("smoke test", async () => {
  const members = await fetch();
  expect(members.length).toBeGreaterThan(1);
  expect(members[0]).toHaveProperty("bioguide");
  expect(members[0]).toHaveProperty("contact_form.steps");

  const dioLegislators = await fetchCongressLegislators();

  let memberTopicInputs: { bioguideId: string; input: InputStep }[] = [];
  const senators = filterSenators(members, dioLegislators);

  for (let senator of senators) {
    let inputSteps: InputStep[] = [];
    for (let step of senator.contact_form.steps) {
      if ("fill_in" in step) {
        inputSteps.push(...step.fill_in);
      } else if ("select" in step) {
        inputSteps.push(...step.select);
      }
    }
    memberTopicInputs.push({
      bioguideId: senator.bioguide,
      input: inputSteps.filter(i => i.value === "$TOPIC")[0]
    });
  }
});
