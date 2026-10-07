export const formatReportMonth = (month) => new Intl.DateTimeFormat('en-US', {
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC'
}).format(new Date(`${month}-01T00:00:00Z`));

export const formatReportDate = (date) => new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  timeZone: 'UTC'
}).format(new Date(`${date}T00:00:00Z`));
