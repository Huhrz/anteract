import assert from 'node:assert/strict';
import { test } from 'node:test';
import { compareMessages, mergeMessages, validMessage, sortConversations, messagingError } from '../src/lib/messaging.ts';
const message=(id,created_at='2026-11-03T00:00:00.123456+00:00')=>({id,created_at,conversation_id:'thread',sender_id:'sender',content:id});
test('REST responses, retries and Realtime events merge into one ordered message per ID',()=>{
  const original=[message('b'),message('a')];
  const merged=mergeMessages(original,[message('b'),message('c','2026-11-03T00:00:00.123457Z')]);
  assert.deepEqual(merged.map(x=>x.id),['a','b','c']);
  assert.equal(original.length,2);
  assert.ok(compareMessages(message('z','2026-11-03T00:00:00.123456Z'),message('a','2026-11-03T00:00:00.123457+00:00'))<0);
  assert.equal(compareMessages(message('a','2026-11-03T00:00:00.123Z'),message('a','2026-11-02T16:00:00.123000-08:00')),0);
});
test('prepending history and reconnecting preserve every unique message',()=>{
  const recent=[message('c'),message('d')];
  assert.deepEqual(mergeMessages(recent,[message('a'),message('b'),message('c')]).map(x=>x.id),['a','b','c','d']);
});
test('message validation rejects blanks and enforces Unicode character length',()=>{
  assert.equal(validMessage(' \n\t '),false);assert.equal(validMessage('x'.repeat(1001)),false);
  assert.equal(validMessage('🙂'.repeat(1000)),true);assert.equal(validMessage('Hello\nthere'),true);
});
test('incoming previews reorder conversations without mutating the source list',()=>{
  const a={id:'a',created_at:'2026-11-01T00:00:00Z',last_created_at:null};
  const b={id:'b',created_at:'2026-11-02T00:00:00Z',last_created_at:'2026-11-03T00:00:00Z'};
  const original=[a,b];assert.deepEqual(sortConversations(original).map(x=>x.id),['b','a']);assert.equal(original[0],a);
});
test('authorization and missing migration errors give actionable messages',()=>{
  assert.match(messagingError({code:'42501'}),/accepted friends/);
  assert.match(messagingError({code:'PGRST202'}),/migration/);
  assert.match(messagingError(new Error('Offline')),/Offline/);
});
