import test from 'node:test';
import assert from 'node:assert/strict';
import { approvedSampleKybDraft, emptyKybDraft, sampleKybDraft, kybReadiness, kybPacket, peopleIssues, documentMetadata, documentTypes } from '../src/lib/kyb';
const sampleDocument = { name: 'sample.pdf', size: 120, type: 'application/pdf' };
test('hackathon sample approval remains separate from provider verification and credential claims',()=>{
  const draft=approvedSampleKybDraft();assert.deepEqual(Object.values(kybReadiness(draft)).flat(),[]);
  const packet=kybPacket(draft,'2026-11-14T12:00:00.000Z',true);
  assert.equal(packet.demoApproval?.state,'approved');assert.equal(packet.demoApproval?.mode,'hackathon');
  assert.equal(packet.verified,false);assert.equal(packet.credentialIssued,false);assert.equal(packet.providerSubmission,'not_sent');assert.equal(packet.documentContentsIncluded,false);
  assert.equal(kybPacket(draft,packet.preparedAt).demoApproval,undefined);
  draft.documents={};assert.throws(()=>kybPacket(draft,packet.preparedAt,true),/Complete all intake/);
});
function completeDraft() { const d = sampleKybDraft(); for (const t of documentTypes.filter(t => t.required)) d.documents[t.id] = { ...sampleDocument }; return d; }
test('KYB intake rejects incomplete evidence and exports only an explicitly unverified local request', () => {
  assert.equal(kybReadiness(emptyKybDraft()).documents.length, 4);
  assert.throws(() => kybPacket(sampleKybDraft(), new Date().toISOString()), /Complete all intake/);
  const packet = kybPacket(completeDraft(), '2026-11-12T00:00:00.000Z');
  assert.equal(packet.verified, false);
  assert.equal(packet.credentialIssued, false);
  assert.equal(packet.providerSubmission, 'not_sent');
  assert.equal(packet.documentContentsIncluded, false);
  assert.deepEqual(packet.checks, { registry: 'not_run', identity: 'not_run', sanctions: 'not_run', manualReview: 'not_started' });
});
test('KYB ownership rejects over-allocation, duplicate people and missing control roles', () => {
  const d = completeDraft();
  d.people.push({ id: 'second', name: 'Another Example', country: 'United States', ownership: '25', controller: false });
  assert(peopleIssues(d).some(i => i.includes('exceed 100')));
  d.people[0].ownership = '75';
  assert.equal(peopleIssues(d).length, 0);
  d.people[1].name = ' Jamie Example ';
  assert(peopleIssues(d).some(i => i.includes('listed once')));
  d.people[1].name = 'Another Example';
  d.people[0].controller = false;
  assert(peopleIssues(d).some(i => i.includes('control or management')));
});
test('sample document intake validates type and size while keeping metadata only', () => {
  assert.deepEqual(documentMetadata(sampleDocument), sampleDocument);
  assert.throws(() => documentMetadata({ ...sampleDocument, name: 'document.exe' }), /matching file type/);
  assert.throws(() => documentMetadata({ ...sampleDocument, type: 'text/plain' }), /matching file type/);
  assert.throws(() => documentMetadata({ ...sampleDocument, size: 0 }), /non-empty/);
  assert.throws(() => documentMetadata({ ...sampleDocument, size: 10 * 1024 * 1024 + 1 }), /10 MB/);
});
