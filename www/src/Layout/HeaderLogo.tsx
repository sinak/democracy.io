import React from "react";
import { ReactComponent as DIOLogoSVG } from "./DIO_Logo.svg";
import { Link } from "react-router-dom";
export default function HeaderLogo() {
  return (
    <div id="header" className="mx-auto py-3" style={{ width: 250 }}>
      <Link to="/">
        <div className="logo animated">
          <DIOLogoSVG />
        </div>
      </Link>
    </div>
  );
}
