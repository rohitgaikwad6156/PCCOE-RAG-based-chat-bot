import fs from 'fs';
import path from 'path';
import { extractTextFromFile } from '../document/textExtractor';
import { chunkDocumentPages } from '../document/chunker';
import { embeddingService } from '../embeddings/embeddingService';
import { vectorStore, VectorRecord } from '../vector/vectorStore';
import { logger } from './logger';

export async function autoIndexDefaultKnowledge(): Promise<void> {
  try {
    logger.info('Auto-indexing official PCCOE Knowledge Bases into Vector Store...');

    const filesToIndex = [
      // ─── EXISTING CORE FILES ────────────────────────────────────────────────
      {
        path: path.resolve(__dirname, '../../../sample_data/college_sample_knowledge.txt'),
        docId: 'pccoe-handbook-official-2026',
        title: 'PCCOE Autonomous Academic Regulations & Admission Handbook 2026-2027',
        department: 'All Departments',
        collection: 'Autonomous Academic Regulations',
      },
      {
        path: path.resolve(__dirname, '../../../sample_data/pccoe_student_clubs_and_associations.txt'),
        docId: 'pccoe-clubs-associations-2026',
        title: 'PCCOE Departmental Student Associations & Technical Clubs Handbook (ITSA, CESA, TKR)',
        department: 'Information Technology',
        collection: 'Student Clubs & Team Kratos Racing',
      },

      // ─── EXPANDED OFFICIAL PCCOE KNOWLEDGE BASE ─────────────────────────────
      {
        path: path.resolve(__dirname, '../../../sample_data/pccoe_comprehensive_overview.txt'),
        docId: 'pccoe-comprehensive-overview-2026',
        title: 'PCCOE Official Institutional Profile & Comprehensive Overview 2026',
        department: 'All Departments',
        collection: 'Institutional Overview',
      },
      {
        path: path.resolve(__dirname, '../../../sample_data/pccoe_departments_programs_2026.txt'),
        docId: 'pccoe-departments-programs-2026',
        title: 'PCCOE All Departments, Programs & Courses 2026-27',
        department: 'All Departments',
        collection: 'Academic Programs',
      },
      {
        path: path.resolve(__dirname, '../../../sample_data/pccoe_collegiate_clubs_motorsports.txt'),
        docId: 'pccoe-collegiate-clubs-motorsports-2026',
        title: 'PCCOE Collegiate Clubs & Motorsports Teams (Red Baron, Kratos, Automatons, Coding Club)',
        department: 'All Departments',
        collection: 'Student Clubs & Team Kratos Racing',
      },
      {
        path: path.resolve(__dirname, '../../../sample_data/pccoe_rankings_accreditations.txt'),
        docId: 'pccoe-rankings-accreditations-2026',
        title: 'PCCOE National Rankings, NBA/NAAC Accreditations & Achievements 2026',
        department: 'All Departments',
        collection: 'Accreditations & Rankings',
      },
      {
        path: path.resolve(__dirname, '../../../sample_data/pccoe_admissions_fees_scholarships.txt'),
        docId: 'pccoe-admissions-fees-scholarships-2026',
        title: 'PCCOE Admissions 2026-27: MHT-CET Cutoffs, Fee Structure & Scholarship Schemes',
        department: 'All Departments',
        collection: 'Admissions & Scholarships',
      },
      {
        path: path.resolve(__dirname, '../../../sample_data/pccoe_placements_training.txt'),
        docId: 'pccoe-placements-training-2026',
        title: 'PCCOE Training & Placement Cell: Statistics, Recruiters & Industry Relations 2026',
        department: 'All Departments',
        collection: 'Training & Placement',
      },
      {
        path: path.resolve(__dirname, '../../../sample_data/pccoe_academics_examinations_student_life.txt'),
        docId: 'pccoe-academics-examinations-student-life-2026',
        title: 'PCCOE Academic System, Examinations, Library, Hostel & Student Life 2026-27',
        department: 'All Departments',
        collection: 'Academic Regulations',
      },
    ];

    let totalIndexed = 0;

    for (const item of filesToIndex) {
      if (!fs.existsSync(item.path)) {
        logger.warn(`Knowledge file not found at ${item.path}`);
        continue;
      }

      logger.info(`Indexing: ${item.title}`);
      const extraction = await extractTextFromFile(item.path, 'text/plain');
      const chunks = chunkDocumentPages(extraction.pages, {
        documentId: item.docId,
        documentTitle: item.title,
        department: item.department,
        collectionName: item.collection,
        documentVersion: 1,
      });

      const vectorRecords: VectorRecord[] = [];
      for (const chunk of chunks) {
        const values = await embeddingService.generateEmbedding(chunk.text);
        vectorRecords.push({
          id: chunk.vectorId,
          values,
          metadata: {
            documentId: item.docId,
            documentTitle: item.title,
            department: item.department,
            collectionName: item.collection,
            pageNumber: chunk.pageNumber,
            chunkIndex: chunk.chunkIndex,
            text: chunk.text,
          },
        });
      }

      await vectorStore.upsertVectors(vectorRecords);
      totalIndexed += vectorRecords.length;
      logger.info(`  ✅ Indexed ${vectorRecords.length} chunks from: ${item.title}`);
    }

    logger.info(`Successfully auto-indexed ${totalIndexed} PCCOE knowledge vectors across all official handbooks.`);
  } catch (error: any) {
    logger.warn(`Auto-indexing knowledge notice: ${error.message}`);
  }
}
