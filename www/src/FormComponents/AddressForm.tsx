import classNames from "classnames";
import React, { FormEvent, useState } from "react";
import { Redirect } from "react-router-dom";
import { CanonicalAddress } from "../../../server/Models";
import LoadingState from "../LoadingState";
import Whitebox from "./Whitebox";
import { verifyAddress } from "../DioAPI";
import { ReactComponent as EFFLogoSVG } from "./../svg/EFF_Logo.svg";
import { CSSTransition } from "react-transition-group";

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
      <Whitebox id="address" footer={whiteboxFooter} showBackButton={false}>
        {canonicalAddressLoadingState === LoadingState.Success ? (
          <Redirect push to="/pick-legislators" />
        ) : null}

        <form onSubmit={submitAddressForm}>
          <CSSTransition
            timeout={500}
            in={addressValid}
            appear={true}
            classNames="addressValid"
          >
            <div style={{ overflow: "hidden", whiteSpace: "nowrap" }}>
              <div id="addressInputs" className="d-inline-block">
                <div className="form-group">
                  <label className="label-styled">Street Address</label>
                  <input
                    name="address-line1"
                    type="text"
                    defaultValue={props.streetAddress}
                    onChange={e => props.onStreetAddressChange(e.target.value)}
                    placeholder="1600 Pennsylvania Ave"
                    autoComplete="address-line1"
                    className="form-control form-control-lg"
                  />
                </div>
                <div className="row">
                  <div className="col-sm-8">
                    <div className="form-group mb-0">
                      <label className="label-styled">City</label>
                      <input
                        name="address-level2"
                        type="text"
                        defaultValue={props.city}
                        onChange={e => props.onCityChange(e.target.value)}
                        placeholder="Washington, DC"
                        autoComplete="address-level2"
                        className="form-control form-control-lg"
                      />
                    </div>
                  </div>
                  <div className="col-sm-4">
                    <div className="form-group mb-0">
                      <label className="label-styled">Zip Code</label>
                      <input
                        type="text"
                        defaultValue={props.zipCode}
                        onChange={e => props.onZipCodeChange(e.target.value)}
                        placeholder="20500"
                        autoComplete="postal-code"
                        className="form-control form-control-lg"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div
                id="submitAddress"
                className={classNames("d-inline-block pl-md-4 mt-4 mt-lg-0", {
                  addressValid: addressValid
                })}
                style={{ verticalAlign: "bottom" }}
              >
                <button
                  className="btn btn-lg btn-block btn-outline-primary bounce-to-right"
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
          </CSSTransition>

          <div
            style={{
              display:
                canonicalAddressLoadingState === LoadingState.Error
                  ? "block"
                  : "none"
            }}
          >
            <div className="alert alert-danger mt-4 mb-0" role="alert">
              {canonicalAddressErrorMessage}
            </div>
          </div>
        </form>
      </Whitebox>

      <div
        className="text-uppercase text-center my-3"
        style={{ fontSize: 10, letterSpacing: 1 }}
      >
        <span className="d-none d-sm-block">
          Originally built by{" "}
          <a href="https://eff.org" className="img-link">
            <EFFLogoSVG width={40} />
          </a>{" "}
          now maintained by{" "}
          <u>
            <a href="https://taskforce.is">Taskforce.is</a>
          </u>
        </span>
        <span className="d-sm-none">
          Originally built by{" "}
          <a href="https://eff.org">Electronic Frontier Foundation</a> now
          maintained by <a href="https://taskforce.is">Taskforce.is</a>
        </span>
      </div>
    </div>
  );
}
