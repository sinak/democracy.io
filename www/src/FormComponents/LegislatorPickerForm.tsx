import React, { FormEvent, useEffect, useState } from "react";
import { Redirect, useHistory } from "react-router-dom";
import { Legislator } from "../../../server/Models";
import LoadingState from "../LoadingState";
import { ReactComponent as LoadingSpinner } from "../svg/LoadingSpinner.svg";
import Whitebox from "./Whitebox";

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
      <div className="col-md-10 mx-auto">
        <Whitebox
          id="pick-legislators"
          showBackButton={true}
          onClickBackButton={() => history.push("/")}
        >
          {isSubmitted ? <Redirect push to="/message" /> : null}

          <form onSubmit={handleSubmit}>
            <p>Choose which representatives you'd like to write to:</p>

            <div className="my-2">
              {props.legislators.map(legislator => {
                const inputID = `selectedLegislator-${legislator.bioguideId}`;
                return (
                  <div className="repOption checkbox py-1">
                    <input
                      type="checkbox"
                      id={inputID}
                      checked={selectedBioguides.includes(
                        legislator.bioguideId
                      )}
                      disabled={legislator.formStatus !== "ok"}
                      onChange={() =>
                        toggleSelectedBioguideId(legislator.bioguideId)
                      }
                    ></input>
                    <label htmlFor={inputID}>
                      <span className="ml-1">
                        {legislatorTitle(legislator)} {legislator.firstName}{" "}
                        {legislator.lastName}
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
  } else if (props.legislatorsLoadingState === LoadingState.Loading) {
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

function legislatorTitle(legislator: Legislator) {
  if (legislator.chamber === "senate") {
    return "Sen.";
  } else {
    return "Rep.";
  }
}
