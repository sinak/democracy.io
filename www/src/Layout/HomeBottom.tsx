// requires IntersectionObserver polyfill

import * as React from "react";
import { ReactComponent as PlaneSVG } from "./Plane.svg";
import { ReactComponent as ChatSVG } from "./Chat.svg";
import { ReactComponent as SpeakerSVG } from "./Speaker.svg";
import BrowserHeaderPNG from "./../images/browser-header.png";
import { useInView } from "react-intersection-observer";
import classNames from "classnames";

export default function() {
  const [ref, inView] = useInView({ threshold: 0, triggerOnce: true });
  return (
    <div id="whydio">
      <div className="container">
        <div className="row">
          <div
            ref={ref}
            id="video-container"
            className={classNames(
              "col-sm-12 col-md-10 col-md-offset-1 col-lg-8 col-lg-offset-2",
              { "ng-enter": inView }
            )}
          >
            <h2>Why we built Democracy.io</h2>
            <div>
              <img className="img-responsive" src={BrowserHeaderPNG} alt="" />
              <video id="video" controls width="100%">
                <source src="//d1cv406lx4hgxd.cloudfront.net/dio-1.2.1c.mp4" />
                Your browser does not support HTML5 video.
              </video>
            </div>
          </div>
        </div>
      </div>
      <div id="about-lead">
        <div className="container">
          <div className="row">
            <div className="col-md-10 col-md-offset-1">
              <h2>
                Democracy thrives when people’s voices are heard. The easier it
                is for you to contact Congress, the better. It’s that simple.
              </h2>
              <div className="text-center" id="showAbout">
                <button
                  className="btn btn-lg btn-outline"
                  ng-click="showAbout()"
                >
                  Read more <i className="icon-angle-down" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div id="about" className="hidden">
        <div className="lead">
          <div className="container">
            <div className="row">
              <div className="col-md-8 col-md-offset-2">
                <p>
                  Failure to effectively reach members of Congress has
                  disastrous consequences. Studies show that politicians{" "}
                  <a href="http://www.vanderbilt.edu/csdi/miller-stokes/08_MillerStokes_BroockmanSkovron.pdf">
                    {" "}
                    fundamentally misconceive
                  </a>{" "}
                  their constituents’ views, making it harder for them to
                  represent us in the lawmaking process.
                </p>
                <p>
                  That’s why we built Democracy.io: a new tool to put you in
                  touch with your members of Congress—with as few clicks as
                  possible.
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="container">
          <div className="row">
            <div className="col-md-10 col-md-offset-1">
              <div className="row">
                <div className="col-md-4 hidden-xs hidden-sm v-center">
                  <PlaneSVG />
                </div>
                <div className="col-md-8 v-center">
                  <h2>Simple and easy to use</h2>
                  <p>
                    We make it possible for you to email your two senators and
                    representative through a single website. You submit one
                    message—not three different messages on three different
                    forms on three different websites.
                  </p>
                  <p>Some key features:</p>
                  <ul>
                    <li>
                      <strong>
                        All your senators and representatives on one website.
                      </strong>
                    </li>
                    <li>
                      <strong>Say whatever you want.</strong> Many activism
                      platforms want you to send a pre-written message about a
                      specific topic. We let you tell Congress exactly what’s on
                      your mind.
                    </li>
                    <li>
                      <strong>Free software.</strong> All our code is licensed
                      under the{" "}
                      <a
                        href="https://github.com/sinak/democracy.io/blob/master/LICENSE"
                        target="_blank"
                      >
                        AGPL
                      </a>
                      , which means people can create new versions with
                      different features and continue to improve on our original
                      idea.
                    </li>
                  </ul>
                </div>
              </div>
              <div className="row">
                <div className="col-md-8 v-center">
                  <h2>We don’t tell people what to say</h2>
                  <p>
                    This project is hosted by the{" "}
                    <a href="https://taskforce.is">Taskforce.is</a>, but it’s a
                    neutral tool. We don’t control or influence the messages
                    that are sent through Democracy.io. We’re committed to free
                    speech, and we support the free speech rights of our users.
                  </p>
                  <p>
                    Sometimes we may oppose what people choose to tell their
                    legislators. Even in those cases, we won’t censor what
                    individuals choose to say. We think society benefits from a
                    plurality of voices speaking on a broad range of topics, and
                    as a free speech organization this is a value we hold dear,
                    even if we disagree with the message.
                  </p>
                  <p>
                    While we have tried to make the best tool we can, please
                    understand that Democracy.io may have bugs or other
                    technical issues, and is offered without any warranty;
                    without even the implied warranty of merchantability or
                    fitness for a particular purpose. See the{" "}
                    <a href="https://github.com/sinak/democracy.io/blob/master/LICENSE">
                      license
                    </a>{" "}
                    for more details.
                  </p>
                </div>
                <div className="col-md-4 hidden-xs hidden-sm v-center">
                  <ChatSVG />
                </div>
              </div>
              <div className="row">
                <div className="col-md-4 hidden-xs  hidden-sm v-center">
                  <SpeakerSVG />
                </div>
                <div className="col-md-8 v-center">
                  <h2>Why we’re doing this.</h2>
                  <p>
                    First, we want contacting your elected officials to be easy.
                    Then more people will do it. And that’s good for democracy.
                  </p>
                  <p>
                    We also want to show off the functionality of the tools
                    Taskforce.is has been creating over the last several years.
                    We are working from the{" "}
                    <a href="https://github.com/unitedstates/contact-congress">
                      contact-congress
                    </a>{" "}
                    dataset originally created by the{" "}
                    <a href="http://www.participatorypolitics.org/">
                      Participatory Politics Foundation
                    </a>{" "}
                    and later adopted by and improved upon by{" "}
                    <a href="http://sunlightfoundation.com/">
                      the Sunlight Foundation
                    </a>
                    , EFF, and several collaborating organizations. Together,
                    we’ve been working on a large-scale project to improve how
                    Internet users contact elected officials and other decision
                    makers.
                  </p>
                  <p>
                    Democracy.io lets you test out one of these tools—emailing
                    members of Congress—but we’re also creating simple ways to
                    send Tweets to members of Congress, call Congress, sign
                    petitions, and submit official comments to government
                    agencies. If you’re an advocacy organization that likes how
                    this works, check out our{" "}
                    <a href="https://github.com/tfrce"> Github page</a> and
                    contact{" "}
                    <a
                      href="mailto:contact@democracy.io?Subject=Democracy.io"
                      target="_top"
                    >
                      contact@democracy.io
                    </a>{" "}
                    to discuss whether these free software, user-focused tools
                    are a good solution for your advocacy needs.
                  </p>
                </div>
              </div>
              <div className="row">
                <div className="col-md-8 v-center">
                  <h2>Who is behind this project</h2>
                  <p>
                    Democracy.io was built by three amazing programmers who want
                    to make the world a better place—
                    <a href="https://twitter.com/sinak">Sina Khanifar</a>,{" "}
                    <a href="http://l12s.com">Leah Jones</a>, and{" "}
                    <a href="https://twitter.com/randylubin/">Randy Lubin</a>,
                    as part of a project for the Electronic Frontier Foundation.
                    It’s maintained by{" "}
                    <a href="https://taskforce.is">Taskforce.is</a>.
                  </p>
                  <p>
                    The backend system that delivers these messages to Congress
                    was written by EFF employee{" "}
                    <a href="https://twitter.com/legind">William Budington</a>.
                    The{" "}
                    <a href="https://github.com/unitedstates/contact-congress">
                      contact-congress
                    </a>{" "}
                    dataset that was completed with help from{" "}
                    <a href="https://www.eff.org/deeplinks/2014/04/dear-web-developers-thank-you-youre-awesome-and-wow-did-really-just-happen">
                      {" "}
                      over 100 EFF volunteer web developers,
                    </a>{" "}
                    (and in particular{" "}
                    <a href="https://www.eff.org/about/volunteer-technologists">
                      {" "}
                      these five individuals
                    </a>
                    ). The dataset is now maintained by EFF, the Sunlight
                    Foundation, and Action Network.
                  </p>
                  <p>
                    Democracy.io is copyright (c) Taskforce.is and is licensed
                    under the GNU Affero General Public License, Version 3.
                  </p>
                </div>
                <div className="col-md-4 hidden-xs hidden-sm v-center"></div>
              </div>
              <div className="row">
                <div className="col-md-6 hidden-xs  hidden-sm v-center">
                  <svg
                    id="icon-logo"
                    className="img-responsive"
                    in-view="animate($event,$inview,$inviewpart)"
                    preserveAspectRatio="none"
                    viewBox="0 0 232 20"
                  >
                    <use
                      xmlnsXlink="http://www.w3.org/1999/xlink"
                      xlinkHref="#s-text"
                    />
                  </svg>
                </div>
                <div className="col-md-6  v-center">
                  <h2>Jump in, change the world.</h2>
                  <p>
                    Want to help with this and future technology projects? If
                    you’re a web developer who might want to occasionally
                    volunteer, send an email to{" "}
                    <a href="mailto:contact@democracy.io">
                      contact@democracy.io
                    </a>{" "}
                    and also sign up with{" "}
                    <a href="https://taskforce.is"> Taskforce</a>, a volunteer
                    group that works with EFF on many projects to make the
                    Internet more awesome and free.
                  </p>
                  <p>
                    We <i className="icon-heart" /> democracy.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
