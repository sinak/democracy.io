import React, { useState } from "react";
import { Redirect, Route, Switch, useLocation } from "react-router-dom";
import { CSSTransition, SwitchTransition } from "react-transition-group";
import { CanonicalAddress, Legislator } from "./../../server/Models";
import AddressForm from "./FormComponents/AddressForm";
import FormProgress from "./FormComponents/FormProgress";
import LegislatorPickerForm from "./FormComponents/LegislatorPickerForm";
import MessageForm from "./FormComponents/MessageForm";
import LoadingState from "./LoadingState";
import { getDistrictLegislators } from "./DioAPI";
import { ReactComponent as EFFLogoSVG } from "./svg/EFF_Logo.svg";

const Form: React.FC = () => {
  // address form
  const [streetAddress, setStreetAddress] = useState("");
  const [city, setCity] = useState("");
  const [zipCode, setZipCode] = useState("");

  // canonical address
  const [canonicalAddress, setCanonicalAddress] = useState<CanonicalAddress>();

  // legislator picker
  // fetching is handled in this component since others depend on the data
  const [legislators, setLegislators] = useState<Legislator[]>([]);
  const [legislatorLoadingState, setLegislatorsLoadingState] = useState(
    LoadingState.Ready
  );

  const [selectedBioguides, setSelectedBioguides] = useState<
    Legislator["bioguideId"][]
  >([]);

  async function fetchLegislators(canonicalAddress: CanonicalAddress) {
    setLegislatorsLoadingState(LoadingState.Loading);

    try {
      const legislatorsRes = await getDistrictLegislators({
        district: canonicalAddress.district,
        state: canonicalAddress.components.stateAbbreviation
      });

      const nextLegislators: Legislator[] = legislatorsRes.data.data;
      setLegislators(nextLegislators);
      setSelectedBioguides(
        nextLegislators
          .filter(l => l.formStatus === "ok")
          .map(l => l.bioguideId)
      );
      setLegislatorsLoadingState(LoadingState.Success);
    } catch (e) {
      setLegislatorsLoadingState(LoadingState.Error);
      // TODO: show error message
    }
  }

  function onSuccessfulAddress(canonicalAddress: CanonicalAddress) {
    setCanonicalAddress(canonicalAddress);
    fetchLegislators(canonicalAddress);
  }

  let location = useLocation();

  return (
    <div>
      <FormProgress />
      <div className="container">
        <SwitchTransition>
          <CSSTransition
            appear={true}
            key={location.key ? location.key : "/"}
            timeout={1000}
            classNames="whitebox"
          >
            <Switch location={location}>
              <Route exact path="/">
                <AddressForm
                  onSuccessfulAddress={onSuccessfulAddress}
                  onStreetAddressChange={setStreetAddress}
                  onCityChange={setCity}
                  onZipCodeChange={setZipCode}
                  streetAddress={streetAddress}
                  city={city}
                  zipCode={zipCode}
                />
                <div
                  className="text-uppercase text-center"
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
                    <a href="https://eff.org">Electronic Frontier Foundation</a>{" "}
                    now maintained by{" "}
                    <a href="https://taskforce.is">Taskforce.is</a>
                  </span>
                </div>
              </Route>

              <Route exact path="/pick-legislators">
                {canonicalAddress ? (
                  <LegislatorPickerForm
                    legislators={legislators}
                    legislatorsLoadingState={legislatorLoadingState}
                    selectedBioguides={selectedBioguides}
                    onSubmit={selectedBioguides =>
                      setSelectedBioguides(selectedBioguides)
                    }
                  />
                ) : (
                  <Redirect to="/" />
                )}
              </Route>

              <Route
                exact
                path="/message"
                render={routeProps => {
                  if (canonicalAddress === undefined) {
                    return <Redirect to="/" />;
                  } else if (
                    (legislators.length === 0, selectedBioguides.length === 0)
                  ) {
                    return <Redirect to="/pick-legislators" />;
                  } else {
                    return (
                      <MessageForm
                        canonicalAddress={canonicalAddress}
                        selectedBioguides={selectedBioguides}
                        legislators={legislators}
                      />
                    );
                  }
                }}
              />
            </Switch>
          </CSSTransition>
        </SwitchTransition>
      </div>
    </div>
  );
};

export default Form;
