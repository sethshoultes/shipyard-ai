export function truncate(input, max) {
    if (input.length <= max) {
        return input;
    }
    if (max <= 0) {
        return '…';
    }
    if (max === 1) {
        return '…';
    }
    const textLength = max - 1;
    const truncated = input.slice(0, textLength);
    const lastSpace = truncated.lastIndexOf(' ');
    if (lastSpace > 0 && lastSpace < truncated.length) {
        return truncated.slice(0, lastSpace) + '…';
    }
    return truncated + '…';
}
