import { useState, useEffect, useRef, type FocusEvent, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useWizard } from "../context/WizardContext";
import { useApi } from "../hooks/useApi";
import { useStepGuard } from "../hooks/useStepGuard";
import { createFormFields, makeMessage } from "../helpers/message";
import { buildDraftMessageRequest } from "../helpers/draft-message";
import { buildTopicSuggestionRequest } from "../helpers/topic-suggestion";
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

const TOPIC_SUGGESTION_MIN_WORDS = 7;

function countWords(value: string): number {
  return value.trim().split(/\s+/).filter(Boolean).length;
}

function getSelectedTopicsForShare(topicValues: Array<string | undefined>): string[] {
  return Array.from(new Set(topicValues.map((value) => value?.trim()).filter(Boolean))) as string[];
}

type ApiError = Error & {
  code?: number;
};

function asApiError(error: unknown): ApiError {
  if (error instanceof Error) {
    return error as ApiError;
  }

  return new Error(String(error)) as ApiError;
}

function InlineSpinner({ className = "" }: { className?: string }) {
  const spinnerClassName = ["inline-loading-spinner", className]
    .filter(Boolean)
    .join(" ");

  return (
    <span className={spinnerClassName} aria-hidden="true">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 40 40"
      >
        <path
          opacity="0.2"
          fill="currentColor"
          d="M20.201,5.169c-8.254,0-14.946,6.692-14.946,14.946c0,8.255,6.692,14.946,14.946,14.946s14.946-6.691,14.946-14.946C35.146,11.861,28.455,5.169,20.201,5.169z M20.201,31.749c-6.425,0-11.634-5.208-11.634-11.634c0-6.425,5.209-11.634,11.634-11.634c6.425,0,11.633,5.209,11.633,11.634C31.834,26.541,26.626,31.749,20.201,31.749z"
        />
        <path
          fill="currentColor"
          d="M26.013,10.047l1.654-2.866c-2.198-1.272-4.743-2.012-7.466-2.012h0v3.312h0C22.32,8.481,24.301,9.057,26.013,10.047z"
        >
          <animateTransform
            attributeType="xml"
            attributeName="transform"
            type="rotate"
            from="0 20 20"
            to="360 20 20"
            dur="0.5s"
            repeatCount="indefinite"
          />
        </path>
      </svg>
    </span>
  );
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
    setShareDraft,
    setMessageResponses,
    setEmailCopyRequest,
    setEmailCopySent,
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
  const [sendEmailCopy, setSendEmailCopy] = useState(false);

  const [prefixFocus, setPrefixFocus] = useState(false);
  const [phoneFocus, setPhoneFocus] = useState(false);
  const [topicFocus, setTopicFocus] = useState(false);
  const [topicSuggestionLoading, setTopicSuggestionLoading] = useState(false);
  const [draftInstruction, setDraftInstruction] = useState("");
  const [draftLoading, setDraftLoading] = useState(false);
  const [draftError, setDraftError] = useState("");
  const lastSuggestedMessageRef = useRef("");
  const pendingTopicSuggestionMessageRef = useRef("");
  const topicSuggestionRequestIdRef = useRef(0);
  const manualTopicSelectionVersionRef = useRef(0);

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

  const updateTopicSelection = (
    bioguideId: string,
    value: string,
    source: "manual" | "auto" = "manual",
  ) => {
    if (source === "manual") {
      manualTopicSelectionVersionRef.current += 1;
    }

    setTopicOptions((prev) => ({
      ...prev,
      [bioguideId]: { ...prev[bioguideId], selected: value },
    }));
  };

  async function suggestTopicsForMessage(
    message: string,
    options?: { requireWordThreshold?: boolean },
  ) {
    const normalizedMessage = message.trim();
    if (!normalizedMessage || Object.keys(topicOptions).length === 0) {
      return;
    }

    if (
      options?.requireWordThreshold !== false &&
      countWords(normalizedMessage) < TOPIC_SUGGESTION_MIN_WORDS
    ) {
      return;
    }

    if (
      topicSuggestionLoading &&
      pendingTopicSuggestionMessageRef.current === normalizedMessage
    ) {
      return;
    }

    if (lastSuggestedMessageRef.current === normalizedMessage) {
      return;
    }

    const requestId = topicSuggestionRequestIdRef.current + 1;
    const manualSelectionVersion = manualTopicSelectionVersionRef.current;

    topicSuggestionRequestIdRef.current = requestId;
    pendingTopicSuggestionMessageRef.current = normalizedMessage;
    setTopicSuggestionLoading(true);

    try {
      const result = await api.suggestTopics(
        buildTopicSuggestionRequest(normalizedMessage, topicOptions),
      );

      if (
        topicSuggestionRequestIdRef.current !== requestId ||
        manualTopicSelectionVersionRef.current !== manualSelectionVersion
      ) {
        return;
      }

      for (const topic of result.topics) {
        updateTopicSelection(topic.bioguideId, topic.selectedTopic, "auto");
      }

      lastSuggestedMessageRef.current = normalizedMessage;
    } catch (error) {
      if (topicSuggestionRequestIdRef.current === requestId) {
        console.warn("Topic auto-selection failed.", error);
      }
    } finally {
      if (topicSuggestionRequestIdRef.current === requestId) {
        pendingTopicSuggestionMessageRef.current = "";
        setTopicSuggestionLoading(false);
      }
    }
  }

  async function handleMessageBlur(e: FocusEvent<HTMLTextAreaElement>) {
    const nextTarget = e.relatedTarget;
    const form = e.currentTarget.form;

    if (!(nextTarget instanceof HTMLElement) || !form?.contains(nextTarget)) {
      return;
    }

    const tagName = nextTarget.tagName.toLowerCase();
    if (!["input", "select", "textarea"].includes(tagName)) {
      return;
    }

    await suggestTopicsForMessage(formData.message || "");
  }

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

    if (sendEmailCopy) {
      setEmailCopyRequest({ messages });
      setEmailCopySent(false);
    } else {
      setEmailCopyRequest(null);
      setEmailCopySent(false);
    }
    setShareDraft(null);

    setSending(true);

    try {
      const responses = await api.submitMessages(messages);
      setShareDraft({
        subject: formData.subject.trim(),
        message: formData.message.trim(),
        selectedTopics: getSelectedTopicsForShare(messages.map((message) => message.topic)),
      });
      setMessageResponses(responses);
      const hasCaptcha = responses.some((r) => r.status === "captcha_needed");

      if (sendEmailCopy && !hasCaptcha) {
        try {
          await api.sendMessageCopy({ messages });
          setEmailCopySent(true);
        } catch (error) {
          console.warn("Sending the email copy failed.", error);
        }
      }

      navigate(hasCaptcha ? "/captcha" : "/thanks");
    } catch (error: unknown) {
      const apiError = asApiError(error);
      setShareDraft(null);
      setEmailCopyRequest(null);
      setEmailCopySent(false);

      if (apiError.code === 429) {
        // rate limited
      } else if (apiError.code !== 400 && apiError.code !== 500) {
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
      await suggestTopicsForMessage(draft.message, {
        requireWordThreshold: false,
      });
    } catch (error: unknown) {
      const apiError = asApiError(error);

      if (apiError.code === 429) {
        setDraftError(
          "The draft assistant is rate limited right now. Please try again later.",
        );
      } else if (typeof apiError.message === "string" && apiError.message.trim()) {
        setDraftError(apiError.message);
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
                        onBlur={(e) => void handleMessageBlur(e)}
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
                      <div
                        className="form-group topic-field"
                        key={topic.bioguideId}
                        aria-busy={topicSuggestionLoading}
                      >
                        <label htmlFor={`topic-${topic.bioguideId}`}>
                          {topic.name}'s Topic
                        </label>
                        <div className="topic-field-input">
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
                          {topicSuggestionLoading ? (
                            <span className="topic-field-loading">
                              <InlineSpinner />
                              <span>Choosing...</span>
                            </span>
                          ) : null}
                        </div>
                      </div>
                    ))}
                    {topicSuggestionLoading && (
                      <p
                        className="topic-suggestion-status"
                        aria-live="polite"
                      >
                        Choosing topics from your message...
                      </p>
                    )}
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

                <div className="row">
                  <div className="col-sm-8 col-md-12">
                    <div className="message-copy-checkbox">
                      <label htmlFor="inputSendEmailCopy">
                        <input
                          type="checkbox"
                          id="inputSendEmailCopy"
                          checked={sendEmailCopy}
                          onChange={(e) => setSendEmailCopy(e.target.checked)}
                        />
                        <span>Email me a copy of this message</span>
                      </label>
                    </div>
                  </div>
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
                        {draftLoading ? (
                          <span className="ai-draft-button-content">
                            <InlineSpinner />
                            <span>Generating draft...</span>
                          </span>
                        ) : (
                          "Generate draft"
                        )}
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
