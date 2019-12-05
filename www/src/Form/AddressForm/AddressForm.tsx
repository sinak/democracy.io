import classNames from "classnames";
import React, { FormEvent, useState, useEffect } from "react";
import { Redirect } from "react-router-dom";
import { MessageSenderAddress } from "../../../../server/src/Models";
import LoadingState from "../../AsyncUtils/LoadingState";
import Whitebox from "../Whitebox";
import { verifyAddress } from "../../DioAPI";
import { ReactComponent as EFFLogoSVG } from "./EFF_Logo.svg";
import { CSSTransition } from "react-transition-group";

interface AddressInputFields {
  streetAddress: string;
  city: string;
  zipCode: string;
}

interface AddressFormProps {
  initialAddressInputFields: AddressInputFields;
  onAddressInputFieldsChange: (fields: AddressInputFields) => void;
  onSuccessfulAddress: (address: MessageSenderAddress) => void;
}

export default function AddressForm(props: AddressFormProps) {
  const [
    canonicalAddressLoadingState,
    setCanonicalAddressLoadingState
  ] = useState(LoadingState.Ready);
  const [
    canonicalAddressErrorMessage,
    setCanonicalAddressErrorMessage
  ] = useState("");

  const [addressInputFields, setAddressInputFields] = useState<
    AddressInputFields
  >(props.initialAddressInputFields);

  const { streetAddress, city, zipCode } = addressInputFields;
  const addressValid = [streetAddress, city, zipCode].every(
    val => val.length > 0
  );

  async function submitAddressForm(e: FormEvent) {
    e.preventDefault();

    setCanonicalAddressLoadingState(LoadingState.Loading);

    try {
      const res = await verifyAddress({
        streetAddress: streetAddress,
        city: city,
        zipCode: zipCode
      });
      props.onSuccessfulAddress(res.data);
      setCanonicalAddressErrorMessage("");
      setCanonicalAddressLoadingState(LoadingState.Success);
    } catch (e) {
      let errorMessage = e.res
        ? e.res.data.message
        : "There appears to be a problem with the server. Please try again, " +
          "and if the problem persists, email contact@democracy.io with the " +
          "address you used so we can try and fix the issue.";
      setCanonicalAddressErrorMessage(errorMessage);
      setCanonicalAddressLoadingState(LoadingState.Error);
    }
  }

  useEffect(() => {
    props.onAddressInputFieldsChange(addressInputFields);
  }, [addressInputFields]);

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
                  <label className="label-styled" htmlFor="street-address">
                    Street Address
                  </label>
                  <input
                    id="street-address"
                    name="address-line1"
                    type="text"
                    defaultValue={streetAddress}
                    onChange={e =>
                      setAddressInputFields({
                        ...addressInputFields,
                        streetAddress: e.target.value
                      })
                    }
                    placeholder="1600 Pennsylvania Ave"
                    autoComplete="address-line1"
                    className="form-control form-control-lg"
                  />
                </div>
                <div className="row">
                  <div className="col-sm-8">
                    <div className="form-group mb-0">
                      <label className="label-styled" htmlFor="city">
                        City
                      </label>
                      <input
                        id="city"
                        name="address-level2"
                        type="text"
                        defaultValue={city}
                        onChange={e =>
                          setAddressInputFields({
                            ...addressInputFields,
                            city: e.target.value
                          })
                        }
                        placeholder="Washington, DC"
                        autoComplete="address-level2"
                        className="form-control form-control-lg"
                      />
                    </div>
                  </div>
                  <div className="col-sm-4">
                    <div className="form-group mb-0">
                      <label className="label-styled" htmlFor="zipCode">
                        Zip Code
                      </label>
                      <input
                        id="zipCode"
                        type="text"
                        defaultValue={zipCode}
                        onChange={e =>
                          setAddressInputFields({
                            ...addressInputFields,
                            zipCode: e.target.value
                          })
                        }
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
