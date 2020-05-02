import axios, { CancelTokenSource } from "axios";
import classNames from "classnames";
import React, { FormEvent, useRef, useState } from "react";
import InputMask from "react-input-mask";
import { useHistory, Redirect } from "react-router-dom";
import {
  LegislatorContact,
  Message,
  MessageSenderAddress,
} from "../../../../server/src/models";
import LoadingState from "../../AsyncUtils/LoadingState";
import { sendMessages } from "../../DioAPI";
import Whitebox from "../Whitebox";
import { ReactComponent as LoadingSpinner } from "./../../AsyncUtils/LoadingSpinner.svg";
import { format } from "path";

interface MessageFormProps {
  messageSenderAddress: MessageSenderAddress;
  legislatorContacts: LegislatorContact[];
  selectedBioguides: string[];
}
enum ValidationStatus {
  Invalid,
  Valid,
  Init,
}

export default function MessageForm(props: MessageFormProps) {
  const { legislatorContacts, selectedBioguides, messageSenderAddress } = props;

  // message form data
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [prefix, setPrefix] = useState("Ms.");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [legislatorTopicsMap, setLegislatorTopicsMap] = useState<{
    [bioguideId: string]: string;
  }>(
    legislatorContacts.reduce((prev, curr) => {
      return {
        ...prev,
        [curr.legislator.bioguideId]: curr.form.topics[0].value,
      };
    }, {})
  );
  const [isValid, setIsValid] = useState(ValidationStatus.Init);

  const sourceRef = useRef<CancelTokenSource>(axios.CancelToken.source());

  // ui state
  const [topicFocused, setTopicFocused] = useState(false);
  const [prefixFocused, setPrefixFocused] = useState(false);
  const [phoneFocused, setPhoneFocused] = useState(false);

  // async
  const [sendLoadingState, setSendLoadingState] = useState(LoadingState.Ready);

  // derived data
  const selectedLegislatorContacts = legislatorContacts.filter(
    (legislatorContact) =>
      selectedBioguides.includes(legislatorContact.legislator.bioguideId)
  );

  let history = useHistory();

  async function handleMessageFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    const target = e.target as HTMLFormElement;
    if (target.checkValidity() === false) {
      setIsValid(ValidationStatus.Invalid);
    } else {
      let messages: Message[] = selectedLegislatorContacts.map((contact) => {
        return {
          bioguideId: contact.legislator.bioguideId,
          subject: subject,
          message: message,
          sender: {
            namePrefix: prefix,
            email: email,
            firstName: firstName,
            lastName: lastName,
            parenPhone: phoneNumber,
            phone: phoneNumber,
          },
          campaign: {
            orgName: "",
            orgURL: "",
            uuid: "",
          },
          senderAddress: messageSenderAddress,
          topic: legislatorTopicsMap[contact.legislator.bioguideId],
        };
      });

      setSendLoadingState(LoadingState.Loading);

      try {
        const res = await sendMessages(messages, {
          cancelToken: sourceRef.current.token,
        });
        setSendLoadingState(LoadingState.Success);
      } catch (e) {
        if (axios.isCancel(e)) {
          setSendLoadingState(LoadingState.Ready);
        }
        setSendLoadingState(LoadingState.Error);
      }
    }
  }

  if (sendLoadingState === LoadingState.Loading) {
    return (
      <div className="col-md-12 col-lg-11 mx-auto">
        <Whitebox
          id="loading"
          className="write-message text-center"
          showBackButton={true}
          onClickBackButton={sourceRef.current.cancel}
        >
          <LoadingSpinner />
          <p className="mx-auto" style={{ fontSize: 18, maxWidth: 320 }}>
            Sending your message now ... this process may take up to 30 seconds.
          </p>
        </Whitebox>
      </div>
    );
  }

  if (sendLoadingState === LoadingState.Success) {
    return <Redirect to="/thanks" />;
  }

  return (
    <div className="col-md-12 col-lg-11 mx-auto">
      <Whitebox
        className="write-message"
        showBackButton={true}
        onClickBackButton={() => history.push("/pick-legislators")}
      >
        <form
          onSubmit={handleMessageFormSubmit}
          noValidate={true}
          className={classNames("needs-validation", {
            "was-validated": isValid === ValidationStatus.Invalid,
          })}
        >
          <div className="row">
            <div id="to-field" className="col-md-12">
              <div className="label mb-2">This message will be sent to:</div>
              <div className="mb-2" style={{ fontSize: 18 }}>
                {selectedLegislatorContacts
                  .map(
                    (contact) =>
                      `${legislatorTitle(contact)} ${
                        contact.legislator.firstName
                      } ${contact.legislator.lastName}`
                  )
                  .join(", ")}
              </div>
            </div>
          </div>

          <div className="row">
            <div className="form-group col-sm-8 col-md-9">
              <label className="label" htmlFor="subject">
                Subject
              </label>
              <input
                id="subject"
                type="text"
                defaultValue={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
                className="form-control"
              />

              <div className="invalid-feedback">Subject is required.</div>
            </div>
          </div>

          <div className="row">
            <div className="form-group col-sm-8 col-md-9">
              <label className="label" htmlFor="inputMessage">
                Message
              </label>
              <style
                dangerouslySetInnerHTML={{
                  __html: `
                  #textarea-container::after {
                    content: 'Dear ${selectedLegislatorContacts
                      .map(
                        (contact) =>
                          `${legislatorTitle(contact)} ${
                            contact.legislator.firstName
                          } ${contact.legislator.lastName}`
                      )
                      .join(", ")},'
                  }
                `,
                }}
              />

              <div id="textarea-container">
                <textarea
                  id="inputMessage"
                  defaultValue={message}
                  onChange={(e) => setMessage(e.target.value)}
                  cols={30}
                  rows={10}
                  required
                  className="form-control"
                />

                <div className="invalid-feedback">Message is required.</div>
                <div className="valid-feedback">Looks good!</div>
              </div>
            </div>

            <div className="col-sm-4 col-md-3 hidden-xs">
              <div className="panel">
                <div className="panel-heading">Guidelines:</div>
                <div className="panel-body">
                  <p>
                    Be <strong>polite</strong> and concise.
                  </p>
                  <p>
                    Explain why the issue you're writing about is important to
                    you.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-sm-8 col-md-6">
              <div className="form-group">
                <label className="label" htmlFor="email">
                  Your Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  defaultValue={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                  className="form-control"
                />
                <div className="invalid-feedback">Must be a valid email</div>
                <div className="valid-feedback">Looks good!</div>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-sm-8 col-md-6">
              <div className="row">
                <div className="col-sm-6 form-group">
                  <label className="label" htmlFor="firstName">
                    First Name
                  </label>
                  <input
                    id="firstName"
                    type="text"
                    defaultValue={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    className="form-control"
                  />
                  <div className="invalid-feedback">First name is required</div>
                  <div className="valid-feedback">Looks good!</div>
                </div>

                <div className="col-sm-6 form-group">
                  <label className="label" htmlFor="lastName">
                    Last Name
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    defaultValue={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    className="form-control"
                  />
                  <div className="invalid-feedback">Last name is required</div>
                  <div className="valid-feedback">Looks good!</div>
                </div>
              </div>
              <div className="row">
                <div className="col-sm-6 form-group">
                  <label className="label" htmlFor="prefix">
                    Prefix
                  </label>
                  <select
                    onChange={(e) => setPrefix(e.target.value)}
                    value={prefix}
                    className="form-control"
                    autoComplete="honorific-prefix"
                    onFocus={() => setPrefixFocused(true)}
                    onBlur={() => setPrefixFocused(false)}
                  >
                    {["Mr.", "Mrs.", "Ms."].map((p) => (
                      <option value={p}>{p}</option>
                    ))}
                  </select>
                </div>

                <div className="col-sm-6 form-group">
                  <label className="label" htmlFor="phoneNumber">
                    Phone Number
                  </label>
                  <InputMask
                    mask="(999) 999-9999"
                    value={phoneNumber}
                    id="phoneNumber"
                    type="text"
                    defaultValue={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    autoComplete="tel tel-national"
                    className="form-control"
                    onFocus={() => setPhoneFocused(true)}
                    onBlur={() => setPhoneFocused(false)}
                    pattern="\([0-9]{3}\) [0-9]{3}-[0-9]{4}"
                    required
                  />
                  <div className="invalid-feedback">
                    Phone number is required
                  </div>
                  <div className="valid-feedback">Looks good!</div>
                </div>
              </div>
            </div>

            <div
              className={classNames("col-sm-6 hidden-xs form-note", {
                "d-none": prefixFocused === false,
                "ng-hide": prefixFocused === false,
              })}
            >
              <div className="panel panel-compact" id="prefixNote">
                <div className="panel-body">
                  Members of Congress's contact forms require gendered titles.{" "}
                  <span className="hidden-sm">
                    EFF believes the options provided are limiting and we are
                    looking into alternatives.
                  </span>
                </div>
              </div>
            </div>

            <div
              className={classNames("col-sm-6 hidden-xs form-note", {
                "d-none": phoneFocused === false,
                "ng-hide": phoneFocused === false,
              })}
            >
              <div className="panel panel-compact" id="phoneNote">
                <div className="panel-body">
                  Members of Congress's contact forms require US phone numbers.
                </div>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-sm-6">
              {selectedLegislatorContacts.map((contact) => {
                return (
                  <div className="form-group">
                    <label
                      className="label"
                      htmlFor={`topic-${contact.legislator.bioguideId}`}
                    >
                      {legislatorTitle(contact)} {contact.legislator.lastName}'s
                      topic
                    </label>
                    <select
                      onChange={(e) =>
                        setLegislatorTopicsMap({
                          ...legislatorTopicsMap,
                          [contact.legislator.bioguideId]: e.target.value,
                        })
                      }
                      onFocus={() => setTopicFocused(true)}
                      onBlur={() => setTopicFocused(false)}
                      value={legislatorTopicsMap[contact.legislator.bioguideId]}
                      className="form-control"
                    >
                      {contact.form.topics.map((o) => (
                        <option value={o.value}>{o.label.trim()}</option>
                      ))}
                    </select>
                  </div>
                );
              })}
            </div>

            <div
              className={classNames("col-sm-6 hidden-xs form-note", {
                "ng-hide": topicFocused === false,
              })}
            >
              <div className="panel panel-compact" id="prefixNote">
                <div className="panel-body">
                  These topic fields are required by Members of Congress to
                  submit messages via their contact forms.
                </div>
              </div>
            </div>
          </div>
          <button className="btn btn-orange btn-lg btn-outline-primary">
            Send!
          </button>
        </form>
      </Whitebox>
    </div>
  );
}

function legislatorTitle(contact: LegislatorContact) {
  if (contact.legislator.currentTerm.chamber === "senate") {
    return "Sen.";
  } else {
    return "Rep.";
  }
}
