import * as FormStateSessionStorage from "./FormStateSessionStorage";
import {
  messageSenderAddressFixture,
  legislatorRepFixture,
  legislatorSenatorFixture
} from "../TestUtils/Fixtures";
test("it should work", () => {
  let data: FormStateSessionStorage.StoredFormState = {
    addressInputFields: {
      city: "",
      streetAddress: "",
      zipCode: ""
    },
    messageSenderAddress: messageSenderAddressFixture(),
    legislators: [
      legislatorRepFixture({ bioguideId: "123" }),
      legislatorSenatorFixture({ bioguideId: "234" })
    ],
    selectedBioguides: ["123", "234"]
  };

  FormStateSessionStorage.setSessionStorage(data);
  expect(FormStateSessionStorage.getSessionStorage()).toStrictEqual(data);
});
