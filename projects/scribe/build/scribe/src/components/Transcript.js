const { createElement } = wp.element;
import Word from './Word';

export default function Transcript({ segments, audioRef }) {
	const handleSeek = (time) => {
		if (audioRef && audioRef.current) {
			audioRef.current.currentTime = time;
			audioRef.current.play().catch(() => {});
		}
	};

	return createElement('div', { className: 'scribe-transcript' },
		segments.map((segment, index) => {
			const hasWords = Array.isArray(segment.words) && segment.words.length > 0;
			return createElement('p', {
				key: index,
				className: 'scribe-sentence',
				'data-start': segment.start,
				'data-end': segment.end,
				onClick: hasWords
					? undefined
					: () => handleSeek(Math.max(0, segment.start - 0.2)),
			},
				hasWords
					? segment.words.map((word, wIndex) =>
						createElement(Word, { key: wIndex, word, onSeek: handleSeek })
					)
					: segment.text
			);
		})
	);
}
