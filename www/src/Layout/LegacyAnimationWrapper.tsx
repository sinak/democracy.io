import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router";

/**
 * Adds data attribute to wrapper with the current route name
 * and the previously visited route
 *
 * Previous Angular app animations were written in css that were dependent
 * on data attribute selectors. This component implements the same behaviour so we don't have to rewrite
 * the CSS
 *
 * @param props
 */
const LEGACY_PAGE_NAMES: { [key: string]: string } = {
  "/": "home",
  "/pick-legislators": "location",
  "/message": "compose"
};

export default function LegacyAnimationWrapper(props: {
  children: React.ReactNode;
}) {
  let location = useLocation();
  const [pageName, setPageName] = useState(
    LEGACY_PAGE_NAMES[location.pathname]
  );
  const [pageFrom, setPageFrom] = useState("new-visit");

  const isMounted = useRef(false);
  useEffect(() => {
    // don't run on initial mount
    if (isMounted.current) {
      setPageFrom(pageName);
      setPageName(LEGACY_PAGE_NAMES[location.pathname]);
    } else {
      isMounted.current = true;
    }
  }, [location]);

  return (
    <div id="wrapper" data-pagename={pageName} data-pagefrom={pageFrom}>
      {props.children}
    </div>
  );
}
