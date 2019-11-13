import React, { useRef, useState, useEffect } from "react";
import { Route, useLocation, Link } from "react-router-dom";
import Footer from "./Footer";
import Form from "./Form";
import HomeBottom from "./HomePage/HomePage";
import LegacyAnimationWrapper from "./LegacyAnimationWrapper";
import { ReactComponent as DIOLogoSVG } from "./svg/DIO_Logo.svg";
import { ReactComponent as EFFLogoSVG } from "./svg/EFF_Logo.svg";

const App: React.FC = () => {
  return (
    <LegacyAnimationWrapper>
      <div className="main">
        <Logo />

        <div id="form-content">
          <Form />
        </div>

        <Route exact path="/"></Route>
      </div>

      <Route exact path="/">
        <HomeBottom />
      </Route>

      <Footer />
    </LegacyAnimationWrapper>
  );
};

function Logo() {
  return (
    <div id="header" className="mx-auto my-3" style={{ width: 250 }}>
      <Link to="/">
        <div className="logo animated">
          <DIOLogoSVG />
        </div>
      </Link>
    </div>
  );
}

export default App;
