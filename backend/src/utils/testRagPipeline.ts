import { autoIndexDefaultKnowledge } from './autoIndex';
import { seedStructuredData } from './seedStructuredData';
import { ragService } from '../services/ragService';
import { connectDatabase } from '../config/database';
import { seedAdminUser } from './seedAdmin';

async function runCompletePCCOEAcceptanceSuite() {
  console.log('\n==============================================================');
  console.log('🏛️ RUNNING PCCOE COMPLETE KNOWLEDGE BASE & RAG VERIFICATION');
  console.log('==============================================================\n');

  await connectDatabase();
  await seedAdminUser();
  await seedStructuredData();
  await autoIndexDefaultKnowledge();

  const studentId = '65d1b2222222222222222222';

  // -------------------------------------------------------------
  // TEST 1: What is ITSA?
  // -------------------------------------------------------------
  console.log('--------------------------------------------------------------');
  console.log('🔍 TEST 1: "What is ITSA?"');
  const res1 = await ragService.answerQuestion('What is ITSA?', studentId);
  console.log('\n🤖 AI Generated Answer:\n' + res1.answer);
  console.log(`\n📚 Sources (${res1.sources.length}):`);
  res1.sources.forEach((s) => {
    console.log(`  - 📄 ${s.documentTitle} (Page ${s.pageNumber}) — Match: ${s.relevanceScore}% [${s.relevanceLabel}]`);
  });

  if (!res1.isGrounded || res1.sources.length === 0) {
    throw new Error('TEST 1 FAILED: ITSA query was not grounded with sources!');
  }
  console.log('✅ TEST 1 PASSED: ITSA retrieved and synthesized by LLM.');

  // -------------------------------------------------------------
  // TEST 2: Tell me about ITSA activities.
  // -------------------------------------------------------------
  console.log('\n--------------------------------------------------------------');
  console.log('🔍 TEST 2: "Tell me about ITSA activities."');
  const res2 = await ragService.answerQuestion('Tell me about ITSA activities.', studentId, res1.conversationId);
  console.log('\n🤖 AI Generated Answer:\n' + res2.answer);
  console.log(`\n📚 Sources (${res2.sources.length}):`);
  res2.sources.forEach((s) => {
    console.log(`  - 📄 ${s.documentTitle} (Page ${s.pageNumber}) — Match: ${s.relevanceScore}% [${s.relevanceLabel}]`);
  });

  if (!res2.isGrounded || res2.sources.length === 0) {
    throw new Error('TEST 2 FAILED: ITSA activities query was not grounded!');
  }
  console.log('✅ TEST 2 PASSED: ITSA activities retrieved.');

  // -------------------------------------------------------------
  // TEST 3: What is the IT department and who is the HOD?
  // -------------------------------------------------------------
  console.log('\n--------------------------------------------------------------');
  console.log('🔍 TEST 3: "What is the IT department and who is the HOD?"');
  const res3 = await ragService.answerQuestion('What is the IT department and who is the HOD?', studentId);
  console.log('\n🤖 AI Generated Answer:\n' + res3.answer);
  console.log(`\n📚 Sources (${res3.sources.length}):`);
  res3.sources.forEach((s) => {
    console.log(`  - 📄 ${s.documentTitle} (Page ${s.pageNumber}) — Match: ${s.relevanceScore}% [${s.relevanceLabel}]`);
  });

  if (!res3.isGrounded || res3.sources.length === 0) {
    throw new Error('TEST 3 FAILED: IT Department query was not grounded!');
  }
  console.log('✅ TEST 3 PASSED: Department profile and HOD retrieved.');

  // -------------------------------------------------------------
  // TEST 4: What was the PCCOE IT cutoff in 2023?
  // -------------------------------------------------------------
  console.log('\n--------------------------------------------------------------');
  console.log('🔍 TEST 4: "What was the PCCOE IT cutoff in 2023?"');
  const res4 = await ragService.answerQuestion('What was the PCCOE IT cutoff in 2023?', studentId);
  console.log('\n🤖 AI Generated Answer:\n' + res4.answer);
  console.log(`\n📚 Sources (${res4.sources.length}):`);
  res4.sources.forEach((s) => {
    console.log(`  - 📄 ${s.documentTitle} (Page ${s.pageNumber}) — Match: ${s.relevanceScore}% [${s.relevanceLabel}]`);
  });

  if (!res4.isGrounded || res4.sources.length === 0) {
    throw new Error('TEST 4 FAILED: 2023 IT cutoff query was not grounded!');
  }
  console.log('✅ TEST 4 PASSED: 2023 cutoff retrieved and answered.');

  // -------------------------------------------------------------
  // TEST 5: Hostel Fees & Curfew Timings
  // -------------------------------------------------------------
  console.log('\n--------------------------------------------------------------');
  console.log('🔍 TEST 5: "What are the hostel fees and curfew timings at the Nigdi campus?"');
  const res5 = await ragService.answerQuestion('What are the hostel fees and curfew timings at the Nigdi campus?', studentId);
  console.log('\n🤖 AI Generated Answer:\n' + res5.answer);
  console.log(`\n📚 Sources (${res5.sources.length}):`);
  res5.sources.forEach((s) => {
    console.log(`  - 📄 ${s.documentTitle} (Page ${s.pageNumber}) — Match: ${s.relevanceScore}% [${s.relevanceLabel}]`);
  });

  if (!res5.isGrounded || res5.sources.length === 0) {
    throw new Error('TEST 5 FAILED: Hostel query was not grounded!');
  }
  console.log('✅ TEST 5 PASSED: Hostel fees and rules retrieved.');

  // -------------------------------------------------------------
  // TEST 6: Unknown / Out-of-Domain Query
  // -------------------------------------------------------------
  console.log('\n--------------------------------------------------------------');
  console.log('🔍 TEST 6: "Who will win tomorrow\'s cricket match?"');
  const res6 = await ragService.answerQuestion('Who will win tomorrow\'s cricket match?', studentId);
  console.log('\n🤖 AI Generated Answer:\n' + res6.answer);
  console.log(`📚 Sources attached: ${res6.sources.length}`);

  if (res6.isGrounded || res6.sources.length > 0) {
    throw new Error('TEST 6 FAILED: Out-of-domain query should have 0 sources and isGrounded = false!');
  }
  console.log('✅ TEST 6 PASSED: Out-of-domain query correctly refused with 0 sources.');

  console.log('\n==============================================================');
  console.log('🎉 ALL 6 ACCEPTANCE TESTS PASSED WITH 100% SUCCESS!');
  console.log('==============================================================\n');
  process.exit(0);
}

runCompletePCCOEAcceptanceSuite().catch((err) => {
  console.error('❌ Acceptance Test Failed:', err);
  process.exit(1);
});
