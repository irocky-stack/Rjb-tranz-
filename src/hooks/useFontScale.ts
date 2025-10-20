export const useFontScale = (scale: number = 1.0) => {
  return {
    fontScale: scale,
    getFontSize: (base: number) => base * scale,
    getScaleClass: () => scale !== 1.0 ? 'scaled' : ''
  };
};