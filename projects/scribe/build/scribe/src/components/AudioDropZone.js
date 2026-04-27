const { createElement, useState, useCallback } = wp.element;

export default function AudioDropZone({ onUpload, postId, apiKeyMissing }) {
	const [isDragging, setIsDragging] = useState(false);
	const [error, setError] = useState('');
	const [isUploading, setIsUploading] = useState(false);

	const allowedTypes = ['audio/mpeg', 'audio/mp4', 'audio/wav', 'audio/x-wav'];
	const allowedExts = ['mp3', 'm4a', 'wav'];

	const validateFile = (file) => {
		const ext = file.name.split('.').pop().toLowerCase();
		if (!allowedTypes.includes(file.type) && !allowedExts.includes(ext)) {
			return __('Only MP3, M4A, and WAV files are supported.', 'scribe');
		}
		const maxSize = 100 * 1024 * 1024;
		if (file.size > maxSize) {
			return __('File exceeds 100 MB limit.', 'scribe');
		}
		return '';
	};

	const handleDrop = useCallback((e) => {
		e.preventDefault();
		setIsDragging(false);
		setError('');

		if (apiKeyMissing) {
			setError(__('OpenAI API key is not configured.', 'scribe'));
			return;
		}

		const files = e.dataTransfer.files;
		if (!files.length) return;

		const file = files[0];
		const validationError = validateFile(file);
		if (validationError) {
			setError(validationError);
			return;
		}

		uploadFile(file);
	}, [apiKeyMissing]);

	const handleDragOver = useCallback((e) => {
		e.preventDefault();
		setIsDragging(true);
	}, []);

	const handleDragLeave = useCallback((e) => {
		e.preventDefault();
		setIsDragging(false);
	}, []);

	const handleFileInput = useCallback((e) => {
		setError('');
		const file = e.target.files[0];
		if (!file) return;
		const validationError = validateFile(file);
		if (validationError) {
			setError(validationError);
			return;
		}
		uploadFile(file);
	}, []);

	const uploadFile = (file) => {
		setIsUploading(true);
		const formData = new FormData();
		formData.append('audio', file);
		formData.append('post_id', postId);

		fetch(ajaxurl, {
			method: 'POST',
			body: formData,
			headers: {
				'X-Requested-With': 'XMLHttpRequest',
			},
		})
		.then((res) => res.json())
		.then((data) => {
			setIsUploading(false);
			if (data.success) {
				onUpload(data.data);
			} else {
				const msg = data.data && data.data.message ? data.data.message : __('Upload failed.', 'scribe');
				if (data.data && data.data.link) {
					setError(
						createElement('span', null,
							msg + ' ',
							createElement('a', { href: data.data.link, target: '_blank', rel: 'noopener noreferrer' }, __('Go to Settings', 'scribe'))
						)
					);
				} else {
					setError(msg);
				}
			}
		})
		.catch(() => {
			setIsUploading(false);
			setError(__('Upload failed. Please try again.', 'scribe'));
		});
	};

	return createElement('div', {
		className: 'scribe-drop-zone' + (isDragging ? ' is-dragging' : ''),
		onDrop: handleDrop,
		onDragOver: handleDragOver,
		onDragLeave: handleDragLeave,
	},
		createElement('div', { className: 'scribe-drop-zone__content' },
			createElement('p', { className: 'scribe-drop-zone__icon' }, '🎙️'),
			createElement('p', { className: 'scribe-drop-zone__text' },
				isUploading
					? __('Uploading audio...', 'scribe')
					: __('Drag and drop an audio file here, or click to browse', 'scribe')
			),
			createElement('input', {
				type: 'file',
				accept: '.mp3,.m4a,.wav',
				onChange: handleFileInput,
				className: 'scribe-drop-zone__input',
			}),
			apiKeyMissing && createElement('p', { className: 'scribe-drop-zone__error' },
				createElement('a', { href: '/wp-admin/options-general.php?page=scribe-settings', target: '_blank', rel: 'noopener noreferrer' }, __('Please set your OpenAI API key in Settings > Scribe.', 'scribe'))
			),
			error && typeof error === 'string'
				? createElement('p', { className: 'scribe-drop-zone__error' }, error)
				: error
		)
	);
}
