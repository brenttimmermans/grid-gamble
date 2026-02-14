import { CARS, TOTAL_LAPS } from "./config";
import { Race, type CarState } from "./race";

// DOM elements
const bettingPanel = document.getElementById("betting-panel")!;
const raceHud = document.getElementById("race-hud")!;
const resultsOverlay = document.getElementById("results-overlay")!;
const startRaceBtn = document.getElementById("start-race-btn")!;
const raceAgainBtn = document.getElementById("race-again-btn")!;
const lapCounter = document.getElementById("lap-counter")!;
const resultMessage = document.getElementById("result-message")!;

const trackPath = document.getElementById("track-path") as unknown as SVGPathElement;
const dots = CARS.map(
  (car) => document.getElementById(`car-${car.id}`) as unknown as SVGCircleElement
);

let selectedCarId: number | null = null;
let race: Race | null = null;

// --- Betting ---

const carButtons = document.querySelectorAll<HTMLButtonElement>(".car-btn");

carButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    selectedCarId = Number(btn.dataset.carId);

    // Highlight selected, dim others
    carButtons.forEach((b) => {
      const id = Number(b.dataset.carId);
      if (id === selectedCarId) {
        b.classList.remove("border-gray-700", "bg-gray-800");
        b.classList.add("border-white", "bg-gray-700", "ring-2", "ring-white/30");
      } else {
        b.classList.remove("border-white", "bg-gray-700", "ring-2", "ring-white/30");
        b.classList.add("border-gray-700", "bg-gray-800");
      }
    });

    startRaceBtn.classList.remove("hidden");
  });
});

// --- Start Race ---

startRaceBtn.addEventListener("click", () => {
  if (selectedCarId === null) return;

  // Switch to race view
  bettingPanel.classList.add("hidden");
  raceHud.classList.remove("hidden");

  race = new Race(trackPath, dots, {
    onUpdate: handleRaceUpdate,
    onFinish: handleRaceFinish,
  });
  race.init();
  race.start();
});

// --- Race Updates ---

function handleRaceUpdate(cars: CarState[], leaderLap: number): void {
  lapCounter.textContent = `Lap ${leaderLap} / ${TOTAL_LAPS}`;

  // Sort by distance descending for leaderboard
  const sorted = [...cars].sort((a, b) => b.distance - a.distance);
  const leaderboard = document.getElementById("leaderboard")!;

  sorted.forEach((car, position) => {
    const entry = leaderboard.querySelector(
      `[data-leaderboard-id="${car.id}"]`
    ) as HTMLElement;
    if (entry) {
      entry.style.order = String(position);
      const posLabel = entry.querySelector(".font-mono")!;
      posLabel.textContent = `${position + 1}.`;
    }
  });
}

function handleRaceFinish(standings: CarState[]): void {
  const winnerId = standings[0].id;
  const winnerCar = CARS.find((c) => c.id === winnerId)!;
  const didWin = winnerId === selectedCarId;

  if (didWin) {
    resultMessage.innerHTML = `<span class="text-emerald-400">You won!</span><br/><span class="text-lg text-gray-400">${winnerCar.name} takes the race</span>`;
  } else {
    resultMessage.innerHTML = `<span class="text-red-400">Better luck next time</span><br/><span class="text-lg text-gray-400">${winnerCar.name} wins</span>`;
  }

  // Update final standings
  const finalStandings = document.getElementById("final-standings")!;
  standings.forEach((car, position) => {
    const entry = finalStandings.querySelector(
      `[data-standing-id="${car.id}"]`
    ) as HTMLElement;
    if (entry) {
      entry.style.order = String(position);
      const posLabel = entry.querySelector(".font-mono")!;
      posLabel.textContent = `${position + 1}.`;
    }
  });

  // Show results after a short delay
  setTimeout(() => {
    resultsOverlay.classList.remove("hidden");
  }, 500);
}

// --- Race Again ---

raceAgainBtn.addEventListener("click", () => {
  if (race) race.stop();
  race = null;
  selectedCarId = null;

  // Reset UI
  resultsOverlay.classList.add("hidden");
  raceHud.classList.add("hidden");
  bettingPanel.classList.remove("hidden");
  startRaceBtn.classList.add("hidden");

  // Reset button styles
  carButtons.forEach((b) => {
    b.classList.remove("border-white", "bg-gray-700", "ring-2", "ring-white/30");
    b.classList.add("border-gray-700", "bg-gray-800");
  });

  // Reset leaderboard order
  const leaderboard = document.getElementById("leaderboard")!;
  leaderboard.querySelectorAll("[data-leaderboard-id]").forEach((el) => {
    (el as HTMLElement).style.order = "";
  });

  // Reset dots to origin
  dots.forEach((dot) => {
    dot.setAttribute("cx", "0");
    dot.setAttribute("cy", "0");
  });
});
