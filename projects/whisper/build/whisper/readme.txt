=== Whisper ===
Contributors: shipyardai
Tags: audio, video, transcript, captions, openai, whisper
Requires at least: 6.0
Tested up to: 6.5
Requires PHP: 7.4
Stable tag: 1.0.0
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

A Gutenberg block that accepts audio or video files and renders beautiful, synchronized transcripts with timestamps and click-to-seek playback.

== Description ==

Whisper turns any audio or video file into a magazine-grade, interactive transcript inside the WordPress block editor.

= Features =

* Drag-and-drop audio/video upload (MP3, M4A, WAV).
* Automatic transcription via the OpenAI Whisper API.
* Word-level timestamps — click any word to jump the playhead to that exact moment.
* SRT export for captions and subtitles.
* Clean, warm typography that looks great on any theme.

== Installation ==

1. Upload the plugin files to `/wp-content/plugins/whisper`, or install the plugin through the WordPress plugins screen directly.
2. Activate the plugin through the 'Plugins' screen in WordPress.
3. Go to **Settings > Whisper** and enter your OpenAI API key.
4. Add the "Whisper Transcript" block to any post or page and upload your media file.

== Frequently Asked Questions ==

= What file formats are supported? =

MP3, M4A, and WAV are supported. The maximum file size is 50 MB.

= Do I need an OpenAI API key? =

Yes. You can add your key on the Settings > Whisper page, or define the `WHISPER_API_KEY` constant in `wp-config.php`.

== Changelog ==

= 1.0.0 =
* Initial release.
