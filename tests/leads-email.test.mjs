import test from 'node:test';
import assert from 'node:assert/strict';
import { createEmailToken, validEmailToken, sendLoginEmail } from '../lib/leads-email.ts';

test('email links expire, reject tampering and revoke on secret or recipient changes', () => {
  process.env.RESEND_API_KEY='test-only'; process.env.LEADS_LOGIN_EMAIL='owner@example.com';
  process.env.LEADS_SESSION_SECRET='s'.repeat(40);process.env.LEADS_ACCESS_CODE='p'.repeat(40);
  const now=1800000000000; const token=createEmailToken(now);
  assert.equal(validEmailToken(token,now),true);
  assert.equal(validEmailToken(token+'x',now),false);
  assert.equal(validEmailToken(token+'.extra',now),false);
  assert.equal(validEmailToken(token,now+901000),false);
  assert.equal(validEmailToken(token,now-300000),false);
  process.env.LEADS_LOGIN_EMAIL='other@example.com';assert.equal(validEmailToken(token,now),false);
  process.env.LEADS_LOGIN_EMAIL='owner@example.com';process.env.LEADS_SESSION_SECRET='r'.repeat(40);
  assert.equal(validEmailToken(token,now),false);
});
test('send is limited to approved address, deduplicated, and disabled in previews', async t => {
  process.env.RESEND_API_KEY='test-only';process.env.LEADS_LOGIN_EMAIL='owner@example.com';
  process.env.LEADS_SESSION_SECRET='s'.repeat(40);process.env.LEADS_ACCESS_CODE='p'.repeat(40);
  process.env.VERCEL_ENV='production';const requests=[];
  t.mock.method(globalThis,'fetch',async (url,init)=>{requests.push({url,...init});return Response.json({id:'test'});});
  await sendLoginEmail('attacker@example.com');assert.equal(requests.length,0);
  await sendLoginEmail(' OWNER@example.com ');await sendLoginEmail('owner@example.com');
  assert.equal(requests.length,2);const body=JSON.parse(requests[0].body);
  assert.deepEqual(body.to,['owner@example.com']);assert.match(body.text,/https:\/\/thegroveatdefoorfarm.com\/leads\?login=/);
  assert.equal(requests[0].headers['Idempotency-Key'],requests[1].headers['Idempotency-Key']);
  process.env.VERCEL_ENV='preview';await assert.rejects(sendLoginEmail('owner@example.com'));
  assert.equal(requests.length,2);
});
