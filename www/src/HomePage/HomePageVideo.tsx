// requires IntersectionObserver polyfill

import React, { useRef, useEffect } from "react";
import { useInView } from "react-intersection-observer";
import classNames from "classnames";
import BrowserHeaderPNG from "./browser-header.png";

export default function HomePageVideo() {
  const [ref, inView] = useInView({ threshold: 1, triggerOnce: true });
  const videoRef = useRef<HTMLVideoElement | null>(null);

  return (
    <div className="bg-white border-top border-bottom">
      <div className="container py-5">
        <div className="row">
          <div
            ref={ref}
            id="video-container"
            className={classNames("col-lg-8 mx-auto", {
              "ng-enter": inView,
            })}
          >
            <h2 className="mb-4 serif h2 text-center">
              Why we built Democracy.io
            </h2>
            <div>
              <img className="img-fluid" src={BrowserHeaderPNG} alt="" />
              <video id="video" controls width="100%" ref={videoRef}>
                <source src="//d1cv406lx4hgxd.cloudfront.net/dio-1.2.1c.mp4" />
                Your browser does not support HTML5 video.
              </video>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
