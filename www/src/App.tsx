import React from "react";
import { Route } from "react-router-dom";
import Form from "./Form";
import HomeBottom from "./HomePage/HomePage";
import LegacyAnimationWrapper from "./Layout/LegacyAnimationWrapper";
import HeaderLogo from "./Layout/HeaderLogo";
import Footer from "./Layout/Footer";

const App: React.FC = () => {
  return (
    <LegacyAnimationWrapper>
      <div className="main">
        <HeaderLogo />

        <div id="form-content">
          <Form />
        </div>
      </div>

      <Route exact path="/">
        <HomeBottom />
      </Route>

      <Footer />
    </LegacyAnimationWrapper>
  );
};

export default App;
