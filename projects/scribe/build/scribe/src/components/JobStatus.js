const { createElement } = wp.element;

export default function JobStatus({ status }) {
	const labels = {
		pending: __('Queued for transcription...', 'scribe'),
		processing: __('Transcribing audio...', 'scribe'),
		completed: __('Transcription complete.', 'scribe'),
		failed: __('Transcription failed. Please try again.', 'scribe'),
	};

	const label = labels[status] || labels.pending;

	return createElement('div', { className: 'scribe-job-status' },
		createElement('div', { className: 'scribe-job-status__spinner' }),
		createElement('p', { className: 'scribe-job-status__label' }, label)
	);
}
