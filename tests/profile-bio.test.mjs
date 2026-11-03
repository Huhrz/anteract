import assert from 'node:assert/strict';
import { test } from 'node:test';
import { guestReducer, guestUserId, readGuestState } from '../src/lib/guest-state.ts';

const legacy = { version: 1, events: [], requests: [], profile: { id: guestUserId, display_name: 'Anteater', major: 'Informatics', class_year: 'Third year', interests: ['Coffee'], avatar_path: null, photoUrl: '' } };

test('bio edits survive guest storage and can be cleared without losing profile details', () => {
  const saved = guestReducer(legacy, { type: 'profile', profile: { ...legacy.profile, bio: 'Aldrich Park walks & study breaks.' } });
  const restored = readGuestState(JSON.stringify(saved), legacy);
  assert.equal(restored.profile.bio, 'Aldrich Park walks & study breaks.');
  const cleared = guestReducer(restored, { type: 'profile', profile: { ...restored.profile, bio: '' } });
  assert.equal(readGuestState(JSON.stringify(cleared), legacy).profile.bio, '');
  assert.deepEqual(cleared.profile.interests, ['Coffee']);
  assert.equal(cleared.profile.major, 'Informatics');
});

test('profiles saved before bio support remain readable', () => {
  const restored = readGuestState(JSON.stringify(legacy), legacy);
  assert.equal(restored.profile.display_name, 'Anteater');
  assert.equal(restored.profile.bio, undefined);
});
