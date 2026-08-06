import { useEffect, useRef, useState } from "react";
import type { RefObject } from "react";
import type { HandLandmarker as HandLandmarkerType } from "@mediapipe/tasks-vision";

export type GestureStatus = "idle" | "loading" | "ready" | "denied" | "unavailable";

interface Options {
  enabled: boolean;
  fps?: number;
  deadZone?: number;
  sensitivity?: number;
}

interface State {
  status: GestureStatus;
  handDetected: boolean;
  paused: boolean;
  videoRef: RefObject<HTMLVideoElement | null>;
}

function isOpenPalm(landmarks: { x: number; y: number }[]): boolean {
  if (!landmarks || landmarks.length < 21) return false;
  const pairs = [
    [8, 6],
    [12, 10],
    [16, 14],
    [20, 18],
  ];
  let extended = 0;
  for (const [tip, pip] of pairs) {
    if (landmarks[tip].y < landmarks[pip].y - 0.02) extended++;
  }
  return extended >= 4;
}

const EMA_WEIGHT = 0.18;
const SCROLL_LERP = 0.72;
const TARGET_DECAY = 0.82;
const MAX_SCROLL_PER_FRAME = 155;
const LOST_HAND_GRACE_MS = 260;
const OPEN_PALM_HOLD_MS = 520;
const OPEN_PALM_STILLNESS_PX = 7;
const FRAME_MS = 1000 / 60;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function logGestureDebug(rawY: number, smoothedY: number) {
  const win = window as Window & { __GESTURE_SCROLL_DEBUG__?: boolean };
  if (!win.__GESTURE_SCROLL_DEBUG__) return;
  console.log("[gesture-scroll] rawY/smoothedY", {
    rawY: Number(rawY.toFixed(2)),
    smoothedY: Number(smoothedY.toFixed(2)),
  });
}

