import { speak } from './utils/speak.js';

const EXERCICES = {
  Squat: {
    nom: "Squat",
    zonesCibles: [
      "hanche_gauche", "genou_gauche", "cheville_gauche",
      "hanche_droite", "genou_droite", "cheville_droite",
      "épaule_gauche", "hanche_gauche", "genou_gauche",
      "épaule_droite", "hanche_droite", "genou_droite"
    ],
    anglesCibles: [
      { nom: "Jambe gauche", points: [23, 25, 27], angleAttendu: 90, tolerance: 15 },
      { nom: "Jambe droite", points: [24, 26, 28], angleAttendu: 90, tolerance: 15 },
      { nom: "Posture gauche", points: [11, 23, 25], angleAttendu: 160, tolerance: 10 },
      { nom: "Posture droite", points: [12, 24, 26], angleAttendu: 160, tolerance: 10 },
    ]
  },
  Crunch: {
    nom: "Crunch",
    zonesCibles: [
      "épaule_gauche", "hanche_gauche", "genou_gauche",
      "épaule_droite", "hanche_droite", "genou_droite"
    ],
    anglesCibles: [
      { nom: "Tronc gauche", points: [11, 23, 25], angleAttendu: 45, tolerance: 20 },
      { nom: "Tronc droit", points: [12, 24, 26], angleAttendu: 45, tolerance: 20 }
    ]
  }
};

export function setupPoseDetection(video, canvas, feedbackEl, selectedExercice = "Squat") {
  const ctx = canvas.getContext('2d');

  const pose = new Pose.Pose({
    locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
  });

  pose.setOptions({
    modelComplexity: 1,
    smoothLandmarks: true,
    enableSegmentation: false,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5,
  });

  pose.onResults(results => {
    // Affichage de la vidéo dans le canvas
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);

    const exo = EXERCICES[selectedExercice];
    if (!exo) {
      feedbackEl.textContent = "Exercice non reconnu.";
      return;
    }

    if (results.poseLandmarks) {
      const errors = [];

      for (const angleDef of exo.anglesCibles) {
        const a = results.poseLandmarks[angleDef.points[0]];
        const b = results.poseLandmarks[angleDef.points[1]];
        const c = results.poseLandmarks[angleDef.points[2]];
        const angle = getAngle(a, b, c);

        const min = angleDef.angleAttendu - angleDef.tolerance;
        const max = angleDef.angleAttendu + angleDef.tolerance;

        if (angle < min || angle > max) {
          errors.push(`${angleDef.nom} incorrect : ${Math.round(angle)}°`);
        }
      }

      if (errors.length === 0) {
        feedbackEl.textContent = `✅ Bon ${exo.nom} !`;
        speak(`Très bien, ton ${exo.nom} est bon`);
        window.ReactNativeWebView?.postMessage('good_form');
      } else {
        feedbackEl.textContent = `⚠️ Corrige :\n${errors.join('\n')}`;
        speak("Corrige ta posture");
        window.ReactNativeWebView?.postMessage('bad_form');
      }
    } else {
      feedbackEl.textContent = 'Position non détectée...';
    }
  });

  const camera = new CameraUtils.Camera(video, {
    onFrame: async () => await pose.send({ image: video }),
    width: 640,
    height: 480,
  });

  camera.start();
}

// Utilitaire pour calculer un angle entre 3 points
function getAngle(a, b, c) {
  const ab = { x: b.x - a.x, y: b.y - a.y };
  const cb = { x: b.x - c.x, y: b.y - c.y };
  const dot = ab.x * cb.x + ab.y * cb.y;
  const magAB = Math.sqrt(ab.x ** 2 + ab.y ** 2);
  const magCB = Math.sqrt(cb.x ** 2 + cb.y ** 2);
  return Math.acos(dot / (magAB * magCB)) * (180 / Math.PI);
}
