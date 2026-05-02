export function truncate(text, maxLength) {
    if (text.length === 0) {
        return '';
    }
    if (text.length <= maxLength) {
        return text;
    }
    if (maxLength <= 0) {
        return '…';
    }
    const lastSpaceIndex = text.lastIndexOf(' ', maxLength);
    if (lastSpaceIndex === -1 || lastSpaceIndex === 0) {
        return text.substring(0, maxLength) + '…';
    }
    return text.substring(0, lastSpaceIndex) + '…';
}
