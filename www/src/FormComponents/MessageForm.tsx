import React, { useState, FormEvent } from "react";
import { CanonicalAddress, Legislator, Message } from "../../../server/Models";
import Whitebox from "./Whitebox";
import classNames from "classnames";
import { useHistory } from "react-router-dom";
import { sendMessages } from "../DioAPI";

interface MessageFormProps {
  canonicalAddress: CanonicalAddress;
  legislators: Legislator[];
  selectedBioguides: string[];
}
export default function MessageForm(props: MessageFormProps) {
  const { legislators, selectedBioguides, canonicalAddress } = props;

  // message form
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [prefix, setPrefix] = useState("Ms.");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [legislatorTopicsMap, setLegislatorTopicsMap] = useState<{
    [bioguideId: string]: string;
  }>({});

  const [topicFocused, setTopicFocused] = useState(false);
  let history = useHistory();

  // derived data
  const selectedLegislators = legislators.filter(legislator =>
    selectedBioguides.includes(legislator.bioguideId)
  );

  async function handleMessageFormSubmit(e: FormEvent) {
    e.preventDefault();

    let messages: Message[] = selectedBioguides.map(bioguideId => {
      const legislator = legislators.find(l => l.bioguideId === bioguideId);
      if (legislator === undefined) throw new Error();

      let m: Message = {
        bioguideId: bioguideId,
        subject: subject,
        message: message,
        sender: {
          namePrefix: prefix,
          county: canonicalAddress.county,
          email: email,
          firstName: firstName,
          lastName: lastName,
          parenPhone: phoneNumber,
          phone: phoneNumber
        },
        campaign: {
          orgName: "",
          orgURL: "",
          uuid: ""
        },
        canonicalAddress: canonicalAddress,
        topic: legislatorTopicsMap[bioguideId]
      };
      return m;
    });

    try {
      const res = await sendMessages(messages);
    } catch (e) {
      // TODO: handle error
    }
  }

  return (
    <div className="col-lg-10 mx-auto">
      <Whitebox
        className="write-message"
        showBackButton={true}
        onClickBackButton={() => history.push("/pick-legislators")}
      >
        <div>
          <form onSubmit={handleMessageFormSubmit}>
            <div className="row">
              <div id="to-field" className="col-md-12">
                <label>This message will be sent to:</label>
                {selectedLegislators
                  .map(
                    legislator =>
                      `${legislatorTitle(legislator)} ${legislator.firstName} ${
                        legislator.lastName
                      }`
                  )
                  .join(", ")}
              </div>
            </div>

            <div className="row">
              <div className="form-group col-sm-8 col-md-9">
                <label htmlFor="subject">Subject</label>
                <input
                  id="subject"
                  type="text"
                  defaultValue={subject}
                  onChange={e => setSubject(e.target.value)}
                  required
                  className="form-control"
                />
              </div>
            </div>

            <div className="row">
              <div className="form-group col-sm-8 col-md-9">
                <label htmlFor="inputMessage">Message</label>
                <style
                  dangerouslySetInnerHTML={{
                    __html: `
                  #textarea-container::after {
                    content: 'Dear ${legislators
                      .map(
                        l =>
                          `${legislatorTitle(l)} ${l.firstName} ${l.lastName}`
                      )
                      .join(", ")},'
                  }
                `
                  }}
                />

                <div id="textarea-container">
                  <textarea
                    id="inputMessage"
                    defaultValue={message}
                    onChange={e => setMessage(e.target.value)}
                    cols={30}
                    rows={10}
                    required
                    className="form-control"
                  />
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
                  <label htmlFor="email">Your Email Address</label>
                  <input
                    id="email"
                    type="text"
                    defaultValue={email}
                    onChange={e => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                    className="form-control"
                  />
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-sm-8 col-md-6">
                <div className="row">
                  <div className="col-sm-6 form-group">
                    <label htmlFor="firstName">First Name</label>
                    <input
                      id="firstName"
                      type="text"
                      defaultValue={firstName}
                      onChange={e => setFirstName(e.target.value)}
                      required
                      className="form-control"
                    />
                  </div>

                  <div className="col-sm-6 form-group">
                    <label htmlFor="lastName">Last Name</label>
                    <input
                      id="lastName"
                      type="text"
                      defaultValue={lastName}
                      onChange={e => setLastName(e.target.value)}
                      required
                      className="form-control"
                    />
                  </div>
                </div>
                <div className="row">
                  <div className="col-sm-6 form-group">
                    <label htmlFor="prefix">Prefix</label>
                    <select
                      onChange={e => setPrefix(e.target.value)}
                      value={prefix}
                      className="form-control"
                      autoComplete="honorific-prefix"
                    >
                      {["Mr.", "Mrs.", "Ms."].map(p => (
                        <option value={p}>{p}</option>
                      ))}
                    </select>
                  </div>

                  <div className="col-sm-6 form-group">
                    <label htmlFor="phoneNumber">Phone Number</label>
                    <input
                      id="phoneNumber"
                      type="text"
                      defaultValue={phoneNumber}
                      onChange={e => setPhoneNumber(e.target.value)}
                      autoComplete="tel tel-national"
                      required
                      className="form-control"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-sm-6">
                {selectedLegislators.map(legislator => {
                  const topicFormElement = legislator.formElements.find(
                    fe => fe.value === "$TOPIC"
                  );
                  if (!topicFormElement) return;

                  let options: string[];
                  if (topicFormElement.optionsHash === null) return;
                  if (Array.isArray(topicFormElement.optionsHash)) {
                    options = topicFormElement.optionsHash;
                  } else {
                    options = Object.keys(topicFormElement.optionsHash);
                  }

                  return (
                    <div className="form-group">
                      <label htmlFor={`topic-${legislator.bioguideId}`}>
                        {legislatorTitle(legislator)} {legislator.lastName}'s
                        topic
                      </label>
                      <select
                        onChange={e =>
                          setLegislatorTopicsMap({
                            [legislator.bioguideId]: e.target.value
                          })
                        }
                        onFocus={() => setTopicFocused(true)}
                        onBlur={() => setTopicFocused(false)}
                        value={legislatorTopicsMap[legislator.bioguideId]}
                        className="form-control"
                      >
                        {options.map(o => (
                          <option value={o}>{o}</option>
                        ))}
                      </select>
                    </div>
                  );
                })}
              </div>

              <div
                className={classNames("col-sm-6 hidden-xs form-note", {
                  "ng-hide": topicFocused === false
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
            <button className="btn btn-orange btn-lg btn-outline-primary">Send!</button>
          </form>
        </div>
      </Whitebox>
    </div>
  );
}

function legislatorTitle(legislator: Legislator) {
  if (legislator.chamber === "senate") {
    return "Sen.";
  } else {
    return "Rep.";
  }
}
