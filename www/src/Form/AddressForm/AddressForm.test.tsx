import React from "react";
import AddressForm from "./AddressForm";
import { render, fireEvent, wait } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import { mocked } from "ts-jest/utils";

jest.mock("./../../DioAPI");
import * as DioAPI from "../../DioAPI";
import { MemoryRouter } from "react-router";
import {
  axiosResponseFixture,
  messageSenderAddressFixture
} from "../../TestUtils/Fixtures";
const mockedAPI = mocked(DioAPI);

test("when submitted, it should make an HTTP request to the API /location/verify", () => {
  let senderAddress = messageSenderAddressFixture();

  const mockedReq = mockedAPI.verifyAddress.mockResolvedValueOnce(
    axiosResponseFixture({
      status: 200,
      data: {
        status: "success",
        data: [senderAddress]
      }
    })
  );

  const { getByTestId } = render(
    <AddressForm
      onSuccessfulAddress={successfulAddress => {}}
      initialAddressInputFields={{
        city: "city",
        streetAddress: "address",
        zipCode: "zip"
      }}
      onAddressInputFieldsChange={() => {}}
    />,
    {
      wrapper: MemoryRouter
    }
  );
  const el = getByTestId("address-form-submit");
  fireEvent.click(el);

  wait(() => {
    expect(mockedReq).toHaveBeenCalled();
  });
});

test("submit button should be disabled unless all fields are filled", async () => {
  const { getByTestId, getByLabelText, debug } = render(
    <AddressForm
      initialAddressInputFields={{ city: "", streetAddress: "", zipCode: "" }}
      onAddressInputFieldsChange={() => {}}
      onSuccessfulAddress={() => {}}
    />
  );

  const submitButton = getByTestId("address-form-submit");
  expect(submitButton).toHaveAttribute("disabled");

  const streetAddressInput = getByLabelText(
    "Street Address"
  ) as HTMLInputElement;
  const cityInput = getByLabelText("City") as HTMLInputElement;
  const zipInput = getByLabelText("Zip Code") as HTMLInputElement;

  streetAddressInput.value = "test";
  fireEvent.change(streetAddressInput);
  await wait(() => {
    expect(submitButton).toHaveAttribute("disabled");
  });

  cityInput.value = "test";
  fireEvent.change(cityInput);
  await wait(() => {
    expect(submitButton).toHaveAttribute("disabled");
  });

  zipInput.value = "test";
  fireEvent.change(zipInput);
  await wait(() => {
    expect(submitButton).toBeEnabled();
  });
  debug()
});

test.todo("it should display error messages");
