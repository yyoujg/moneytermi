/// <reference types="node" />
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { AVATAR_OPTIONS } from '../constants';
import { getOtterAvatarPose, OTTER_AVATAR_IMAGES, OTTER_IMAGES } from './otter';

describe('새 앱 캐릭터 원본', () => {
  for (const [kind, images, size] of [
    ['전신', OTTER_IMAGES, 512], ['프로필', OTTER_AVATAR_IMAGES, 256],
  ] as const) {
    it(`${kind} 그림 4개가 올바른 크기의 투명 PNG로 존재한다`, () => {
      expect(Object.keys(images)).toEqual(['hello', 'study', 'joy', 'think']);
      for (const src of Object.values(images)) {
        const bytes = readFileSync(resolve(process.cwd(), 'public', src.slice(1)));
        expect([...bytes.subarray(0, 8)]).toEqual([137, 80, 78, 71, 13, 10, 26, 10]);
        expect(bytes.readUInt32BE(16)).toBe(size);
        expect(bytes.readUInt32BE(20)).toBe(size);
        expect(bytes[25]).toBe(6);
      }
    });
  }

  it('프로필 선택지는 중복 없는 네 포즈를 가리킨다', () => {
    expect(AVATAR_OPTIONS).toEqual(['🍊', '🐼', '🥰', '🦉']);
    expect(new Set(AVATAR_OPTIONS.map(getOtterAvatarPose)).size).toBe(4);
  });

  it('예전 프로필 저장값도 새 포즈로 표시할 수 있다', () => {
    for (const emoji of ['🍊', '🥰', '🐼', '🐻', '🦉', '🌟', '🎯', '🎮', '🚀', '🍀']) {
      expect(OTTER_AVATAR_IMAGES[getOtterAvatarPose(emoji)]).toMatch(/^\/otter\/v3\/avatar\//);
    }
    expect(getOtterAvatarPose('🚀')).toBe('joy');
  });

  it('비어 있거나 알 수 없는 저장값은 기본 수달로 표시한다', () => {
    for (const emoji of ['', '미등록', 'constructor', 'toString']) {
      expect(getOtterAvatarPose(emoji)).toBe('hello');
    }
  });
});
