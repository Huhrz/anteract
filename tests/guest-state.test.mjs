import assert from 'node:assert/strict';
import { test } from 'node:test';
import { guestReducer, guestUserId, readGuestState } from '../src/lib/guest-state.ts';
import { canUseGuestMode } from '../src/lib/guest-mode.ts';

const event = {id:'sample',title:'Study together',category:'Study',location:'Library',startsAt:'2099-11-01T16:00:00Z',time:'Future',description:'Bring your notes',participants:2,capacity:3,hostId:'maya',hostName:'Maya',attendeeIds:['sam'],meetingPoint:'Entrance',bring:'Notes',tags:['finals'],isHost:false,isJoined:false};
const state = () => ({version:1,events:[structuredClone(event)],profile:{id:guestUserId,display_name:'Guest',major:'',class_year:'',interests:[],avatar_path:null,photoUrl:''},requests:[]});

test('guest opt-in cannot replace a configured backend',()=>{
 assert.equal(canUseGuestMode(undefined,undefined,undefined),false);
 assert.equal(canUseGuestMode('true',undefined,undefined),true);
 assert.equal(canUseGuestMode('true','https://example.supabase.co',undefined),false);
 assert.equal(canUseGuestMode('true',undefined,'key'),false);
 assert.equal(canUseGuestMode('false',undefined,undefined),false);
});

test('guest membership is idempotent and leaving restores capacity',()=>{
 const initial=state(); const joined=guestReducer(initial,{type:'join',eventId:'sample'});
 assert.equal(joined.events[0].participants,3);
 assert.deepEqual(joined.events[0].attendeeIds,['sam',guestUserId]);
 assert.equal(guestReducer(joined,{type:'join',eventId:'sample'}),joined);
 const left=guestReducer(joined,{type:'leave',eventId:'sample'});
 assert.deepEqual(left.events,initial.events);
 assert.equal(initial.events[0].participants,2);
});

test('guest actions reject full, started and non-host cancellation cases',()=>{
 const full=state();full.events[0].participants=3;
 assert.throws(()=>guestReducer(full,{type:'join',eventId:'sample'}),/full/);
 assert.throws(()=>guestReducer(state(),{type:'cancel',eventId:'sample'}),/host/);
 const past=state();past.events[0].startsAt='2000-01-01T00:00:00Z';
 assert.throws(()=>guestReducer(past,{type:'join',eventId:'sample'}),/started/);
});

test('creating, renaming a host and cancelling affect only the local host event',()=>{
 const created=guestReducer(state(),{type:'create',event:{...event,id:'own',hostId:guestUserId,isHost:true,participants:1,attendeeIds:[]}});
 const renamed=guestReducer(created,{type:'profile',profile:{...created.profile,display_name:'Allen Demo'}});
 assert.equal(renamed.events.find(e=>e.id==='own').hostName,'Allen Demo');
 assert.equal(renamed.events.find(e=>e.id==='sample').hostName,'Maya');
 assert.equal(guestReducer(renamed,{type:'cancel',eventId:'own'}).events.length,1);
});

test('friend consent and duplicate request rules persist through serialization',()=>{
 const incoming={id:'incoming',sender_id:'sam',recipient_id:guestUserId,status:'pending',created_at:new Date().toISOString()};
 const initial={...state(),requests:[incoming]};
 const accepted=guestReducer(initial,{type:'respond',requestId:'incoming',accept:true});
 assert.equal(accepted.requests[0].status,'accepted');
 assert.throws(()=>guestReducer(accepted,{type:'respond',requestId:'incoming',accept:false}),/pending/);
 assert.throws(()=>guestReducer(accepted,{type:'invite',request:{...incoming,id:'duplicate',sender_id:guestUserId,recipient_id:'sam'}}),/already/);
 assert.deepEqual(readGuestState(JSON.stringify(accepted),state()),accepted);
});

test('malformed browser saves fall back to a usable guest session',()=>{
 const fallback=state();
 for(const value of [null,'invalid','{}',JSON.stringify({...fallback,events:[{id:'broken'}]})])assert.equal(readGuestState(value,fallback),fallback);
});
