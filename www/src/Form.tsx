import React, { useState, useEffect } from "react";
import { Redirect, Route, Switch, useLocation } from "react-router-dom";
import { CSSTransition, SwitchTransition } from "react-transition-group";
import { CanonicalAddress, Legislator } from "./../../server/Models";
import AddressForm from "./FormComponents/AddressForm";
import FormProgress from "./FormComponents/FormProgress";
import LegislatorPickerForm from "./FormComponents/LegislatorPickerForm";
import MessageForm from "./FormComponents/MessageForm";
import LoadingState from "./LoadingState";
import { getDistrictLegislators } from "./DioAPI";

interface DIOSessionStorageState {
  streetAddress: string;
  city: string;
  zipCode: string;
  canonicalAddress: CanonicalAddress | undefined;
  legislators: Legislator[];
  selectedBioguides: string[];
}

const Form: React.FC = () => {
  let initialState: DIOSessionStorageState;
  const sessionStorageState = getSessionStorage();

  if (sessionStorageState) {
    initialState = sessionStorageState;
  } else {
    initialState = {
      streetAddress: "",
      city: "",
      zipCode: "",
      canonicalAddress: undefined,
      legislators: [],
      selectedBioguides: []
    };
  }

  // address form
  const [streetAddress, setStreetAddress] = useState(
    initialState.streetAddress
  );
  const [city, setCity] = useState(initialState.city);
  const [zipCode, setZipCode] = useState(initialState.zipCode);

  // canonical address
  const [canonicalAddress, setCanonicalAddress] = useState<
    CanonicalAddress | undefined
  >(initialState.canonicalAddress);

  // legislator picker
  // fetching is handled in this component since others depend on the data
  const [legislators, setLegislators] = useState<Legislator[]>(
    initialState.legislators
  );
  const [legislatorLoadingState, setLegislatorsLoadingState] = useState(
    initialState.legislators.length > 0
      ? LoadingState.Success
      : LoadingState.Ready
  );
  const [selectedBioguides, setSelectedBioguides] = useState<
    Legislator["bioguideId"][]
  >(initialState.selectedBioguides);

  // fetch the legislators using the current canonical address
  // sets the default selected bioguide id's
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

  // sync state changes to session storage
  useEffect(() => {
    setSessionStorage({
      streetAddress,
      city,
      zipCode,
      canonicalAddress,
      legislators,
      selectedBioguides
    });
  }, [
    streetAddress,
    city,
    zipCode,
    canonicalAddress,
    legislators,
    selectedBioguides
  ]);

  let location = useLocation();

  return (
    <div>
      <FormProgress />
      <div className="container">
        <SwitchTransition>
          <CSSTransition
            appear={true}
            key={location.key ? location.key : "/"}
            timeout={location.key ? 1000 : 2000}
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

const SESSION_STORAGE_KEY = "DIOSessionStorageState";
function setSessionStorage(state: DIOSessionStorageState) {
  sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(state));
}

function getSessionStorage(): DIOSessionStorageState | null {
  const item = sessionStorage.getItem(SESSION_STORAGE_KEY);
  if (item) {
    return JSON.parse(item);
  } else {
    return null;
  }
}

export default Form;
