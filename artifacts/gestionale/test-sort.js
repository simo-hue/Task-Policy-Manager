function parseLocalDate(value) {
  if (value instanceof Date) return value;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (match) {
    const [, y, m, d] = match;
    return new Date(Number(y), Number(m) - 1, Number(d));
  }
  return new Date(value);
}
const policies = [
  {id: 1, targetIssueDate: undefined},
  {id: 2, targetIssueDate: '2026-05-25'},
  {id: 3, targetIssueDate: '2026-05-20'},
  {id: 4, targetIssueDate: undefined},
  {id: 5, targetIssueDate: '2026-05-30'}
];

policies.sort((a, b) => {
    if (!a.targetIssueDate && !b.targetIssueDate) return 0;
    if (!a.targetIssueDate) return 1;
    if (!b.targetIssueDate) return -1;
    return parseLocalDate(a.targetIssueDate).getTime() - parseLocalDate(b.targetIssueDate).getTime();
});
console.log(policies);
