import classNames from "classnames";
import React, { FormEvent, useState } from "react";
import { Redirect } from "react-router-dom";
import { CanonicalAddress } from "../../../server/Models";
import LoadingState from "../LoadingState";
import Whitebox from "./Whitebox";
import { verifyAddress } from "../DioAPI";

interface AddressFormProps {
  onSuccessfulAddress: (canonicalAddress: CanonicalAddress) => void;
  onStreetAddressChange: (streetAddress: string) => void;
  onCityChange: (streetAddress: string) => void;
  onZipCodeChange: (streetAddress: string) => void;
  streetAddress: string;
  city: string;
  zipCode: string;
}

const whiteboxFooter = (
  <div className="text-center">
    Democracy.io uses the{" "}
    <a
      href="https://smartystreets.com/"
      target="_blank"
      rel="noopener noreferrer"
    >
      SmartyStreets Geocoding API
    </a>{" "}
    to look up your representatives.
  </div>
);

export default function AddressForm(props: AddressFormProps) {
  const [
    canonicalAddressLoadingState,
    setCanonicalAddressLoadingState
  ] = useState(LoadingState.Ready);
  const [
    canonicalAddressErrorMessage,
    setCanonicalAddressErrorMessage
  ] = useState("");

  const addressValid = [props.streetAddress, props.city, props.zipCode].every(
    val => val.length > 0
  );

  async function submitAddressForm(e: FormEvent) {
    e.preventDefault();

    setCanonicalAddressLoadingState(LoadingState.Loading);

    try {
      const res = await verifyAddress({
        streetAddress: props.streetAddress,
        city: props.city,
        zipCode: props.zipCode
      });
      const candidates: CanonicalAddress[] = res.data.data;

      if (candidates.length === 0) {
        setCanonicalAddressLoadingState(LoadingState.Error);
        setCanonicalAddressErrorMessage(
          "Your address was not recognized. Please check the address and try again."
        );
      } else {
        props.onSuccessfulAddress(candidates[0]);
        setCanonicalAddressLoadingState(LoadingState.Success);
        setCanonicalAddressErrorMessage("");
      }
    } catch (e) {
      setCanonicalAddressLoadingState(LoadingState.Error);
      setCanonicalAddressErrorMessage(
        "There is a problem with the service. Please try again later."
      );
    }
  }

  return (
    <div className="col-lg-8 mx-auto">
      <Whitebox
        id="address"
        footer={whiteboxFooter}
        showBackButton={false}
      >
        {canonicalAddressLoadingState === LoadingState.Success ? (
          <Redirect push to="/pick-legislators" />
        ) : null}

        <form onSubmit={submitAddressForm}>
          <div className="clearfix">
            <div
              id="addressInputs"
              className={classNames({
                clearfix: true,
                addressValid: addressValid
              })}
            >
              <div className="form-group">
                <label className="text-dark">Street Address</label>
                <input
                  name="address-line1"
                  type="text"
                  defaultValue={props.streetAddress}
                  onChange={e => props.onStreetAddressChange(e.target.value)}
                  placeholder="1600 Pennsylvania Ave"
                  autoComplete="address-line1"
                  className="form-control input-lg"
                />
              </div>
              <div className="row">
                <div className="col-sm-8">
                  <div className="form-group">
                    <label className="text-dark">City</label>
                    <input
                      name="address-level2"
                      type="text"
                      defaultValue={props.city}
                      onChange={e => props.onCityChange(e.target.value)}
                      placeholder="Washington, DC"
                      autoComplete="address-level2"
                      className="form-control input-lg"
                    />
                  </div>
                </div>
                <div className="col-sm-4">
                  <div className="form-group">
                    <label className="text-dark">Zip Code</label>
                    <input
                      type="text"
                      defaultValue={props.zipCode}
                      onChange={e => props.onZipCodeChange(e.target.value)}
                      placeholder="20500"
                      autoComplete="postal-code"
                      className="form-control input-lg"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div
              id="submitAddress"
              className={classNames({
                clearfix: true,
                addressValid: addressValid
              })}
            >
              <button
                className="btn btn-lg btn-orange"
                type="submit"
                disabled={
                  addressValid === false ||
                  canonicalAddressLoadingState === LoadingState.Loading
                }
                data-testid="address-form-submit"
              >
                Submit
              </button>
            </div>
          </div>

          <div
            className={classNames({
              alert: true,
              "alert-danger": true,
              hidden: canonicalAddressLoadingState !== LoadingState.Error
            })}
          >
            {canonicalAddressErrorMessage}
          </div>
        </form>
      </Whitebox>
    </div>
  );
}