export function useGestureScroll({
  enabled,
  fps = 42,
  deadZone = 1.25,
  sensitivity = 4.15,
}: Options): State {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const landmarkerRef = useRef<HandLandmarkerType | null>(null);
  const detectionRafRef = useRef<number | null>(null);
  const scrollRafRef = useRef<number | null>(null);
  const lastDetectionRef = useRef(0);
  const lastSeenRef = useRef(0);
  const lastFrameTimeRef = useRef<number | null>(null);
  const emaYRef = useRef<number | null>(null);
  const lastSmoothedYRef = useRef<number | null>(null);
  const targetDeltaRef = useRef(0);
  const currentDeltaRef = useRef(0);
  const pausedRef = useRef(false);
  const handDetectedRef = useRef(false);
  const openPalmSinceRef = useRef<number | null>(null);

  const [status, setStatus] = useState<GestureStatus>("idle");
  const [handDetected, setHandDetected] = useState(false);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;

    const resetMotion = () => {
      emaYRef.current = null;
      lastSmoothedYRef.current = null;
      lastFrameTimeRef.current = null;
      targetDeltaRef.current = 0;
      currentDeltaRef.current = 0;
      openPalmSinceRef.current = null;
    };

    const setHandVisible = (visible: boolean) => {
      if (handDetectedRef.current === visible) return;
      handDetectedRef.current = visible;
      setHandDetected(visible);
    };

    const setPausedState = (nextPaused: boolean) => {
      if (pausedRef.current === nextPaused) return;
      pausedRef.current = nextPaused;
      setPaused(nextPaused);
      if (nextPaused) {
        targetDeltaRef.current = 0;
        currentDeltaRef.current = 0;
      }
    };

    const getPalmCenterY = (landmarks: { y: number }[], videoHeight: number) => {
      const stablePoints = [0, 5, 9, 13, 17];
      const total = stablePoints.reduce((sum, index) => sum + landmarks[index].y, 0);
      return (total / stablePoints.length) * videoHeight;
    };

    const scrollLoop = () => {
      if (cancelled) return;
      targetDeltaRef.current *= TARGET_DECAY;
      const velocity = (targetDeltaRef.current - currentDeltaRef.current) * SCROLL_LERP;
      currentDeltaRef.current += velocity;

      if (Math.abs(targetDeltaRef.current) < 0.01 && Math.abs(currentDeltaRef.current) < 0.05) {
        currentDeltaRef.current = 0;
      }

      if (!pausedRef.current && Math.abs(currentDeltaRef.current) > 0.05) {
        const scrollStep = clamp(
          currentDeltaRef.current * sensitivity,
          -MAX_SCROLL_PER_FRAME,
          MAX_SCROLL_PER_FRAME,
        );
        const scroller = document.scrollingElement ?? document.documentElement;
        const maxScroll = scroller.scrollHeight - window.innerHeight;
        scroller.scrollTop = clamp(scroller.scrollTop + scrollStep, 0, Math.max(0, maxScroll));
      }

      scrollRafRef.current = requestAnimationFrame(scrollLoop);
    };

    const waitForVideoReady = (video: HTMLVideoElement) =>
      new Promise<void>((resolve, reject) => {
        if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA && video.videoWidth > 0) {
          resolve();
          return;
        }

        const timeout = window.setTimeout(() => {
          cleanup();
          reject(new Error("Video did not become ready"));
        }, 3000);

        const cleanup = () => {
          window.clearTimeout(timeout);
          video.removeEventListener("loadeddata", onReady);
          video.removeEventListener("canplay", onReady);
        };

        const onReady = () => {
          if (video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA || video.videoWidth <= 0) {
            return;
          }
          cleanup();
          resolve();
        };

        video.addEventListener("loadeddata", onReady);
        video.addEventListener("canplay", onReady);
      });

    const start = async () => {
      if (typeof window === "undefined") return;
      if (!navigator.mediaDevices?.getUserMedia) {
        setStatus("unavailable");
        return;
      }
      setStatus("loading");
      document.documentElement.dataset.gestureScrolling = "true";
      window.dispatchEvent(new CustomEvent("gesture-scroll:active"));
      try {
        const { HandLandmarker, FilesetResolver } = await import(
          "@mediapipe/tasks-vision"
        );
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/wasm",
        );
        const createLandmarker = async (delegate: "GPU" | "CPU") =>
          HandLandmarker.createFromOptions(vision, {
            baseOptions: {
              modelAssetPath:
                "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
              delegate,
            },
            runningMode: "VIDEO",
            numHands: 1,
            minHandDetectionConfidence: 0.22,
            minHandPresenceConfidence: 0.22,
            minTrackingConfidence: 0.2,
          });
        let landmarker: HandLandmarkerType;
        try {
          landmarker = await createLandmarker("GPU");
        } catch {
          landmarker = await createLandmarker("CPU");
        }
        if (cancelled) {
          landmarker.close();
          return;
        }
        landmarkerRef.current = landmarker;

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: "user",
            frameRate: { ideal: 60, max: 60 },
          },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        const video = videoRef.current;
        if (!video) return;
        video.srcObject = stream;
        video.muted = true;
        video.playsInline = true;
        await video.play();
        await waitForVideoReady(video);
        setStatus("ready");

        const frameInterval = 1000 / fps;

        const detectionLoop = () => {
          if (cancelled) return;
          const now = performance.now();
          if (
            now - lastDetectionRef.current >= frameInterval &&
            landmarkerRef.current &&
            video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA &&
            video.videoWidth > 0 &&
            video.videoHeight > 0
          ) {
            lastDetectionRef.current = now;
            try {
              const result = landmarkerRef.current.detectForVideo(video, now);
              if (result.landmarks && result.landmarks.length > 0) {
                const lm = result.landmarks[0];
                lastSeenRef.current = now;
                setHandVisible(true);
                const open = isOpenPalm(lm);

                const rawY = getPalmCenterY(lm, video.videoHeight);
                const previousEma = emaYRef.current;
                const smoothedY = previousEma == null
                  ? rawY
                  : previousEma * EMA_WEIGHT + rawY * (1 - EMA_WEIGHT);

                emaYRef.current = smoothedY;
                logGestureDebug(rawY, smoothedY);

                if (lastSmoothedYRef.current != null) {
                  const deltaY = smoothedY - lastSmoothedYRef.current;
                  const lastFrameTime = lastFrameTimeRef.current;
                  const elapsed = lastFrameTime == null ? FRAME_MS : clamp(now - lastFrameTime, 10, 80);
                  const normalizedDelta = deltaY * (FRAME_MS / elapsed);

                  if (open && Math.abs(deltaY) <= OPEN_PALM_STILLNESS_PX) {
                    openPalmSinceRef.current = openPalmSinceRef.current ?? now;
                  } else {
                    openPalmSinceRef.current = null;
                    if (pausedRef.current) setPausedState(false);
                  }

                  if (
                    openPalmSinceRef.current != null &&
                    now - openPalmSinceRef.current >= OPEN_PALM_HOLD_MS
                  ) {
                    setPausedState(true);
                  }

                  targetDeltaRef.current =
                    !pausedRef.current && Math.abs(normalizedDelta) >= deadZone
                      ? normalizedDelta
                      : 0;
                } else {
                  targetDeltaRef.current = 0;
                }

                lastSmoothedYRef.current = smoothedY;
                lastFrameTimeRef.current = now;
              } else {
                if (now - lastSeenRef.current > LOST_HAND_GRACE_MS) {
                  setHandVisible(false);
                  setPausedState(false);
                  resetMotion();
                }
              }
            } catch {
            }
          }
          detectionRafRef.current = requestAnimationFrame(detectionLoop);
        };
        scrollRafRef.current = requestAnimationFrame(scrollLoop);
        detectionRafRef.current = requestAnimationFrame(detectionLoop);
      } catch (err: unknown) {
        const name = (err as { name?: string })?.name;
        if (name === "NotAllowedError" || name === "SecurityError") {
          setStatus("denied");
        } else {
          setStatus("unavailable");
        }
      }
    };

    void start();

    return () => {
      cancelled = true;
      if (detectionRafRef.current) cancelAnimationFrame(detectionRafRef.current);
      if (scrollRafRef.current) cancelAnimationFrame(scrollRafRef.current);
      detectionRafRef.current = null;
      scrollRafRef.current = null;
      resetMotion();
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      if (landmarkerRef.current) {
        landmarkerRef.current.close();
        landmarkerRef.current = null;
      }
      document.documentElement.removeAttribute("data-gesture-scrolling");
      window.dispatchEvent(new CustomEvent("gesture-scroll:inactive"));
      setHandVisible(false);
      setPausedState(false);
      setStatus("idle");
    };
  }, [enabled, fps, deadZone, sensitivity]);

  return { status, handDetected, paused, videoRef };
}
