export const createEndpointPreservingTickCallback = (maxTicks) => function formatSelectedTick(value, index, ticks) {
  if (ticks.length <= maxTicks || index === ticks.length - 1) {
    return this.getLabelForValue(value);
  }

  const interval = Math.ceil((ticks.length - 1) / (maxTicks - 1));
  return index % interval === 0 ? this.getLabelForValue(value) : '';
};
