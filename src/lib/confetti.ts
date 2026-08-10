import confetti from 'canvas-confetti';

export const fireGoalConfetti = () => {
  try {
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.65 },
      colors: ['#0ea5e9', '#10b981', '#f59e0b', '#6366f1', '#ec4899'],
      disableForReducedMotion: true,
    });
  } catch (e) {
    console.error('Confetti error:', e);
  }
};

export const fireSeasonVictoryConfetti = () => {
  try {
    const duration = 2.5 * 1000;
    const end = Date.now() + duration;
    const colors = ['#0ea5e9', '#10b981', '#f59e0b', '#a855f7', '#38bdf8'];

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 },
        colors: colors,
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 },
        colors: colors,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  } catch (e) {
    console.error('Confetti error:', e);
  }
};
