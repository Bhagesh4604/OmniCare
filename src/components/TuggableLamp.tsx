import React, { useEffect, useRef } from 'react';
import './TuggableLamp.css';

declare const window: any;

const TuggableLamp = ({ onComplete }) => {
  const lampRef = useRef(null);

  useEffect(() => {
    const {
      gsap,
      gsap: { registerPlugin, set, to, timeline },
      MorphSVGPlugin,
      Draggable,
    } = window;

    if (!gsap || !Draggable || !MorphSVGPlugin) {
      console.error('GSAP, Draggable, or MorphSVGPlugin not found on window object');
      return;
    }

    registerPlugin(MorphSVGPlugin);

    const AUDIO = {
      CLICK: new Audio('https://assets.codepen.io/605876/click.mp3'),
    };

    const ON = lampRef.current.querySelector('#on');
    const OFF = lampRef.current.querySelector('#off');

    let startX;
    let startY;

    const PROXY = document.createElement('div');

    const CORDS = gsap.utils.toArray(lampRef.current.querySelectorAll('.cords path'));
    const CORD_DURATION = 0.1;
    const HIT = lampRef.current.querySelector('.lamp__hit');
    const DUMMY_CORD = lampRef.current.querySelector('.cord--dummy');
    const ENDX = DUMMY_CORD.getAttribute('x2');
    const ENDY = DUMMY_CORD.getAttribute('y2');
    const RESET = () => {
      set(PROXY, {
        x: ENDX,
        y: ENDY,
      });
    };
    RESET();

    const STATE = {
      ON: false,
    };

    const cordsElement = lampRef.current.querySelector('.cords');
    gsap.set([cordsElement, HIT], {
      x: -10,
    });

    gsap.set(lampRef.current.querySelectorAll('.lamp__eye'), {
      rotate: 180,
      transformOrigin: '50% 50%',
      yPercent: 50,
    });

    const CORD_TL = timeline({
      paused: true,
      onStart: () => {
        STATE.ON = !STATE.ON;
        lampRef.current.style.setProperty('--on', STATE.ON ? '1' : '0');
        lampRef.current.style.setProperty('--shade-hue', gsap.utils.random(0, 359));
        set(lampRef.current.querySelectorAll('.lamp__eye'), {
          rotate: STATE.ON ? 0 : 180,
        });

        set([DUMMY_CORD, HIT], { display: 'none' });
        set(CORDS[0], { display: 'block' });
        AUDIO.CLICK.play();
        if (STATE.ON) {
          ON.setAttribute('checked', true);
          OFF.removeAttribute('checked');
        } else {
          ON.removeAttribute('checked');
          OFF.setAttribute('checked', true);
        }
      },
      onComplete: () => {
        set([DUMMY_CORD, HIT], { display: 'block' });
        set(CORDS[0], { display: 'none' });
        RESET();
        // Call the onComplete prop to transition to the next page
        if (onComplete) {
          onComplete();
        }
      },
    });

    for (let i = 1; i < CORDS.length; i++) {
      CORD_TL.add(
        to(CORDS[0], {
          morphSVG: CORDS[i],
          duration: CORD_DURATION,
          repeat: 1,
          yoyo: true,
        })
      );
    }

    Draggable.create(HIT, {
      trigger: HIT,
      type: 'x,y',
      onPress: (e) => {
        startX = e.x;
        startY = e.y;
      },
      onDrag: function () {
        set(DUMMY_CORD, {
          attr: {
            x2: this.x,
            y2: Math.max(400, this.y),
          },
        });
      },
      onRelease: function (e) {
        const DISTX = Math.abs(e.x - startX);
        const DISTY = Math.abs(e.y - startY);
        const TRAVELLED = Math.sqrt(DISTX * DISTX + DISTY * DISTY);
        to(DUMMY_CORD, {
          attr: { x2: ENDX, y2: ENDY },
          duration: CORD_DURATION,
          onComplete: () => {
            if (TRAVELLED > 50) {
              CORD_TL.restart();
            } else {
              RESET();
            }
          },
        });
      },
    });

    gsap.set(lampRef.current.querySelector('.lamp'), { display: 'block' });
  }, [onComplete]);

  return (
    <div ref={lampRef}>
      <form>
        <input type="radio" id="on" name="status" value="on" />
        <label htmlFor="on">On</label>
        <input type="radio" id="off" name="status" value="off" />
        <label htmlFor="off">Off</label>
        <svg className="lamp" viewBox="0 0 333 484" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g className="lamp__shade shade">
            <ellipse className="shade__opening" cx="165" cy="220" rx="130" ry="20" />
            <ellipse className="shade__opening-shade" cx="165" cy="220" rx="130" ry="20" fill="url(#opening-shade)" />
          </g>
          <g className="lamp__base base">
            <path className="base__side" d="M165 464c44.183 0 80-8.954 80-20v-14h-22.869c-14.519-3.703-34.752-6-57.131-6-22.379 0-42.612 2.297-57.131 6H85v14c0 11.046 35.817 20 80 20z" />
            <path d="M165 464c44.183 0 80-8.954 80-20v-14h-22.869c-14.519-3.703-34.752-6-57.131-6-22.379 0-42.612 2.297-57.131 6H85v14c0 11.046 35.817 20 80 20z" fill="url(#side-shading)" />
            <ellipse className="base__top" cx="165" cy="430" rx="80" ry="20" />
            <ellipse cx="165" cy="430" rx="80" ry="20" fill="url(#base-shading)" />
          </g>
          <g className="lamp__post post">
            <path className="post__body" d="M180 142h-30v286c0 3.866 6.716 7 15 7 8.284 0 15-3.134 15-7V142z" />
            <path d="M180 142h-30v286c0 3.866 6.716 7 15 7 8.284 0 15-3.134 15-7V142z" fill="url(#post-shading)" />
          </g>
          <g className="lamp__cords cords">
            <path className="cord cord--rig" d="M124 187.033V347" strokeWidth="6" strokeLinecap="round" />
            <path className="cord cord--rig" d="M124 187.023s17.007 21.921 17.007 34.846c0 12.925-11.338 23.231-17.007 34.846-5.669 11.615-17.007 21.921-17.007 34.846 0 12.925 17.007 34.846 17.007 34.846" strokeWidth="6" strokeLinecap="round" />
            <path className="cord cord--rig" d="M124 187.017s-21.259 17.932-21.259 30.26c0 12.327 14.173 20.173 21.259 30.26 7.086 10.086 21.259 17.933 21.259 30.26 0 12.327-21.259 30.26-21.259 30.26" strokeWidth="6" strokeLinecap="round" />
            <path className="cord cord--rig" d="M124 187s29.763 8.644 29.763 20.735-19.842 13.823-29.763 20.734c-9.921 6.912-29.763 8.644-29.763 20.735S124 269.939 124 269.939" strokeWidth="6" strokeLinecap="round" />
            <path className="cord cord--rig" d="M124 187.029s-10.63 26.199-10.63 39.992c0 13.794 7.087 26.661 10.63 39.992 3.543 13.331 10.63 26.198 10.63 39.992 0 13.793-10.63 39.992-10.63 39.992" strokeWidth="6" strokeLinecap="round" />
            <path className="cord cord--rig" d="M124 187.033V347" strokeWidth="6" strokeLinecap="round" />
            <line className="cord cord--dummy" x1="124" y2="348" x2="124" y1="190" strokeWidth="6" strokeLinecap="round" />
          </g>
          <path className="lamp__light" d="M290.5 193H39L0 463.5c0 11.046 75.478 20 165.5 20s167-11.954 167-23l-42-267.5z" fill="url(#light)" />
          <g className="lamp__top top">
            <path className="top__body" fillRule="evenodd" clipRule="evenodd" d="M164.859 0c55.229 0 100 8.954 100 20l29.859 199.06C291.529 208.451 234.609 200 164.859 200S38.189 208.451 35 219.06L64.859 20c0-11.046 44.772-20 100-20z" />
            <path className="top__shading" fillRule="evenodd" clipRule="evenodd" d="M164.859 0c55.229 0 100 8.954 100 20l29.859 199.06C291.529 208.451 234.609 200 164.859 200S38.189 208.451 35 219.06L64.859 20c0-11.046 44.772-20 100-20z" fill="url(#top-shading)" />
          </g>
          <g className="lamp__face face">
            <g className="lamp__mouth">
              <path d="M165 178c19.882 0 36-16.118 36-36h-72c0 19.882 16.118 36 36 36z" fill="#141414" />
              <clipPath className="lamp__feature" id="mouth" x="129" y="142" width="72" height="36">
                <path d="M165 178c19.882 0 36-16.118 36-36h-72c0 19.882 16.118 36 36 36z" fill="#141414" />
              </clipPath>
              <g clipPath="url(#mouth)">
                <circle className="lamp__tongue" cx="179.4" cy="172.6" r="18" />
              </g>
            </g>
            <g className="lamp__eyes">
              <path className="lamp__eye lamp__stroke" d="M115 135c0-5.523-5.82-10-13-10s-13 4.477-13 10" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
              <path className="lamp__eye lamp__stroke" d="M241 135c0-5.523-5.82-10-13-10s-13 4.477-13 10" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
            </g>
          </g>
          <defs>
            <linearGradient id="opening-shade" x1="35" y1="220" x2="295" y2="220" gradientUnits="userSpaceOnUse">
              <stop />
              <stop offset="1" stopColor="var(--shade)" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="base-shading" x1="85" y1="444" x2="245" y2="444" gradientUnits="userSpaceOnUse">
              <stop stopColor="var(--b-1)" />
              <stop offset="0.8" stopColor="var(--b-2)" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="side-shading" x1="119" y1="430" x2="245" y2="430" gradientUnits="userSpaceOnUse">
              <stop stopColor="var(--b-3)" />
              <stop offset="1" stopColor="var(--b-4)" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="post-shading" x1="150" y1="288" x2="180" y2="288" gradientUnits="userSpaceOnUse">
              <stop stopColor="var(--b-1)" />
              <stop offset="1" stopColor="var(--b-2)" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="light" x1="165.5" y1="218.5" x2="165.5" y2="483.5" gradientUnits="userSpaceOnUse">
              <stop stopColor="var(--l-1)" stopOpacity=".2" />
              <stop offset="1" stopColor="var(--l-2)" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="top-shading" x1="56" y1="110" x2="295" y2="110" gradientUnits="userSpaceOnUse">
              <stop stopColor="var(--t-1)" stopOpacity=".8" />
              <stop offset="1" stopColor="var(--t-2)" stopOpacity="0" />
            </linearGradient>
          </defs>
          <circle className="lamp__hit" cx="124" cy="347" r="66" fill="#C4C4C4" fillOpacity=".1" />
        </svg>
      </form>
    </div>
  );
};

export default TuggableLamp;
