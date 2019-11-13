import React, { ReactElement } from "react";

interface WhiteboxProps {
  footer?: ReactElement;
  className?: string;
  id?: string;
  showBackButton: boolean;
  onClickBackButton?: () => void;
}

/**
 * whitebox component
 * classNames are merged onto the parent div
 * @param props
 */
const Whitebox: React.FC<WhiteboxProps> = props => {
  const backButton = props.showBackButton ? (
    <button
      className="btn-sm back-button float-right"
      onClick={props.onClickBackButton}
    >
      Go back
    </button>
  ) : null;
  return (
    <div id={props.id} className={"whitebox " + props.className}>
      {backButton}
      <div className="whitebox-container">{props.children}</div>
      {props.footer ? (
        <div className="whitebox-footer">{props.footer}</div>
      ) : null}
    </div>
  );
};

export default Whitebox;
