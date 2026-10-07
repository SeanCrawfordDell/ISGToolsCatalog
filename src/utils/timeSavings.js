export const filterMonthlyByYears = (monthly, selectedYears) => {
  if (!selectedYears.length) return monthly;

  return monthly.filter(({ Month }) => selectedYears.includes(Month.slice(0, 4)));
};
