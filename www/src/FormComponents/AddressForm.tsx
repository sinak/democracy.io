import React, { useState, FormEvent } from "react";
import LoadingState from "../LoadingState";
import { CanonicalAddress } from "../../../server/Models";
import classNames from "classnames";
import { Redirect } from "react-router-dom";
import Whitebox from "./Whitebox";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import "./AddressForm.scss";

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
    <a href="https://smartystreets.com/" target="_blank">
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
      const combinedAddress = `${props.streetAddress} ${props.city} ${props.zipCode}`;
      const addressRes = await fetch(
        `http://localhost:3000/api/1/location/verify?address=${combinedAddress}`
      );
      const json = await addressRes.json();
      const candidates: CanonicalAddress[] = json.data;

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
    <Whitebox
      id="address"
      className="col-sm-11 col-md-8 col-lg-7"
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
              <label>Street Address</label>
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
                  <label>City</label>
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
                  <label>Zip Code</label>
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
  );
}
