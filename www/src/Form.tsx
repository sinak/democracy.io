import React, { useState } from "react";
import { Redirect, Route, Switch, useLocation } from "react-router-dom";
import { CSSTransition, SwitchTransition } from "react-transition-group";
import { CanonicalAddress, Legislator } from "./../../server/Models";
import AddressForm from "./FormComponents/AddressForm";
import FormProgress from "./FormComponents/FormProgress";
import LegislatorPickerForm from "./FormComponents/LegislatorPickerForm";
import MessageForm from "./FormComponents/MessageForm";
import LoadingState from "./LoadingState";

const Form: React.FC = () => {
  // address form
  const [streetAddress, setStreetAddress] = useState("");
  const [city, setCity] = useState("");
  const [zipCode, setZipCode] = useState("");

  // canonical address
  const [canonicalAddress, setCanonicalAddress] = useState<CanonicalAddress>();

  // legislator picker
  const [legislators, setLegislators] = useState<Legislator[]>([]);
  const [legislatorLoadingState, setLegislatorsLoadingState] = useState(
    LoadingState.Ready
  );

  const [selectedBioguides, setSelectedBioguides] = useState<
    (Legislator["bioguideId"])[]
  >([]);

  async function fetchLegislators(canonicalAddress: CanonicalAddress) {
    setLegislatorsLoadingState(LoadingState.Loading);
    try {
      const legislatorsRes = await fetch(
        `http://localhost:3000/api/1/legislators/findByDistrict?district=${canonicalAddress.district}&state=${canonicalAddress.components.stateAbbreviation}`
      );
      const legislatorsJSON = await legislatorsRes.json();

      const nextLegislators: Legislator[] = legislatorsJSON.data;
      setLegislators(nextLegislators);
      setSelectedBioguides(
        nextLegislators
          .filter(l => l.formStatus === "ok")
          .map(l => l.bioguideId)
      );
      setLegislatorsLoadingState(LoadingState.Success);
    } catch (e) {
      setLegislatorsLoadingState(LoadingState.Error);
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
        <div className="row">
          <SwitchTransition>
            <CSSTransition
              appear={true}
              key={location.key ? location.key : "/"}
              timeout={501}
              classNames="whitebox"
            >
              <div className="form-item">
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
                        (legislators.length === 0,
                        selectedBioguides.length === 0)
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
              </div>
            </CSSTransition>
          </SwitchTransition>
        </div>
      </div>
    </div>
  );
};

export default Form;
