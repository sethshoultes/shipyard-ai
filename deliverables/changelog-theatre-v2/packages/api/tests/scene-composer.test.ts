import type { Commit, ScriptLine } from '../src/types.js';

interface SceneProps {
  repo: string;
  script: ScriptLine[];
  commits: Commit[];
  durationInFrames: number;
  width: number;
  height: number;
}

function buildSceneProps(
  repo: string,
  script: ScriptLine[],
  commits: Commit[]
): SceneProps {
  const fps = 30;
  const totalSeconds = 60;
  return {
    repo,
    script,
    commits,
    durationInFrames: fps * totalSeconds,
    width: 1080,
    height: 1920,
  };
}

describe('buildSceneProps', () => {
  it('returns correct dimensions (9:16 vertical)', () => {
    const props = buildSceneProps('owner/repo', [], []);
    expect(props.width).toBe(1080);
    expect(props.height).toBe(1920);
  });

  it('returns ~60 seconds in frames at 30fps', () => {
    const props = buildSceneProps('owner/repo', [], []);
    expect(props.durationInFrames).toBe(1800);
  });

  it('includes repo name in props', () => {
    const props = buildSceneProps('my-org/my-repo', [], []);
    expect(props.repo).toBe('my-org/my-repo');
  });

  it('passes through script lines', () => {
    const script: ScriptLine[] = [
      { text: 'Line one', timestamp: 0 },
      { text: 'Line two', timestamp: 15 },
    ];
    const props = buildSceneProps('o/r', script, []);
    expect(props.script).toEqual(script);
  });

  it('passes through commits', () => {
    const commits: Commit[] = [
      { sha: 'abc', message: 'Fix bug', author: 'dev', date: '2026-04-25' },
    ];
    const props = buildSceneProps('o/r', [], commits);
    expect(props.commits).toEqual(commits);
  });
});
