import React, { Component } from "react";
import * as Sentry from "@sentry/browser";
import * as FormStateSessionStorage from "./FormStateSessionStorage";

export default class FormErrorBoundary extends Component<any, any> {
  constructor(props: any) {
    super(props);
    this.state = { eventId: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    Sentry.withScope(scope => {
      scope.setExtras(errorInfo);

      let debugData = FormStateSessionStorage.getRedactedDebugData();
      if (debugData) scope.setExtras(debugData);

      const eventId = Sentry.captureException(error);
      this.setState({ eventId });
    });
  }

  render() {
    if (this.state.hasError) {
      //render fallback UI
      return (
        <button
          onClick={() =>
            Sentry.showReportDialog({ eventId: this.state.eventId })
          }
        >
          Report feedback
        </button>
      );
    }

    //when there's not an error, render children untouched
    return this.props.children;
  }
}
