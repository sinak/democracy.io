import React, { useState, useEffect, useReducer } from "react";
import { Redirect, Route, Switch, useLocation } from "react-router-dom";
import { CSSTransition, SwitchTransition } from "react-transition-group";
import {
  Legislator,
  MessageSenderAddress,
  LegislatorContact,
  MessageResponse,
} from "../../../server/src/models";
import AddressForm from "./AddressForm/AddressForm";
import FormProgress from "./FormProgress/FormProgress";
import LegislatorPickerForm from "./LegislatorPicker/LegislatorPickerForm";
import MessageForm from "./MessageForm/MessageForm";
import Thanks from "./Thanks/Thanks";
import * as FormStateSessionStorage from "./FormStateSessionStorage";
import FormErrorBoundary from "./FormErrorBoundary";

enum Action {
  UPDATE_STREET_ADDRESS,
  UPDATE_CITY,
  UPDATE_ZIP_CODE,
  UPDATE_MESSAGE_SENDER_ADDRESS,
}

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
      zipCode: "",
    },
    messageSenderAddress: undefined,
    messageResponses: [],
    legislatorContacts: [],
    selectedBioguides: [],
  };

  function reducer(
    state: FormStateSessionStorage.StoredFormState,
    action: Action
  ): FormStateSessionStorage.StoredFormState {
    return {
      ...state,
    };
  }
  const [state, dispatch] = useReducer(reducer, initialState);
  const [addressInputFields, setAddressInputFields] = useState(
    initialState.addressInputFields
  );

  const [messageSenderAddress, setMessageSenderAddress] = useState<
    MessageSenderAddress | undefined
  >(initialState.messageSenderAddress);

  // State - Legislator Picker
  const [legislatorContacts, setLegislatorContacts] = useState<
    LegislatorContact[]
  >(initialState.legislatorContacts);

  const [selectedBioguides, setSelectedBioguides] = useState<
    Legislator["bioguideId"][]
  >(initialState.selectedBioguides);

  // State - Message Form
  const [messageSubject, setMessageSubject] = useState<string>("");
  const [messageMessage, setMessageMessage] = useState<string>("");
  const [messageEmail, setMessageEmail] = useState<string>("");
  const [messageFirstName, setMessageFirstName] = useState<string>("");
  const [messageLastName, setMessageLastName] = useState<string>("");
  const [messagePrefix, setMessagePrefix] = useState<string>("");
  const [messageTopics, setMessageTopics] = useState<string>("");
  const [messageResponses, setMessageResponses] = useState<MessageResponse[]>(
    initialState.messageResponses
  );

  // sync state changes to session storage
  useEffect(() => {
    FormStateSessionStorage.setSessionStorage({
      addressInputFields,
      messageSenderAddress,
      legislatorContacts,
      selectedBioguides,
      messageResponses,
    });
  }, [
    addressInputFields,
    messageSenderAddress,
    legislatorContacts,
    selectedBioguides,
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
              timeout={location.key ? 1000 : 1000}
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
                      previousLegislatorContacts={legislatorContacts}
                      previousSelectedBioguides={selectedBioguides}
                      onLegislatorContactsLoaded={setLegislatorContacts}
                      onChange={setSelectedBioguides}
                    />
                  ) : (
                    <Redirect to="/" />
                  )}
                </Route>

                <Route
                  exact
                  path="/message"
                  render={(routeProps) => {
                    if (messageSenderAddress === undefined) {
                      return <Redirect to="/" />;
                    } else if (
                      (legislatorContacts.length === 0,
                      selectedBioguides.length === 0)
                    ) {
                      return <Redirect to="/pick-legislators" />;
                    } else {
                      return (
                        <MessageForm
                          messageSenderAddress={messageSenderAddress}
                          selectedBioguides={selectedBioguides}
                          legislatorContacts={legislatorContacts}
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
