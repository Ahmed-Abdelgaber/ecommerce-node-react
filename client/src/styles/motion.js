export const MOTION_EASE = {
  out: [0.16, 1, 0.3, 1],
  in: [0.7, 0, 0.84, 0],
  inOut: [0.43, 0.13, 0.23, 0.96],
};

export const MOTION_DURATION = {
  fast: 0.2,
  normal: 0.45,
  slow: 0.75,
};

export const TRANSITIONS = {
  base: {
    duration: MOTION_DURATION.normal,
    ease: MOTION_EASE.out,
  },
  entrance: {
    duration: 0.6,
    ease: MOTION_EASE.out,
  },
  exit: {
    duration: 0.35,
    ease: MOTION_EASE.in,
  },
  spring: {
    type: "spring",
    stiffness: 120,
    damping: 18,
    mass: 0.8,
  },
};

export const VARIANTS = {
  fadeInUp: {
    initial: { opacity: 0, y: 24 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { ...TRANSITIONS.entrance },
    },
    exit: {
      opacity: 0,
      y: -16,
      transition: { ...TRANSITIONS.exit },
    },
  },
  fadeIn: {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: { ...TRANSITIONS.entrance },
    },
    exit: {
      opacity: 0,
      transition: { ...TRANSITIONS.exit },
    },
  },
  scaleIn: {
    initial: { opacity: 0, scale: 0.95 },
    animate: {
      opacity: 1,
      scale: 1,
      transition: { ...TRANSITIONS.entrance },
    },
    exit: {
      opacity: 0,
      scale: 0.9,
      transition: { ...TRANSITIONS.exit },
    },
  },
  staggerContainer: {
    initial: {},
    animate: {
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.04,
      },
    },
  },
};

export const VIEWPORT = {
  once: true,
  amount: 0.2,
};
