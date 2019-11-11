import React from "react";
import AddressForm from "./AddressForm";
import { render } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";

test("when submitted, it should make an HTTP request to the API /location/verify", () => {
  const { getByTestId } = render(<AddressForm />);
  getByTestId("address-form-submit");
});

test("submit button should be disabled unless all fields are filled", () => {
  const { getByTestId, debug } = render(<AddressForm />);
  debug();
  expect(getByTestId("address-form-submit")).toHaveAttribute("disabled");
});

test("it should display error messages");
