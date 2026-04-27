const { createElement } = wp.element;

export default function Word({ word, onSeek }) {
	const handleClick = () => {
		if (typeof word.start === 'number') {
			onSeek(Math.max(0, word.start - 0.2));
		}
	};

	return createElement('span', {
		className: 'scribe-word',
		'data-start': word.start,
		'data-end': word.end,
		onClick: handleClick,
	}, word.word + ' ');
}
