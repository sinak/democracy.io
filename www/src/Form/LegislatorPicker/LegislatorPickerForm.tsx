import React, { FormEvent, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import {
  MessageSenderAddress,
  LegislatorContact
} from "../../../../server/src/models";
import LoadingState from "../../AsyncUtils/LoadingState";
import { ReactComponent as LoadingSpinner } from "./../../AsyncUtils/LoadingSpinner.svg";
import Whitebox from "../Whitebox";
import { getDistrictLegislators } from "./../../DioAPI";

interface LegislatorPickerProps {
  previousLegislatorContacts: LegislatorContact[];
  previousSelectedBioguides: string[];
  messageSenderAddress: MessageSenderAddress;
  onLegislatorContactsLoaded: (legislators: LegislatorContact[]) => void;
  onChange: (selectedBioguides: string[]) => void;
}

export default function LegislatorPickerForm(props: LegislatorPickerProps) {
  const [legislatorContacts, setLegislatorContacts] = useState(
    props.previousLegislatorContacts
  );
  const [legislatorsLoadingState, setLegislatorsLoadingState] = useState(
    props.previousLegislatorContacts.length > 0
      ? LoadingState.SuccessCached
      : LoadingState.Loading
  );

  const [selectedBioguides, setSelectedBioguides] = useState(
    props.previousSelectedBioguides
  );

  useEffect(() => {
    props.onChange(selectedBioguides);
  }, [selectedBioguides]);

  function toggleSelectedBioguideId(bioguideId: string) {
    if (selectedBioguides.includes(bioguideId)) {
      setSelectedBioguides(
        selectedBioguides.filter(
          selectedBioguide => selectedBioguide !== bioguideId
        )
      );
    } else {
      setSelectedBioguides(selectedBioguides.concat(bioguideId));
    }
  }

  // fetch legislators whenever address is changed
  useEffect(() => {
    async function fetchLegislators() {
      setLegislatorsLoadingState(LoadingState.Loading);

      try {
        const legislatorsRes = await getDistrictLegislators({
          district: props.messageSenderAddress.district,
          state: props.messageSenderAddress.statePostalAbbrev
        });

        const nextLegislators: LegislatorContact[] = legislatorsRes.data;
        setLegislatorContacts(nextLegislators);
        setSelectedBioguides(
          nextLegislators
            .filter(l => l.form.status === "ok")
            .map(l => l.legislator.bioguideId)
        );
        props.onLegislatorContactsLoaded(nextLegislators);
        setLegislatorsLoadingState(LoadingState.Success);
      } catch (e) {
        setLegislatorsLoadingState(LoadingState.Error);
        // TODO: show error message
      }
    }

    fetchLegislators();
  }, [props.messageSenderAddress]);

  // submit handler
  let history = useHistory();
  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    history.push("/message");
  }

  if (
    legislatorsLoadingState === LoadingState.Success ||
    legislatorsLoadingState === LoadingState.SuccessCached
  ) {
    return (
      <div className="col-md-10 mx-auto">
        <Whitebox
          id="pick-legislators"
          showBackButton={true}
          onClickBackButton={() => history.push("/")}
        >
          <form onSubmit={handleSubmit}>
            <p>Choose which representatives you'd like to write to:</p>

            <div className="my-2">
              {legislatorContacts.map(legislatorContact => {
                const inputID = `selectedLegislator-${legislatorContact.legislator.bioguideId}`;
                return (
                  <div
                    key={legislatorContact.legislator.bioguideId}
                    className="repOption checkbox py-1"
                  >
                    <input
                      type="checkbox"
                      id={inputID}
                      checked={selectedBioguides.includes(
                        legislatorContact.legislator.bioguideId
                      )}
                      disabled={legislatorContact.form.status !== "ok"}
                      onChange={() =>
                        toggleSelectedBioguideId(
                          legislatorContact.legislator.bioguideId
                        )
                      }
                    />
                    <label htmlFor={inputID}>
                      <span className="ml-1">
                        {legislatorTitle(legislatorContact)}{" "}
                        {legislatorContact.legislator.firstName}{" "}
                        {legislatorContact.legislator.lastName}
                      </span>
                    </label>
                  </div>
                );
              })}
            </div>

            <button
              type="submit"
              className="btn btn-lg btn-outline-primary"
              disabled={selectedBioguides.length === 0}
            >
              Write to them!
            </button>
          </form>
        </Whitebox>
      </div>
    );
  } else if (legislatorsLoadingState === LoadingState.Loading) {
    return (
      <div className="col-md-9 mx-auto">
        <Whitebox id="pick-legislators" showBackButton={false}>
          <LoadingSpinner />
          <p>Finding your representatives ...</p>
        </Whitebox>
      </div>
    );
  } else {
    return (
      <div className="col-md-9 mx-auto">
        <Whitebox
          id="pick-legislators"
          showBackButton={true}
          onClickBackButton={() => history.push("/")}
        >
          An error occurred with the service. Please try again later
        </Whitebox>
      </div>
    );
  }
}

function legislatorTitle(legislatorContact: LegislatorContact) {
  const term = legislatorContact.legislator.currentTerm;
  if (term.chamber === "senate") {
    return "Sen.";
  } else {
    return "Rep.";
  }
}
