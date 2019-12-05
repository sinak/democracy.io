import React from "react";
import Form from "./index";
import * as FormStateSessionStorage from "./FormStateSessionStorage";
import { MemoryRouter } from "react-router-dom";
import { render, waitForDomChange, wait } from "@testing-library/react";
import {
  messageSenderAddressFixture,
  axiosResponseFixture,
  legislatorContactFixture
} from "../../../server/src/fixtures";

jest.mock("./../DioAPI");
import * as DioAPI from "./../DioAPI";
import { mocked } from "ts-jest/utils";
const mockedAPI = mocked(DioAPI);

afterEach(() => {
  FormStateSessionStorage.clearSessionStorage();
});

let defaultFormState = {
  addressInputFields: {
    streetAddress: "",
    city: "",
    zipCode: ""
  },
  messageSenderAddress: undefined,
  messageResponses: [],
  legislatorContacts: [],
  selectedBioguides: []
};

describe("route /message", () => {
  test("redirects to address form if missing address", () => {
    FormStateSessionStorage.setSessionStorage(defaultFormState);

    const { getByLabelText } = render(
      <MemoryRouter initialEntries={["/message"]}>
        <Form />
      </MemoryRouter>
    );

    getByLabelText("Street Address");
    getByLabelText("City");
    getByLabelText("Zip Code");
  });

  test("redirects to legislator picker if no legislators selected", () => {
    FormStateSessionStorage.setSessionStorage({
      ...defaultFormState,
      messageSenderAddress: messageSenderAddressFixture(),
      legislatorContacts: [legislatorContactFixture()],
      selectedBioguides: []
    });

    const { getByText } = render(
      <MemoryRouter initialEntries={["/message"]}>
        <Form />
      </MemoryRouter>
    );

    getByText(/Choose which representatives you'd like to write to/);
  });

  test("redirects to legislator picker if legislator data is not loaded", async () => {
    FormStateSessionStorage.setSessionStorage({
      ...defaultFormState,
      messageSenderAddress: messageSenderAddressFixture(),
      legislatorContacts: [],
      selectedBioguides: []
    });

    mockedAPI.getDistrictLegislators.mockResolvedValue({
      config: {},
      status: 200,
      statusText: "",
      headers: {},
      data: {
        status: "success",
        data: [legislatorContactFixture()]
      }
    });

    const { getByText } = render(
      <MemoryRouter initialEntries={["/message"]}>
        <Form />
      </MemoryRouter>
    );

    await wait(() =>
      getByText(/Choose which representatives you'd like to write to/)
    );
  });
});

describe("route /pick-legislators", () => {
  test("route /pick-legislators should redirect to address form if address hasn't been verified", async () => {
    FormStateSessionStorage.setSessionStorage(defaultFormState);

    const { getByLabelText } = render(
      <MemoryRouter initialEntries={["/pick-legislators"]}>
        <Form />
      </MemoryRouter>
    );

    getByLabelText("Street Address");
    getByLabelText("City");
    getByLabelText("Zip Code");
  });
});
