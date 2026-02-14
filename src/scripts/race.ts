import { CARS, TOTAL_LAPS, SPEED_MIN, SPEED_MAX, START_STAGGER } from "./config";

export interface CarState {
  id: number;
  distance: number;
  speed: number;
  lap: number;
  finished: boolean;
  finishOrder: number;
}

function randomSpeed(): number {
  return SPEED_MIN + Math.random() * (SPEED_MAX - SPEED_MIN);
}

export type RaceCallbacks = {
  onUpdate: (cars: CarState[], leaderLap: number) => void;
  onFinish: (standings: CarState[]) => void;
};

export class Race {
  private path: SVGPathElement;
  private dots: SVGCircleElement[];
  private totalLength: number;
  private cars: CarState[] = [];
  private animationId: number | null = null;
  private lastTimestamp: number = 0;
  private finishCount: number = 0;
  private callbacks: RaceCallbacks;

  constructor(
    path: SVGPathElement,
    dots: SVGCircleElement[],
    callbacks: RaceCallbacks
  ) {
    this.path = path;
    this.dots = dots;
    this.totalLength = path.getTotalLength();
    this.callbacks = callbacks;
  }

  init(): void {
    this.cars = CARS.map((car, i) => ({
      id: car.id,
      distance: i * START_STAGGER * this.totalLength,
      speed: randomSpeed(),
      lap: 0,
      finished: false,
      finishOrder: -1,
    }));
    this.finishCount = 0;
    this.positionAllDots();
  }

  start(): void {
    this.lastTimestamp = 0;
    this.animationId = requestAnimationFrame((ts) => this.animate(ts));
  }

  stop(): void {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  private animate(timestamp: number): void {
    if (this.lastTimestamp === 0) {
      this.lastTimestamp = timestamp;
      this.animationId = requestAnimationFrame((ts) => this.animate(ts));
      return;
    }

    const delta = timestamp - this.lastTimestamp;
    this.lastTimestamp = timestamp;

    // Cap delta to avoid huge jumps when tab is backgrounded
    const clampedDelta = Math.min(delta, 50);

    for (const car of this.cars) {
      if (car.finished) continue;

      const prevLap = car.lap;
      car.distance += car.speed * clampedDelta;
      car.lap = Math.floor(car.distance / this.totalLength);

      // Re-randomize speed on new lap
      if (car.lap > prevLap && car.lap < TOTAL_LAPS) {
        car.speed = randomSpeed();
      }

      // Check finish
      if (car.lap >= TOTAL_LAPS) {
        car.finished = true;
        car.finishOrder = this.finishCount++;
        // Pin to finish line
        car.distance = TOTAL_LAPS * this.totalLength;
      }

      this.positionDot(car);
    }

    // Leader lap for HUD
    const leaderLap = Math.min(
      Math.max(...this.cars.map((c) => c.lap)) + 1,
      TOTAL_LAPS
    );

    this.callbacks.onUpdate(this.cars, leaderLap);

    if (this.cars.every((c) => c.finished)) {
      this.animationId = null;
      const standings = [...this.cars].sort(
        (a, b) => a.finishOrder - b.finishOrder
      );
      this.callbacks.onFinish(standings);
    } else {
      this.animationId = requestAnimationFrame((ts) => this.animate(ts));
    }
  }

  private positionDot(car: CarState): void {
    const progress = car.distance % this.totalLength;
    const point = this.path.getPointAtLength(progress);
    this.dots[car.id].setAttribute("cx", String(point.x));
    this.dots[car.id].setAttribute("cy", String(point.y));
  }

  private positionAllDots(): void {
    for (const car of this.cars) {
      this.positionDot(car);
    }
  }
}

const PARADE_SPEED = 0.08; // slow, constant cruise
const PARADE_SPACING = 0.06; // 6% of track between each dot

export class Parade {
  private path: SVGPathElement;
  private dots: SVGCircleElement[];
  private totalLength: number;
  private distances: number[];
  private animationId: number | null = null;
  private lastTimestamp: number = 0;

  constructor(path: SVGPathElement, dots: SVGCircleElement[]) {
    this.path = path;
    this.dots = dots;
    this.totalLength = path.getTotalLength();
    this.distances = CARS.map((_, i) => i * PARADE_SPACING * this.totalLength);
  }

  start(): void {
    this.lastTimestamp = 0;
    this.positionAll();
    this.animationId = requestAnimationFrame((ts) => this.animate(ts));
  }

  stop(): void {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  private animate(timestamp: number): void {
    if (this.lastTimestamp === 0) {
      this.lastTimestamp = timestamp;
      this.animationId = requestAnimationFrame((ts) => this.animate(ts));
      return;
    }

    const delta = Math.min(timestamp - this.lastTimestamp, 50);
    this.lastTimestamp = timestamp;

    for (let i = 0; i < this.distances.length; i++) {
      this.distances[i] += PARADE_SPEED * delta;
    }

    this.positionAll();
    this.animationId = requestAnimationFrame((ts) => this.animate(ts));
  }

  private positionAll(): void {
    for (let i = 0; i < this.dots.length; i++) {
      const progress = this.distances[i] % this.totalLength;
      const point = this.path.getPointAtLength(progress);
      this.dots[i].setAttribute("cx", String(point.x));
      this.dots[i].setAttribute("cy", String(point.y));
    }
  }
}
