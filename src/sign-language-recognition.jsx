import * as tf from "@tensorflow/tfjs";
import { loadGraphModel } from "@tensorflow/tfjs-converter";
import { FilesetResolver, HandLandmarker } from "@mediapipe/tasks-vision";
import { drawConnectors, drawLandmarks, lerp } from "@mediapipe/drawing_utils";
import clsx from "clsx";
import { ControlPanel, SourcePicker } from "@mediapipe/control_utils";
import {
  Holistic,
  VERSION,
  POSE_LANDMARKS,
  HAND_CONNECTIONS,
} from "@mediapipe/holistic";
import { useRef, useState } from "react";
import { useEffect } from "react";

// https://stackoverflow.com/a/71977235/3453896
function slice(arr, start, end, step = 1) {
  return arr
    .slice(start, end)
    .reduce((acc, e, i) => (i % step == 0 ? [...acc, e] : acc), []);
}

function argmax(arr) {
  const index = arr.reduce((iMax, x, i, arr) => (x > arr[iMax] ? i : iMax), 0);
  return [index, arr[index]];
}

const klass2index = {
  TV: 0,
  after: 1,
  airplane: 2,
  all: 3,
  alligator: 4,
  animal: 5,
  another: 6,
  any: 7,
  apple: 8,
  arm: 9,
  aunt: 10,
  awake: 11,
  backyard: 12,
  bad: 13,
  balloon: 14,
  bath: 15,
  because: 16,
  bed: 17,
  bedroom: 18,
  bee: 19,
  before: 20,
  beside: 21,
  better: 22,
  bird: 23,
  black: 24,
  blow: 25,
  blue: 26,
  boat: 27,
  book: 28,
  boy: 29,
  brother: 30,
  brown: 31,
  bug: 32,
  bye: 33,
  callonphone: 34,
  can: 35,
  car: 36,
  carrot: 37,
  cat: 38,
  cereal: 39,
  chair: 40,
  cheek: 41,
  child: 42,
  chin: 43,
  chocolate: 44,
  clean: 45,
  close: 46,
  closet: 47,
  cloud: 48,
  clown: 49,
  cow: 50,
  cowboy: 51,
  cry: 52,
  cut: 53,
  cute: 54,
  dad: 55,
  dance: 56,
  dirty: 57,
  dog: 58,
  doll: 59,
  donkey: 60,
  down: 61,
  drawer: 62,
  drink: 63,
  drop: 64,
  dry: 65,
  dryer: 66,
  duck: 67,
  ear: 68,
  elephant: 69,
  empty: 70,
  every: 71,
  eye: 72,
  face: 73,
  fall: 74,
  farm: 75,
  fast: 76,
  feet: 77,
  find: 78,
  fine: 79,
  finger: 80,
  finish: 81,
  fireman: 82,
  first: 83,
  fish: 84,
  flag: 85,
  flower: 86,
  food: 87,
  for: 88,
  frenchfries: 89,
  frog: 90,
  garbage: 91,
  gift: 92,
  giraffe: 93,
  girl: 94,
  give: 95,
  glasswindow: 96,
  go: 97,
  goose: 98,
  grandma: 99,
  grandpa: 100,
  grass: 101,
  green: 102,
  gum: 103,
  hair: 104,
  happy: 105,
  hat: 106,
  hate: 107,
  have: 108,
  haveto: 109,
  head: 110,
  hear: 111,
  helicopter: 112,
  hello: 113,
  hen: 114,
  hesheit: 115,
  hide: 116,
  high: 117,
  home: 118,
  horse: 119,
  hot: 120,
  hungry: 121,
  icecream: 122,
  if: 123,
  into: 124,
  jacket: 125,
  jeans: 126,
  jump: 127,
  kiss: 128,
  kitty: 129,
  lamp: 130,
  later: 131,
  like: 132,
  lion: 133,
  lips: 134,
  listen: 135,
  look: 136,
  loud: 137,
  mad: 138,
  make: 139,
  man: 140,
  many: 141,
  milk: 142,
  minemy: 143,
  mitten: 144,
  mom: 145,
  moon: 146,
  morning: 147,
  mouse: 148,
  mouth: 149,
  nap: 150,
  napkin: 151,
  night: 152,
  no: 153,
  noisy: 154,
  nose: 155,
  not: 156,
  now: 157,
  nuts: 158,
  old: 159,
  on: 160,
  open: 161,
  orange: 162,
  outside: 163,
  owie: 164,
  owl: 165,
  pajamas: 166,
  pen: 167,
  pencil: 168,
  penny: 169,
  person: 170,
  pig: 171,
  pizza: 172,
  please: 173,
  police: 174,
  pool: 175,
  potty: 176,
  pretend: 177,
  pretty: 178,
  puppy: 179,
  puzzle: 180,
  quiet: 181,
  radio: 182,
  rain: 183,
  read: 184,
  red: 185,
  refrigerator: 186,
  ride: 187,
  room: 188,
  sad: 189,
  same: 190,
  say: 191,
  scissors: 192,
  see: 193,
  shhh: 194,
  shirt: 195,
  shoe: 196,
  shower: 197,
  sick: 198,
  sleep: 199,
  sleepy: 200,
  smile: 201,
  snack: 202,
  snow: 203,
  stairs: 204,
  stay: 205,
  sticky: 206,
  store: 207,
  story: 208,
  stuck: 209,
  sun: 210,
  table: 211,
  talk: 212,
  taste: 213,
  thankyou: 214,
  that: 215,
  there: 216,
  think: 217,
  thirsty: 218,
  tiger: 219,
  time: 220,
  tomorrow: 221,
  tongue: 222,
  tooth: 223,
  toothbrush: 224,
  touch: 225,
  toy: 226,
  tree: 227,
  uncle: 228,
  underwear: 229,
  up: 230,
  vacuum: 231,
  wait: 232,
  wake: 233,
  water: 234,
  wet: 235,
  weus: 236,
  where: 237,
  white: 238,
  who: 239,
  why: 240,
  will: 241,
  wolf: 242,
  yellow: 243,
  yes: 244,
  yesterday: 245,
  yourself: 246,
  yucky: 247,
  zebra: 248,
  zipper: 249,
};

