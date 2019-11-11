import React from "react";
import { Route } from "react-router-dom";
import Footer from "./Footer";
import Form from "./Form";
import HomeBottom from "./Layout/HomeBottom";
import LegacyAnimationWrapper from "./LegacyAnimationWrapper";
import { ReactComponent as DIOLogoSVG } from "./svg/DIO_Logo.svg";

const App: React.FC = () => {
  return (
    <LegacyAnimationWrapper>
      <div className="main">
        <Logo />
        <Form />
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
    <nav className="navbar navbar-static">
      <div className="container">
        <div className="navbar-header">
          <div className="navbar-brand">
            <a href="/">
              <div className="logo animated">
                <DIOLogoSVG />
              </div>
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default App;
