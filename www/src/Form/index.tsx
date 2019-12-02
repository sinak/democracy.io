import React, { useState, useEffect } from "react";
import { Redirect, Route, Switch, useLocation } from "react-router-dom";
import { CSSTransition, SwitchTransition } from "react-transition-group";
import { Legislator, MessageSenderAddress } from "../../../server/lib/Models";
import AddressForm from "./AddressForm/AddressForm";
import FormProgress from "./FormProgress/FormProgress";
import LegislatorPickerForm from "./LegislatorPicker/LegislatorPickerForm";
import MessageForm from "./MessageForm/MessageForm";
import Thanks from "./Thanks/Thanks";
import * as FormStateSessionStorage from "./FormStateSessionStorage";
import FormErrorBoundary from "./FormErrorBoundary";

export default function Form() {
  /**
   * State
   */

  // build the initial state
  // restore data from session storage or provide defaults
  let initialState: FormStateSessionStorage.StoredFormState;
  initialState = FormStateSessionStorage.getSessionStorage() || {
    addressInputFields: {
      streetAddress: "",
      city: "",
      zipCode: ""
    },
    messageSenderAddress: undefined,
    legislators: [],
    selectedBioguides: []
  };

  const [addressInputFields, setAddressInputFields] = useState(
    initialState.addressInputFields
  );

  const [messageSenderAddress, setMessageSenderAddress] = useState<
    MessageSenderAddress | undefined
  >(initialState.messageSenderAddress);

  // State - Legislator Picker
  const [legislators, setLegislators] = useState<Legislator[]>(
    initialState.legislators
  );

  const [selectedBioguides, setSelectedBioguides] = useState<
    Legislator["bioguideId"][]
  >(initialState.selectedBioguides);

  // sync state changes to session storage
  useEffect(() => {
    FormStateSessionStorage.setSessionStorage({
      addressInputFields,
      messageSenderAddress,
      legislators,
      selectedBioguides
    });
  }, [
    addressInputFields,
    messageSenderAddress,
    legislators,
    selectedBioguides
  ]);

  let location = useLocation();

  return (
    <FormErrorBoundary>
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
                    initialAddressInputFields={addressInputFields}
                    onAddressInputFieldsChange={setAddressInputFields}
                    onSuccessfulAddress={setMessageSenderAddress}
                  />
                </Route>

                <Route exact path="/pick-legislators">
                  {messageSenderAddress ? (
                    <LegislatorPickerForm
                      messageSenderAddress={messageSenderAddress}
                      previousLegislators={legislators}
                      previousSelectedBioguides={selectedBioguides}
                      onLegislatorsLoaded={setLegislators}
                      onChange={setSelectedBioguides}
                    />
                  ) : (
                    <Redirect to="/" />
                  )}
                </Route>

                <Route
                  exact
                  path="/message"
                  render={routeProps => {
                    if (messageSenderAddress === undefined) {
                      return <Redirect to="/" />;
                    } else if (
                      (legislators.length === 0, selectedBioguides.length === 0)
                    ) {
                      return <Redirect to="/pick-legislators" />;
                    } else {
                      return (
                        <MessageForm
                          messageSenderAddress={messageSenderAddress}
                          selectedBioguides={selectedBioguides}
                          legislators={legislators}
                        />
                      );
                    }
                  }}
                />

                <Route exact path="/captcha" />
                <Route exact path="/thanks" component={Thanks} />
              </Switch>
            </CSSTransition>
          </SwitchTransition>
        </div>
      </div>
    </FormErrorBoundary>
  );
}
