import React, { useState, FormEvent, useEffect } from "react";
import { CanonicalAddress, Legislator, Message } from "../../../server/Models";
import LoadingState from "../LoadingState";
import { Redirect, useHistory } from "react-router-dom";
import Whitebox from "./Whitebox";
import { ReactComponent as LoadingSpinner } from "../svg/LoadingSpinner.svg";

interface LegislatorPickerProps {
  legislators: Legislator[];
  legislatorsLoadingState: LoadingState;
  selectedBioguides: string[];
  onSubmit: (selectedBioguides: string[]) => void;
}

export default function LegislatorPickerForm(props: LegislatorPickerProps) {
  // legislator picker
  const [selectedBioguides, setSelectedBioguides] = useState(
    props.selectedBioguides
  );
  const [isSubmitted, setIsSubmitted] = useState(false);
  let history = useHistory();

  useEffect(() => {
    setSelectedBioguides(props.selectedBioguides);
  }, [props.selectedBioguides]);

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

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    props.onSubmit(selectedBioguides);
    setIsSubmitted(true);
  }

  if (props.legislatorsLoadingState === LoadingState.Success) {
    return (
      <Whitebox
        id="pick-legislators"
        className="col-sm-9 col-md-8 col-md-offset-3"
        showBackButton={true}
        onClickBackButton={() => history.push("/")}
      >
        {isSubmitted ? <Redirect push to="/message" /> : null}

        <form onSubmit={handleSubmit}>
          <p>Choose which representatives you'd like to write to:</p>

          {props.legislators.map(legislator => {
            const inputID = `selectedLegislator-${legislator.bioguideId}`;
            return (
              <div className="repOption checkbox">
                <input
                  type="checkbox"
                  id={inputID}
                  checked={selectedBioguides.includes(legislator.bioguideId)}
                  disabled={legislator.formStatus !== "ok"}
                  onChange={() =>
                    toggleSelectedBioguideId(legislator.bioguideId)
                  }
                ></input>
                <label htmlFor={inputID}>
                  {legislatorTitle(legislator)} {legislator.firstName}{" "}
                  {legislator.lastName}
                </label>
              </div>
            );
          })}

          <button type="submit" className="btn btn-lg btn-orange">
            Write to them!
          </button>
        </form>
      </Whitebox>
    );
  } else if (props.legislatorsLoadingState === LoadingState.Loading) {
    return (
      <Whitebox
        id="pick-legislators"
        className="col-sm-9 col-md-8 col-md-offset-3"
        showBackButton={false}
      >
        <LoadingSpinner />
        <p>Finding your representatives ...</p>
      </Whitebox>
    );
  } else {
    return <div>error</div>;
  }
}

function legislatorTitle(legislator: Legislator) {
  if (legislator.chamber === "senate") {
    return "Sen.";
  } else {
    return "Rep.";
  }
}
