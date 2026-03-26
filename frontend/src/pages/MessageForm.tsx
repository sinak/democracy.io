import { useState, useEffect, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useWizard } from "../context/WizardContext";
import { useApi } from "../hooks/useApi";
import { useStepGuard } from "../hooks/useStepGuard";
import { createFormFields, makeMessage } from "../helpers/message";
import { buildDraftMessageRequest } from "../helpers/draft-message";
import { LoadingSpinner } from "../components/LoadingSpinner";
import type {
  CountyData,
  Legislator,
  LegislatorFormElements,
  TopicOption,
} from "../types";

function formatPhoneNumber(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 10);

  if (digits.length === 0) return "";
  if (digits.length < 4) return `(${digits}`;
  if (digits.length < 7) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

export function MessageForm() {
  useStepGuard(["address", "selections"]);

  const navigate = useNavigate();
  const api = useApi();
  const {
    canonicalAddress,
    legislatorsFormElements,
    getSelectedLegislators,
    getSelectedBioguideIds,
    bioguideIdsBySelection,
    setLegislatorsFormElements,
    setMessageResponses,
  } = useWizard();

  const [loading, setLoading] = useState(legislatorsFormElements.length === 0);
  const [loadingDelay, setLoadingDelay] = useState(true);
  const [sending, setSending] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Form data
  const [formData, setFormData] = useState<Record<string, string>>({
    prefix: "Ms.",
  });
  const [topicOptions, setTopicOptions] = useState<Record<string, TopicOption>>(
    {},
  );
  const [countyData, setCountyData] = useState<CountyData>({});
  const [localLegislators, setLocalLegislators] = useState<Legislator[]>([]);

  const [prefixFocus, setPrefixFocus] = useState(false);
  const [phoneFocus, setPhoneFocus] = useState(false);
  const [topicFocus, setTopicFocus] = useState(false);
  const [draftInstruction, setDraftInstruction] = useState("");
  const [draftLoading, setDraftLoading] = useState(false);
  const [draftError, setDraftError] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setLoadingDelay(false);
    }, 350);

    return () => window.clearTimeout(timer);
  }, []);

  function applyFormFields(formElems: LegislatorFormElements[]) {
    if (!canonicalAddress) return;
    const selected = getSelectedLegislators();
    const filteredElems = formElems.filter(
      (lfe) => bioguideIdsBySelection[lfe.bioguideId],
    );
    const fields = createFormFields(filteredElems, selected, canonicalAddress);

    setLocalLegislators(selected);
    setTopicOptions(fields.topicOptions);
    setCountyData(fields.countyData);
    setFormData((prev) => ({
      ...prev,
      prefix: fields.formData.prefix,
      county: fields.formData.county || "",
    }));
  }

  useEffect(() => {
    if (legislatorsFormElements.length > 0) {
      applyFormFields(legislatorsFormElements);
      setLoading(false);
      return;
    }

    const ids = getSelectedBioguideIds();
    if (ids.length === 0) return;

    api
      .getFormElements(ids)
      .then((elems) => {
        setLegislatorsFormElements(elems);
        applyFormFields(elems);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  const updateField = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const updateTopicSelection = (bioguideId: string, value: string) => {
    setTopicOptions((prev) => ({
      ...prev,
      [bioguideId]: { ...prev[bioguideId], selected: value },
    }));
  };

  const legislatorList = localLegislators
    .map((l) => ` ${l.title}. ${l.firstName} ${l.lastName}`)
    .join(", ");
  const isPhoneValid = /^\(\d{3}\) \d{3}-\d{4}$/.test(formData.phone || "");
  const selectedFormElements = legislatorsFormElements.filter((lfe) =>
    localLegislators.some(
      (legislator) => legislator.bioguideId === lfe.bioguideId,
    ),
  );
  const hasCurrentDraft = Boolean(
    formData.subject?.trim() || formData.message?.trim(),
  );

  // Validation
  const isValid =
    formData.subject?.trim() &&
    formData.message?.trim() &&
    formData.email?.trim() &&
    formData.firstName?.trim() &&
    formData.lastName?.trim() &&
    formData.prefix?.trim() &&
    isPhoneValid;

  const invalidFields: string[] = [];
  if (submitted) {
    if (!formData.subject?.trim()) invalidFields.push("Subject");
    if (!formData.message?.trim()) invalidFields.push("Message");
    if (!formData.firstName?.trim()) invalidFields.push("First Name");
    if (!formData.lastName?.trim()) invalidFields.push("Last Name");
    if (!formData.prefix?.trim()) invalidFields.push("Prefix");
    if (!isPhoneValid) invalidFields.push("Phone Number");
    if (countyData.options && !formData.county?.trim())
      invalidFields.push("County");
    if (!formData.email?.trim()) invalidFields.push("Email");
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    if (!isValid || !canonicalAddress) return;

    const messages = localLegislators.map((leg) =>
      makeMessage(
        leg,
        formData,
        formData.phone,
        topicOptions,
        canonicalAddress,
      ),
    );

    setSending(true);

    try {
      const responses = await api.submitMessages(messages);
      setMessageResponses(responses);
      const hasCaptcha = responses.some((r) => r.status === "captcha_needed");
      navigate(hasCaptcha ? "/captcha" : "/thanks");
    } catch (err: any) {
      if (err?.code === 429) {
        // rate limited
      } else if (err?.code !== 400 && err?.code !== 500) {
        navigate("/thanks");
      }
      setSending(false);
    }
  }

  async function handleDraftRequest() {
    if (!canonicalAddress) {
      return;
    }

    const instruction = draftInstruction.trim();
    if (!instruction) {
      setDraftError("Add a short instruction before using AI drafting.");
      return;
    }

    if (
      hasCurrentDraft &&
      !window.confirm(
        "Generating this draft will replace the text within your subject and message. Do you want to continue?",
      )
    ) {
      return;
    }

    setDraftLoading(true);
    setDraftError("");

    try {
      const draft = await api.draftMessage(
        buildDraftMessageRequest({
          mode: "generate",
          instruction,
          formData,
          legislators: localLegislators,
          topicOptions,
          canonicalAddress,
          formElements: selectedFormElements,
        }),
      );

      setFormData((prev) => ({
        ...prev,
        subject: draft.subject,
        message: draft.message,
      }));
    } catch (err: any) {
      if (err?.code === 429) {
        setDraftError(
          "The draft assistant is rate limited right now. Please try again later.",
        );
      } else if (typeof err?.message === "string" && err.message.trim()) {
        setDraftError(err.message);
      } else {
        setDraftError(
          "Could not generate a draft right now. Please try again.",
        );
      }
    } finally {
      setDraftLoading(false);
    }
  }

  const showLoading = (!loadingDelay && loading) || sending;

  return (
    <div className="row">
      <div className="write-message whitebox col-md-10 ng-enter">
        <button
          className="btn-sm btn-warning back-button"
          onClick={() => navigate("/location")}
        >
          Go back
        </button>

        {showLoading ? (
          <LoadingSpinner
            className="whitebox-container"
            message={
              sending
                ? "Sending your message now ... this process may take up to 30 seconds."
                : "This'll just take one moment ..."
            }
          />
        ) : null}

        {!loading && !sending ? (
          <form
            className="whitebox-container"
            onSubmit={handleSubmit}
            noValidate
          >
            <div className="message-form-layout">
              <div className="message-form-main">
                <div className="row">
                  <div className="col-md-12" id="to-field">
                    <label>This message will be sent to:</label>
                    {localLegislators.map((legislator, i) => (
                      <span key={legislator.bioguideId}>
                        <span>
                          {legislator.title}. {legislator.firstName}{" "}
                          {legislator.lastName}
                          {i < localLegislators.length - 1 ? ", " : ""}
                        </span>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="row">
                  <div className="form-group col-sm-8 col-md-12">
                    <label htmlFor="inputSubject">Subject</label>
                    <input
                      type="text"
                      name="subject"
                      className="form-control"
                      id="inputSubject"
                      value={formData.subject || ""}
                      onChange={(e) => updateField("subject", e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="row">
                  <div className="form-group col-sm-8 col-md-12">
                    <label htmlFor="inputMessage">Message</label>
                    <style
                      dangerouslySetInnerHTML={{
                        __html: `#textarea-container::after {content:'Dear${legislatorList},'}`,
                      }}
                    />
                    <div id="textarea-container">
                      <textarea
                        id="inputMessage"
                        name="message"
                        className="form-control"
                        cols={30}
                        rows={10}
                        value={formData.message || ""}
                        onChange={(e) => updateField("message", e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-sm-8 col-md-6">
                    <div className="form-group">
                      <label htmlFor="inputEmail">Your Email Address</label>
                      <input
                        type="email"
                        name="email"
                        className="form-control"
                        id="inputEmail"
                        value={formData.email || ""}
                        onChange={(e) => updateField("email", e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-sm-8 col-md-6">
                    <div className="row">
                      <div className="col-sm-6 form-group">
                        <label htmlFor="inputFirstName">First name</label>
                        <input
                          type="text"
                          name="firstName"
                          className="form-control"
                          id="inputFirstName"
                          value={formData.firstName || ""}
                          onChange={(e) =>
                            updateField("firstName", e.target.value)
                          }
                          required
                        />
                      </div>
                      <div className="col-sm-6 form-group">
                        <label htmlFor="inputLastName">Last name</label>
                        <input
                          type="text"
                          name="lastName"
                          className="form-control"
                          id="inputLastName"
                          value={formData.lastName || ""}
                          onChange={(e) =>
                            updateField("lastName", e.target.value)
                          }
                          required
                        />
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-sm-6 form-group">
                        <label htmlFor="inputPrefix">Prefix</label>
                        <select
                          className="form-control"
                          name="prefix"
                          id="inputPrefix"
                          value={formData.prefix || "Ms."}
                          onChange={(e) => updateField("prefix", e.target.value)}
                          required
                          onFocus={() => setPrefixFocus(true)}
                          onBlur={() => setPrefixFocus(false)}
                        >
                          <option value="Mr.">Mr.</option>
                          <option value="Mrs.">Mrs.</option>
                          <option value="Ms.">Ms.</option>
                        </select>
                      </div>
                      <div className="col-sm-6 form-group">
                        <label htmlFor="inputPhoneNumber">Phone number</label>
                        <input
                          type="tel"
                          name="phone"
                          id="inputPhoneNumber"
                          className="form-control"
                          placeholder="(555) 555-5555"
                          value={formData.phone || ""}
                          onChange={(e) =>
                            updateField(
                              "phone",
                              formatPhoneNumber(e.target.value),
                            )
                          }
                          required
                          onFocus={() => setPhoneFocus(true)}
                          onBlur={() => setPhoneFocus(false)}
                        />
                      </div>
                    </div>
                  </div>
                  {prefixFocus && (
                    <div className="col-sm-4 col-md-6 hidden-xs form-note ng-hide-remove">
                      <div className="panel panel-compact" id="prefixNote">
                        <div className="panel-body">
                          Members of Congress's contact forms require gendered
                          titles.{" "}
                          <span className="hidden-sm">
                            EFF believes the options provided are limiting and
                            we are looking into alternatives.
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                  {phoneFocus && (
                    <div className="col-sm-4 col-md-6 hidden-xs form-note ng-hide-remove">
                      <div className="panel panel-compact" id="phoneNote">
                        <div className="panel-body">
                          Members of Congress's contact forms require US phone
                          numbers.
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {countyData.options && (
                  <div className="row">
                    <div className="form-group col-sm-4 col-md-6">
                      <label htmlFor="inputCounty">County</label>
                      <select
                        className="form-control"
                        name="county"
                        id="inputCounty"
                        value={formData.county || ""}
                        onChange={(e) => updateField("county", e.target.value)}
                        required
                      >
                        {countyData.options.map((county) => (
                          <option key={county} value={county}>
                            {county}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                <div className="row">
                  <div className="col-sm-6">
                    {Object.values(topicOptions).map((topic) => (
                      <div className="form-group" key={topic.bioguideId}>
                        <label htmlFor={`topic-${topic.bioguideId}`}>
                          {topic.name}'s Topic
                        </label>
                        <select
                          className="form-control"
                          id={`topic-${topic.bioguideId}`}
                          value={topic.selected}
                          onChange={(e) =>
                            updateTopicSelection(
                              topic.bioguideId,
                              e.target.value,
                            )
                          }
                          required
                          onFocus={() => setTopicFocus(true)}
                          onBlur={() => setTopicFocus(false)}
                        >
                          {topic.options.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>
                  {topicFocus && (
                    <div className="col-sm-6 hidden-xs form-note ng-hide-remove">
                      <div className="panel panel-compact">
                        <div className="panel-body">
                          These topic fields are required by Members of Congress
                          to submit messages via their contact forms.
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {isValid && (
                  <button type="submit" className="btn btn-orange btn-lg">
                    Send!
                  </button>
                )}
              </div>

              <div className="message-form-sidebar">
                <div className="panel ai-draft-panel">
                  <div className="panel-heading">Draft with AI</div>
                  <div className="panel-body">
                    <div className="form-group">
                      <label htmlFor="draftInstruction">With AI instruction</label>
                      <textarea
                        id="draftInstruction"
                        className="form-control"
                        rows={4}
                        value={draftInstruction}
                        onChange={(e) => setDraftInstruction(e.target.value)}
                        placeholder="Example: Ask Congress to support stronger consumer privacy protections."
                      />
                    </div>

                    <div className="ai-draft-actions">
                      <button
                        type="button"
                        className="btn btn-default btn-sm"
                        onClick={() => void handleDraftRequest()}
                        disabled={draftLoading}
                      >
                        {draftLoading ? "Generating draft..." : "Generate draft"}
                      </button>
                    </div>

                    {draftError && (
                      <div className="alert alert-warning" role="alert">
                        {draftError}
                      </div>
                    )}
                  </div>
                </div>

                <div className="panel hidden-xs">
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
          </form>
        ) : null}

        {submitted && invalidFields.length > 0 && (
          <div
            className="alert alert-warning"
            id="messageFormValidation"
            role="alert"
          >
            <p>
              <strong>
                Please fill in the following required fields to submit your
                message:
              </strong>
            </p>
            <ul>
              {invalidFields.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
