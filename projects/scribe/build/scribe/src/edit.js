const { createElement, useState, useEffect, useRef } = wp.element;
const { useBlockProps } = wp.blockEditor;
import AudioDropZone from './components/AudioDropZone';
import JobStatus from './components/JobStatus';
import Transcript from './components/Transcript';

export default function Edit({ attributes, setAttributes, clientId }) {
	const { audioUrl, transcript } = attributes;
	const [jobStatus, setJobStatus] = useState('idle');
	const [localTranscript, setLocalTranscript] = useState(transcript || []);
	const [apiKeyMissing, setApiKeyMissing] = useState(false);
	const audioRef = useRef(null);
	const pollRef = useRef(null);

	const postId = wp.data.select('core/editor')?.getCurrentPostId?.() || 0;

	useEffect(() => {
		if (!postId) return;
		fetch(ajaxurl, {
			method: 'POST',
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
			body: new URLSearchParams({ action: 'scribe_check_job', post_id: postId }),
		})
		.then((res) => res.json())
		.then((data) => {
			if (data.success && data.data.status) {
				setJobStatus(data.data.status);
				if (data.data.transcript) {
					setLocalTranscript(data.data.transcript.segments || []);
					setAttributes({ transcript: data.data.transcript.segments || [] });
				}
			}
		});
	}, [postId]);

	useEffect(() => {
		if (jobStatus === 'pending' || jobStatus === 'processing') {
			pollRef.current = setInterval(() => {
				fetch(ajaxurl, {
					method: 'POST',
					headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
					body: new URLSearchParams({ action: 'scribe_check_job', post_id: postId }),
				})
				.then((res) => res.json())
				.then((data) => {
					if (data.success && data.data.status) {
						setJobStatus(data.data.status);
						if (data.data.status === 'completed' && data.data.transcript) {
							setLocalTranscript(data.data.transcript.segments || []);
							setAttributes({ transcript: data.data.transcript.segments || [] });
						}
					}
				});
			}, 5000);
		}
		return () => {
			if (pollRef.current) {
				clearInterval(pollRef.current);
			}
		};
	}, [jobStatus, postId]);

	const handleUpload = (data) => {
		setJobStatus('pending');
	};

	const handleSetApiKeyMissing = (value) => {
		setApiKeyMissing(value);
	};

	return createElement('div', useBlockProps({ className: 'wp-block-scribe-editor' }),
		audioUrl && createElement('audio', { ref: audioRef, controls: true, src: audioUrl, className: 'scribe-audio-player' }),
		!audioUrl && createElement(AudioDropZone, {
			onUpload: handleUpload,
			postId: postId,
			apiKeyMissing: apiKeyMissing,
		}),
		(jobStatus === 'pending' || jobStatus === 'processing') && createElement(JobStatus, { status: jobStatus }),
		(jobStatus === 'completed' || localTranscript.length > 0) && createElement(Transcript, {
			segments: localTranscript,
			audioRef: audioRef,
		}),
		jobStatus === 'failed' && createElement('p', { className: 'scribe-error' }, __('Transcription failed. Please try uploading the file again.', 'scribe'))
	);
}
