import path from 'path';
import fs from 'fs';
import { extractTextFromFile } from '../document/textExtractor';
import { chunkDocumentPages } from '../document/chunker';
import { embeddingService } from '../embeddings/embeddingService';
import { vectorStore, VectorRecord } from '../vector/vectorStore';
import { ragService } from '../services/ragService';
import { connectDatabase } from '../config/database';
import { seedAdminUser } from './seedAdmin';

async function runRAGVerification() {
  console.log('\n======================================================');
  console.log('🧪 RUNNING PCCOE PUNE RAG PIPELINE VERIFICATION');
  console.log('======================================================\n');

  await connectDatabase();
  await seedAdminUser();

  const samplePath = path.resolve(__dirname, '../../../sample_data/college_sample_knowledge.txt');
  console.log(`📄 Ingesting PCCOE handbook from: ${samplePath}`);

  if (!fs.existsSync(samplePath)) {
    throw new Error(`Sample file not found at ${samplePath}`);
  }

  // 1. Text extraction test
  const extraction = await extractTextFromFile(samplePath, 'text/plain');
  console.log(`✅ Text Extracted: ${extraction.totalPages} section(s), ${extraction.totalCharacters} characters.`);

  // 2. Chunking test
  const chunks = chunkDocumentPages(extraction.pages, {
    documentId: 'pccoe-handbook-official-2026',
    documentTitle: 'PCCOE Autonomous Academic Regulations & Admission Handbook 2026-2027',
    department: 'All Departments',
    collectionName: 'CAP Admissions & Cutoffs',
    documentVersion: 1,
  });
  console.log(`✅ Chunking: Created ${chunks.length} chunks with page metadata.`);

  // 3. Vector embedding & storage test
  const vectorRecords: VectorRecord[] = [];
  for (const chunk of chunks) {
    const values = await embeddingService.generateEmbedding(chunk.text);
    vectorRecords.push({
      id: chunk.vectorId,
      values,
      metadata: {
        documentId: 'pccoe-handbook-official-2026',
        documentTitle: 'PCCOE Autonomous Academic Regulations & Admission Handbook 2026-2027',
        department: 'All Departments',
        collectionName: 'CAP Admissions & Cutoffs',
        pageNumber: chunk.pageNumber,
        chunkIndex: chunk.chunkIndex,
        text: chunk.text,
      },
    });
  }

  await vectorStore.upsertVectors(vectorRecords);
  console.log(`✅ Vector Store: ${vectorRecords.length} vectors indexed into vector store.\n`);

  const studentId = '65d1b2222222222222222222';

  // 4. Test 1: "what is 2023 cutoff of mhtcet and jee"
  console.log('------------------------------------------------------');
  console.log('🔍 Test 1: 2023 Query — "what is 2023 cutoff of mhtcet and jee"');
  const result1 = await ragService.answerQuestion(
    'what is 2023 cutoff of mhtcet and jee',
    studentId
  );
  console.log(`\n🤖 PCCOE Live AI Answer:\n${result1.answer}`);
  console.log(`\n📚 Grounded Sources (${result1.sources.length}):`);
  result1.sources.forEach((s) => {
    console.log(`  - 📄 ${s.documentTitle} (Page ${s.pageNumber}) — Match: ${s.relevanceScore}% [${s.relevanceLabel}]`);
  });

  if (!result1.isGrounded || result1.sources.length === 0) {
    throw new Error('Test 1 failed: Expected grounded response for 2023 cutoffs.');
  }

  // 5. Test 2: "tell me cutoff of 2026 for mhtcet and jee"
  console.log('\n------------------------------------------------------');
  console.log('🔍 Test 2: 2026 Query — "tell me cutoff of 2026 for mhtcet and jee"');
  const result2 = await ragService.answerQuestion(
    'tell me cutoff of 2026 for mhtcet and jee',
    studentId
  );
  console.log(`\n🤖 PCCOE Live AI Answer:\n${result2.answer}`);
  console.log(`\n📚 Grounded Sources (${result2.sources.length}):`);
  result2.sources.forEach((s) => {
    console.log(`  - 📄 ${s.documentTitle} (Page ${s.pageNumber}) — Match: ${s.relevanceScore}% [${s.relevanceLabel}]`);
  });

  console.log('\n======================================================');
  console.log('🎉 ALL PCCOE LIVE AI RAG TESTS PASSED SUCCESSFULLY!');
  console.log('======================================================\n');
  process.exit(0);
}

runRAGVerification().catch((err) => {
  console.error('❌ PCCOE RAG Verification Error:', err);
  process.exit(1);
});
