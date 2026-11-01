import assert from 'node:assert/strict';
import { test } from 'node:test';
import { parseSocialLinks } from '../src/lib/social-links.ts';
import { readGuestState, guestReducer, guestUserId } from '../src/lib/guest-state.ts';

test('social links normalize domains, preserve paths and ignore optional empty rows',()=>{
 assert.deepEqual(parseSocialLinks([{platform:'Instagram',url:' Instagram.com/Anteract '},{platform:'LinkedIn',url:'https://www.linkedin.com/in/student/'},{platform:'Discord',url:''}]),{ok:true,links:[{platform:'Instagram',url:'https://instagram.com/Anteract'},{platform:'LinkedIn',url:'https://www.linkedin.com/in/student/'}]});
 assert.deepEqual(parseSocialLinks(undefined),{ok:true,links:[]});
 assert.deepEqual(parseSocialLinks([]),{ok:true,links:[]});
});

test('social links reject unsafe URLs, credentials and malformed input',()=>{
 for(const url of ['javascript:alert(1)','data:text/html,hi','file:///tmp/example','http://example.com','https://name:password@example.com','https://localhost','https://example.com/\npath','not a link'])assert.equal(parseSocialLinks([{platform:'Website',url}]).ok,false,url);
 assert.equal(parseSocialLinks([{platform:'Unknown',url:'https://example.com'}]).ok,false);
 assert.equal(parseSocialLinks([null]).ok,false);
 assert.equal(parseSocialLinks('https://example.com').ok,false);
});

test('social links enforce count, duplicates and URL length while allowing removal',()=>{
 assert.equal(parseSocialLinks(Array.from({length:6},(_,i)=>({platform:'Website',url:`https://example.com/${i}`}))).ok,false);
 assert.equal(parseSocialLinks([{platform:'Instagram',url:'https://example.com'},{platform:'Website',url:'EXAMPLE.com/'}]).ok,false);
 assert.equal(parseSocialLinks([{platform:'Website',url:'https://example.com/'+ 'a'.repeat(500)}]).ok,false);
 assert.equal(parseSocialLinks(Array.from({length:5},(_,i)=>({platform:'Website',url:`https://example.com/${i}`}))).ok,true);
});

test('guest profile edits preserve social links through refresh and clear them without losing other data',()=>{
 const state={version:1,events:[],requests:[],profile:{id:guestUserId,display_name:'Guest',major:'Informatics',class_year:'Third year',interests:['Coffee'],avatar_path:null,photoUrl:''}};
 const links=[{platform:'Instagram',url:'https://instagram.com/example'}];
 const saved=guestReducer(state,{type:'profile',profile:{...state.profile,social_links:links}});
 assert.deepEqual(readGuestState(JSON.stringify(saved),state).profile.social_links,links);
 const cleared=guestReducer(saved,{type:'profile',profile:{...saved.profile,social_links:[]}});
 assert.deepEqual(cleared.profile.interests,['Coffee']);
 assert.deepEqual(cleared.profile.social_links,[]);
 assert.equal(readGuestState(JSON.stringify(state),state).profile.social_links,undefined);
});
