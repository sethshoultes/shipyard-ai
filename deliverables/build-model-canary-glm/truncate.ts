export function truncate(input: string, max: number): string {
  if (input.length <= max) {
    return input;
  }

  if (max <= 0) {
    return '…';
  }

  if (max === 1) {
    return '…';
  }

  const truncated = input.slice(0, max);
  const lastSpace = truncated.lastIndexOf(' ');

  if (lastSpace > 0) {
    return truncated.slice(0, lastSpace) + '…';
  }

  return truncated.slice(0, -1) + '…';
}