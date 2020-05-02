import React from "react";
import { Route } from "react-router-dom";
import Form from "./Form";
import HomeBottom from "./HomePage/HomePage";
import LegacyAnimationWrapper from "./Layout/LegacyAnimationWrapper";
import HeaderLogo from "./Layout/HeaderLogo";
import Footer from "./Layout/Footer";
import { BrowserRouter as Router } from "react-router-dom";
import PrivacyPolicyPage from "./Layout/PrivacyPolicy";

const App: React.FC = () => {
  return (
    <Router>
      <LegacyAnimationWrapper>
        <div className="main">
          <HeaderLogo />

          <Route path="/privacy-policy" component={PrivacyPolicyPage} />

          <div id="form-content">
            {navigator.userAgent === "ReactSnap" ? <></> : <Form />}
          </div>
        </div>

        <Route exact path="/">
          <HomeBottom />
        </Route>

        <Footer />
      </LegacyAnimationWrapper>
    </Router>
  );
};

export default App;