const index2klass = {};
Object.keys(klass2index).forEach((key) => {
  index2klass[klass2index[key]] = key;
});

function connect(ctx, connectors) {
  const canvas = ctx.canvas;
  for (const connector of connectors) {
    const from = connector[0];
    const to = connector[1];
    if (from && to) {
      if (
        from.visibility &&
        to.visibility &&
        (from.visibility < 0.1 || to.visibility < 0.1)
      ) {
        continue;
      }
      ctx.beginPath();
      ctx.moveTo(from.x * canvas.width, from.y * canvas.height);
      ctx.lineTo(to.x * canvas.width, to.y * canvas.height);
      ctx.stroke();
    }
  }
}

function SignLanguageRecognition() {
  const vision = useRef();
  const canvas = useRef();
  const canvasCtx = useRef();
  const handLandmarker = useRef();
  const controlsElement = useRef();
  const holistic = useRef();
  const model = useRef();
  const sampledFrames = useRef([]);
  const lastSampledTime = useRef();
  const sampleInterval = useRef(100);
  const numberOfSegments = useRef(20);
  const segmentsStride = useRef(1);

  const [start, setStart] = useState(false);
  const [_, setResults] = useState([]);
  const [bestResult, setBestResult] = useState(null);

  useEffect(() => {
    (async function () {
      vision.current = await FilesetResolver.forVisionTasks(
        "/assets/gislr/wasm"
      );
      handLandmarker.currrent = await HandLandmarker.createFromOptions(
        vision.current,
        {
          baseOptions: {
            modelAssetPath: "/assets/gislr/hand_landmarker.task",
          },
          numHands: 2,
          runningMode: "video",
        }
      );
      const model_url = "/assets/gislr/jsmodel/model.json";
      model.current = await loadGraphModel(model_url);
    })();
  }, []);

  const onResults = async (results) => {
    canvasCtx.current.save();
    canvasCtx.current.clearRect(
      0,
      0,
      canvas.current.width,
      canvas.current.height
    );

    canvasCtx.current.drawImage(
      results.image,
      0,
      0,
      canvas.current.width,
      canvas.current.height
    );

    // Connect elbows to hands. Do this first so that the other graphics will draw
    // on top of these marks.
    canvasCtx.current.lineWidth = 5;
    if (results.poseLandmarks) {
      if (results.rightHandLandmarks) {
        canvasCtx.current.strokeStyle = "white";
        connect(canvasCtx.current, [
          [
            results.poseLandmarks[POSE_LANDMARKS.RIGHT_ELBOW],
            results.rightHandLandmarks[0],
          ],
        ]);
      }
      if (results.leftHandLandmarks) {
        canvasCtx.current.strokeStyle = "white";
        connect(canvasCtx.current, [
          [
            results.poseLandmarks[POSE_LANDMARKS.LEFT_ELBOW],
            results.leftHandLandmarks[0],
          ],
        ]);
      }
    }

    drawConnectors(
      canvasCtx.current,
      results.rightHandLandmarks,
      HAND_CONNECTIONS,
      { color: "white" }
    );
    drawLandmarks(canvasCtx.current, results.rightHandLandmarks, {
      color: "white",
      fillColor: "rgb(0,217,231)",
      lineWidth: 2,
      radius: (data) => {
        return lerp(data.from.z, -0.15, 0.1, 10, 1);
      },
    });
    drawConnectors(
      canvasCtx.current,
      results.leftHandLandmarks,
      HAND_CONNECTIONS,
      { color: "white" }
    );
    drawLandmarks(canvasCtx.current, results.leftHandLandmarks, {
      color: "white",
      fillColor: "rgb(255,138,0)",
      lineWidth: 2,
      radius: (data) => {
        return lerp(data, -0.15, 0.1, 10, 1);
      },
    });

    canvasCtx.current.restore();

    const now = Date.now();
    if (now - lastSampledTime.current < sampleInterval.current) {
      return;
    }

    lastSampledTime.current = Date.now();

    const face_index = results.faceLandmarks
      ? results.faceLandmarks.map((item) => [item.x, item.y, item.z])
      : Array(468).fill([0.0, 0.0, 0.0]);
    const lh_index = results.leftHandLandmarks
      ? results.leftHandLandmarks.map((item) => [item.x, item.y, item.z])
      : Array(21).fill([0.0, 0.0, 0.0]);
    const pose_index = results.poseLandmarks
      ? results.poseLandmarks.map((item) => [item.x, item.y, item.z])
      : Array(33).fill([0.0, 0.0, 0.0]);
    const rh_index = results.rightHandLandmarks
      ? results.rightHandLandmarks.map((item) => [item.x, item.y, item.z])
      : Array(21).fill([0.0, 0.0, 0.0]);
    let input = [].concat(face_index, lh_index, pose_index, rh_index);
    input = tf.tensor2d(input, [543, 3]);
    sampledFrames.current.push(input);
    // keep the last 100 frames
    sampledFrames.current = sampledFrames.current.slice(-100);
  };

  useEffect(() => {
    if (!start) {
      return;
    }

    setInterval(async () => {
      if (sampledFrames.current.length < 10) {
        return;
      }

      // slice 0 - 10, 0 - 20, ..., 0.60 frames and do inference
      const results = await Promise.all(
        [[numberOfSegments.current, segmentsStride.current]].map(
          async (item) => {
            const [start, step] = item;
            const input = tf.stack(
              slice(
                sampledFrames.current,
                sampledFrames.current.length - start,
                sampledFrames.current.length,
                step
              )
            );
            let output = await model.current.executeAsync(input);
            let probs = tf.softmax(output);
            probs = await probs.data();
            // output = await output.data();
            const [klass, prob] = argmax(probs);
            const humanKlass = index2klass[klass];
            return [klass, humanKlass, prob];
          }
        )
      );
      setResults(results);
      const [index, prob] = argmax(results.map((item) => item[2]));
      setBestResult(results[index]);
      if (prob > 0.4) {
        const result = results[index];
      }
    }, 1000);
  }, [start]);

  useEffect(() => {
    if (!start) {
      return;
    }
    canvasCtx.current = canvas.current.getContext("2d");
    holistic.current = new Holistic({
      locateFile: (file) => {
        return (
          `https://cdn.jsdelivr.net/npm/@mediapipe/holistic@` +
          `${VERSION}/${file}`
        );
      },
    });

    holistic.current.onResults(onResults);

    // fpsControl.current = new FPS();
    new ControlPanel(controlsElement.current, {
      selfieMode: true,
      modelComplexity: 1,
      smoothLandmarks: true,
      enableSegmentation: false,
      smoothSegmentation: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
      effect: "background",
    })
      .add([
        new SourcePicker({
          onSourceChanged: () => {
            holistic.current.reset();
          },
          onFrame: async (input, size) => {
            const aspect = size.height / size.width;
            let width, height;
            if (window.innerWidth > window.innerHeight) {
              height = window.innerHeight;
              width = height / aspect;
            } else {
              width = window.innerWidth;
              height = width * aspect;
            }
            canvas.current.width = width;
            canvas.current.height = height;
            await holistic.current.send({ image: input });
          },
        }),
      ])
      .on((options) => {
        activeEffect = options["effect"];
        holistic.current.setOptions(options);
      });
  }, [start]);

  const renderSelector = ({
    label,
    name,
    options,
    defaultValue,
    onChange,
    wrapperClass,
  }) => (
    <div className={clsx("relative", wrapperClass)}>
      <label
        htmlFor={name}
        className="absolute -top-2 left-2 inline-block bg-white px-1 text-xs font-medium text-gray-900"
      >
        {label}
      </label>
      <select
        type="text"
        name={name}
        id={name}
        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
        defaultValue={defaultValue}
        onChange={onChange}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="flex justify-between pt-12">
          <div className="flex flex-col px-4">
            {renderSelector({
              label: "Model",
              name: "model",
              options: ["Default LB 0.7"],
              defaultValue: "Default LB 0.7",
              onChange: (e) => {
                console.log(e.target.value);
              },
              wrapperClass: "mb-8 w-52",
            })}

            {renderSelector({
              label: "Sample Interval",
              name: "sample_interval",
              options: ["100ms", "200ms", "300ms", "400ms", "500ms"],
              defaultValue: `${sampleInterval.current}ms`,
              onChange: (e) => {
                sampleInterval.current = parseInt(e.target.value);
              },
              wrapperClass: "mb-8 w-52",
            })}

            {renderSelector({
              label: "Number of Segments",
              name: "number_of_segments",
              options: [10, 20, 30, 40, 50, 60],
              defaultValue: numberOfSegments.current,
              onChange: (e) => {
                numberOfSegments.current = parseInt(e.target.value);
              },
              wrapperClass: "mb-8 w-52",
            })}

            {renderSelector({
              label: "Segments Stride",
              name: "segments_stride",
              options: [1, 2, 3],
              defaultValue: segmentsStride.current,
              onChange: (e) => {
                segmentsStride.current = parseInt(e.target.value);
              },
              wrapperClass: "mb-8 w-52",
            })}
          </div>
          {!start && (
            <div className="w-[480px] h-[360px] flex justify-center items-center border-dashed border-2 border-indigo-100 rounded-lg">
              <button
                className="inline-flex items-center gap-x-1.5 rounded  bg-indigo-50 px-4 py-1 text-xs font-semibold text-indigo-600 h-10 shadow-sm hover:bg-indigo-100"
                onClick={() => setStart(true)}
              >
                <svg
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                  className="-ml-0.5 h-5 w-5"
                >
                  <path
                    strokeLinecap="round"
                    d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z"
                  ></path>
                </svg>
                Activate Web Cam
              </button>
            </div>
          )}
          {start && (
            <div className="flex flex-col items-center">
              <div className="flex justify-around relative w-[480px] h-[360px] border-dashed border-2 border-red-300 rounded-lg">
                <div
                  className="absolute h-full w-full rounded-lg flex items-center justify-center text-gray-300"
                  id="output_canvas"
                >
                  waiting for the video been ready...
                </div>
                <canvas
                  ref={canvas}
                  className="absolute h-full w-full rounded-lg"
                  id="output_canvas"
                ></canvas>
                {bestResult && (
                  // make a 40px div at the top of the canvas, and fill it with the best result
                  <div className="absolute top-0 left-0 h-6 w-full rounded-t-lg bg-indigo-100 flex items-center justify-center text-indigo-600 opacity-50">
                    class: {bestResult[1]} - prob: {bestResult[2].toFixed(2)}
                  </div>
                )}
              </div>
              <div ref={controlsElement} className="hidden" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SignLanguageRecognition;
