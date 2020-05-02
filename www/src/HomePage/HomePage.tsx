import React, { useEffect, useState } from "react";
import { ReactComponent as PlaneSVG } from "./Plane.svg";
import { ReactComponent as ChatSVG } from "./Chat.svg";
import { ReactComponent as SpeakerSVG } from "./Speaker.svg";
import { ReactComponent as EFFLogoSVG } from "./EFFLogo.svg";
import { ReactComponent as DIOLogoSVG } from "./DIOLogo.svg";
import HomePageVideo from "./HomePageVideo";
import { useInView } from "react-intersection-observer";
import classNames from "classnames";

export default function () {
  const [isOpen, setIsOpen] = useState(false);
  useEffect(() => {
    if (isOpen === true) {
      document
        .getElementById("about")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [isOpen]);
  return (
    <div>
      <HomePageVideo />

      <div
        id="about-lead"
        className="bg-primary"
        style={{
          backgroundColor: "#F93469",
          background: "linear-gradient(to right,#f85628,#F93469)",
        }}
      >
        <div className="container">
          <div className="col-md-10 mx-auto py-5">
            <h2
              className="mt-0 text-white text-center serif"
              style={{ lineHeight: 1.6, fontSize: "2.25rem" }}
            >
              Democracy thrives when people’s voices are heard. The easier it is
              for you to contact Congress, the better. It’s that simple.
            </h2>
            <div className="text-center" id="showAbout">
              <button
                className="btn btn-lg btn-outline"
                onClick={() => setIsOpen(true)}
              >
                Read more <i className="icon-angle-down" />
              </button>
            </div>
          </div>
        </div>

        <div
          id="about"
          className="py-5 font-weight-normal"
          style={{ display: isOpen ? "block" : "none" }}
        >
          <div className="container">
            <div className="row">
              <div
                className="col-lg-8 offset-lg-2 h5"
                style={{ lineHeight: 1.6 }}
              >
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

            <div>
              <div className="col-lg-11">
                <div className="row align-items-center">
                  <div className="col-lg-4 hidden-xs">
                    <IconAnimateInViewport
                      svgComponent={PlaneSVG}
                      id="icon-plane"
                      width={"100%"}
                    />
                  </div>
                  <div className="col-lg-8 my-4">
                    <h2 className="serif text-center my-4">
                      Simple and easy to use
                    </h2>
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
                        specific topic. We let you tell Congress exactly what’s
                        on your mind.
                      </li>
                      <li>
                        <strong>Free software.</strong> All our code is licensed
                        under the{" "}
                        <a
                          href="https://github.com/sinak/democracy.io/blob/master/LICENSE"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          AGPL
                        </a>
                        , which means people can create new versions with
                        different features and continue to improve on our
                        original idea.
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="row align-items-center">
                  <div className="col-md-8 align-items-center">
                    <h2 className="serif text-center my-4">
                      We don’t tell people what to say
                    </h2>
                    <p>
                      This project is hosted by the{" "}
                      <a href="https://taskforce.is">Taskforce.is</a>, but it’s
                      a neutral tool. We don’t control or influence the messages
                      that are sent through Democracy.io. We’re committed to
                      free speech, and we support the free speech rights of our
                      users.
                    </p>
                    <p>
                      Sometimes we may oppose what people choose to tell their
                      legislators. Even in those cases, we won’t censor what
                      individuals choose to say. We think society benefits from
                      a plurality of voices speaking on a broad range of topics,
                      and as a free speech organization this is a value we hold
                      dear, even if we disagree with the message.
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
                  <div className="col-md-4 d-none d-md-flex align-items-center">
                    <IconAnimateInViewport
                      svgComponent={ChatSVG}
                      id="icon-chat"
                      width={"100%"}
                    />
                  </div>
                </div>

                <div className="row align-items-center">
                  <div className="col-md-4">
                    <IconAnimateInViewport
                      svgComponent={SpeakerSVG}
                      id="icon-speaker"
                      width={"100%"}
                    />
                  </div>
                  <div className="col-md-8 my-4">
                    <h2 className="serif my-4 text-center">
                      Why we’re doing this.
                    </h2>
                    <p>
                      First, we want contacting your elected officials to be
                      easy. Then more people will do it. And that’s good for
                      democracy.
                    </p>
                    <p>
                      We also want to show off the functionality of the tools
                      Taskforce.is has been creating over the last several
                      years. We are working from the{" "}
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
                      Internet users contact elected officials and other
                      decision makers.
                    </p>
                    <p>
                      Democracy.io lets you test out one of these tools—emailing
                      members of Congress—but we’re also creating simple ways to
                      send Tweets to members of Congress, call Congress, sign
                      petitions, and submit official comments to government
                      agencies. If you’re an advocacy organization that likes
                      how this works, check out our{" "}
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
                <div className="row my-4 align-items-center">
                  <div className="col-md-8">
                    <h2 className="serif my-4 text-center">
                      Who is behind this project
                    </h2>
                    <p>
                      Democracy.io was built by three amazing programmers who
                      want to make the world a better place—
                      <a href="https://twitter.com/sinak">
                        Sina Khanifar
                      </a>, <a href="http://l12s.com">Leah Jones</a>, and{" "}
                      <a href="https://twitter.com/randylubin/">Randy Lubin</a>,
                      as part of a project for the Electronic Frontier
                      Foundation. It’s maintained by{" "}
                      <a href="https://taskforce.is">Taskforce.is</a>.
                    </p>
                    <p>
                      The backend system that delivers these messages to
                      Congress was written by EFF employee{" "}
                      <a href="https://twitter.com/legind">William Budington</a>
                      . The{" "}
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

                  <div className="col-md-4">
                    <IconAnimateInViewport
                      svgComponent={EFFLogoSVG}
                      id="icon-eff"
                    />
                  </div>
                </div>
                <div className="row align-items-center">
                  <div className="col-md-6 hidden-xs hidden-sm justify-center">
                    <div className="mx-auto" style={{ maxWidth: "80%" }}>
                      <IconAnimateInViewport
                        svgComponent={DIOLogoSVG}
                        id="icon-logo"
                      />
                    </div>
                  </div>

                  <div className="col-md-6">
                    <h2 className="serif text-center my-4">
                      Jump in, change the world.
                    </h2>
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
    </div>
  );
}

function IconAnimateInViewport(
  props: {
    svgComponent: React.SFC<React.SVGProps<SVGSVGElement>>;
  } & React.SVGProps<SVGSVGElement>
) {
  const [ref, inView, _entry] = useInView({ triggerOnce: true, threshold: 1 });
  const className = classNames(props.className, { "icon-enter": inView });
  return (
    <div>
      <props.svgComponent {...props} ref={ref} className={className} />
    </div>
  );
}
