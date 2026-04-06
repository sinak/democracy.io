import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWizard } from '../context/WizardContext';
import { useApi } from '../hooks/useApi';
import { useStepGuard } from '../hooks/useStepGuard';
import { LoadingSpinner } from '../components/LoadingSpinner';

interface CaptchaItem {
  link?: string;
  uid?: string;
  bioguideId: string;
  answer: string;
  success: boolean;
  waiting: boolean;
}

export function Captcha() {
  useStepGuard(['responses']);

  const navigate = useNavigate();
  const api = useApi();
  const {
    messageResponses,
    emailCopyRequest,
    emailCopySent,
    setEmailCopySent,
  } = useWizard();

  const [captchas, setCaptchas] = useState<CaptchaItem[]>([]);
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    if (!messageResponses || messageResponses.length === 0) return;

    const items: CaptchaItem[] = messageResponses
      .filter((r) => r.url)
      .map((r) => ({
        link: r.url,
        uid: r.uid,
        bioguideId: r.bioguideId,
        answer: '',
        success: false,
        waiting: false,
      }));

    setCaptchas(items);
    setRemaining(items.length);
  }, []);

  const updateAnswer = (index: number, answer: string) => {
    setCaptchas((prev) => prev.map((c, i) => (i === index ? { ...c, answer } : c)));
  };

  const submitCaptcha = async (index: number) => {
    const captcha = captchas[index];
    if (!captcha.uid) return;

    setCaptchas((prev) => prev.map((c, i) => (i === index ? { ...c, waiting: true } : c)));

    try {
      const response = await api.submitCaptcha({
        bioguideId: captcha.bioguideId,
        answer: captcha.answer,
        uid: captcha.uid,
      });

      if (response.status === 'success') {
        setCaptchas((prev) =>
          prev.map((c, i) => (i === index ? { ...c, success: true, waiting: false } : c))
        );
        const newRemaining = remaining - 1;
        setRemaining(newRemaining);
        if (newRemaining === 0) {
          if (emailCopyRequest && !emailCopySent) {
            try {
              await api.sendMessageCopy(emailCopyRequest);
              setEmailCopySent(true);
            } catch (error) {
              console.warn('Sending the email copy failed.', error);
            }
          }
          navigate('/thanks');
        }
      } else {
        setCaptchas((prev) => prev.map((c, i) => (i === index ? { ...c, waiting: false } : c)));
      }
    } catch {
      setCaptchas((prev) => prev.map((c, i) => (i === index ? { ...c, waiting: false } : c)));
    }
  };

  if (captchas.length === 0) {
    return (
      <div className="row">
        <div className="whitebox col-md-10">
          <LoadingSpinner className="whitebox-container" message="This'll just take one moment ..." />
        </div>
      </div>
    );
  }

  return (
    <div className="row">
      <div className="whitebox col-md-10">
        <div className="whitebox-container">
          <p>
            Some legislators require that you complete a CAPTCHA to verify that you're really human.
            Type the CAPTCHA text into the form and click submit.
          </p>

          {captchas.map((captcha, index) =>
            captcha.success ? null : (
              <div key={index} id="captchaContainer">
                {captcha.waiting ? (
                  <LoadingSpinner
                    className=""
                    message="Submitting the CAPTCHA text."
                    secondaryMessage="This may take up to 90 seconds - thanks for being patient!"
                  />
                ) : (
                  <div>
                    <img
                      src={captcha.link}
                      alt="This is an image captcha. Unfortunately we cannot provide an audio based captcha at this time."
                    />
                    <div className="row">
                      <div className="col-sm-6">
                        <div className="form-group">
                          <label htmlFor={`captcha-${index}`}>Enter CAPTCHA text</label>
                          <input
                            id={`captcha-${index}`}
                            type="text"
                            className="form-control"
                            value={captcha.answer}
                            onChange={(e) => updateAnswer(index, e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                    <button
                      className="btn btn-orange btn-lg"
                      disabled={!captcha.answer}
                      onClick={() => submitCaptcha(index)}
                    >
                      Submit
                    </button>
                  </div>
                )}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
