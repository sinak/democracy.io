type ClarityValue = string | string[];
type ClarityCommand = ((command: string, ...args: ClarityValue[]) => void) & {
  q?: ClarityValue[][];
};

type WindowWithClarity = Window & {
  clarity?: ClarityCommand;
};

const CLARITY_PROJECT_ID_PATTERN = /^[a-z0-9]+$/i;

function getClarity() {
  if (typeof window === 'undefined') return undefined;
  return (window as WindowWithClarity).clarity;
}

export function initMicrosoftClarity(projectId: string | undefined) {
  const clarityProjectId = projectId?.trim();
  if (!clarityProjectId) return;

  if (!CLARITY_PROJECT_ID_PATTERN.test(clarityProjectId)) {
    console.error('Clarity init skipped: invalid project ID.');
    return;
  }

  try {
    const clarityWindow = window as WindowWithClarity;

    if (!clarityWindow.clarity) {
      clarityWindow.clarity = function clarityQueue(command: string, ...args: ClarityValue[]) {
        (clarityWindow.clarity!.q = clarityWindow.clarity!.q || []).push([command, ...args]);
      };
    }

    if (document.querySelector(`script[data-clarity-project-id="${clarityProjectId}"]`)) {
      return;
    }

    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.clarity.ms/tag/${clarityProjectId}`;
    script.dataset.clarityProjectId = clarityProjectId;

    const firstScript = document.getElementsByTagName('script')[0];
    if (firstScript?.parentNode) {
      firstScript.parentNode.insertBefore(script, firstScript);
    } else {
      document.head.appendChild(script);
    }
  } catch (err) {
    // Never let analytics initialization break the app.
    console.error('Clarity init failed:', err);
  }
}

export function setClarityTag(key: string, value: ClarityValue) {
  getClarity()?.('set', key, value);
}

export function trackClarityEvent(eventName: string) {
  getClarity()?.('event', eventName);
}

export function upgradeClaritySession(reason: string) {
  getClarity()?.('upgrade', reason);
}
