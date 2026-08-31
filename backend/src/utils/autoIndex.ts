import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import { extractTextFromFile } from '../document/textExtractor';
import { chunkDocumentPages } from '../document/chunker';
import { embeddingService } from '../embeddings/embeddingService';
import { vectorStore, VectorRecord } from '../vector/vectorStore';
import { Document } from '../models/Document';
import { DocumentChunk } from '../models/DocumentChunk';
import { Collection } from '../models/Collection';
import { User } from '../models/User';
import { isDbConnected } from '../config/database';
import { memoryDb } from '../config/memoryDb';
import { logger } from './logger';

/**
 * Universal file resolver that safely finds knowledge files in all environments:
 * - Local development with ts-node
 * - Production compiled build in dist/
 * - Monorepo root or backend-only subfolder deployments (e.g. Render)
 */
function resolveKnowledgePath(fileName: string): string | null {
  const candidatePaths = [
    path.resolve(__dirname, '../../../sample_data', fileName),
    path.resolve(__dirname, '../../sample_data', fileName),
    path.resolve(__dirname, '../sample_data', fileName),
    path.resolve(__dirname, './sample_data', fileName),
    path.resolve(process.cwd(), 'sample_data', fileName),
    path.resolve(process.cwd(), '../sample_data', fileName),
    path.resolve(process.cwd(), 'backend/sample_data', fileName),
  ];

  for (const candidate of candidatePaths) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  return null;
}

export async function autoIndexDefaultKnowledge(): Promise<void> {
  try {
    logger.info('Auto-indexing official PCCOE Knowledge Bases into Vector Store & Database...');

    const filesToResolve = [
      // ─── CORE ACADEMICS & ADMISSIONS ───────────────────────────────────────
      {
        fileName: 'college_sample_knowledge.txt',
        docId: 'pccoe-handbook-official-2026',
        title: 'PCCOE Autonomous Academic Regulations & Admission Handbook 2026-2027',
        department: 'All Departments',
        collection: 'Autonomous Academic Regulations',
      },
      {
        fileName: 'pccoe_departments_programs_2026.txt',
        docId: 'pccoe-departments-programs-2026',
        title: 'PCCOE All Departments, Programs & Courses 2026-27',
        department: 'All Departments',
        collection: 'Autonomous Academic Regulations',
      },
      {
        fileName: 'pccoe_admissions_fees_scholarships.txt',
        docId: 'pccoe-admissions-fees-scholarships-2026',
        title: 'PCCOE Admissions 2026-27: MHT-CET Cutoffs, Fee Structure & Scholarship Schemes',
        department: 'All Departments',
        collection: 'CAP Admissions & Cutoffs',
      },
      {
        fileName: 'pccoe_academics_examinations_student_life.txt',
        docId: 'pccoe-academics-examinations-student-life-2026',
        title: 'PCCOE Academic System, Examinations, Library, Hostel & Student Life 2026-27',
        department: 'All Departments',
        collection: 'In-Sem & End-Sem Examinations',
      },

      // ─── PLACEMENTS & STUDENT CLUBS ────────────────────────────────────────
      {
        fileName: 'pccoe_placements_training.txt',
        docId: 'pccoe-placements-training-2026',
        title: 'PCCOE Training & Placement Cell: Statistics, Recruiters & Industry Relations 2026',
        department: 'All Departments',
        collection: 'T&P Placements & Internships',
      },
      {
        fileName: 'pccoe_collegiate_clubs_motorsports.txt',
        docId: 'pccoe-collegiate-clubs-motorsports-2026',
        title: 'PCCOE Collegiate Clubs & Motorsports Teams (Red Baron, Kratos, Automatons, Coding Club)',
        department: 'All Departments',
        collection: 'Student Clubs & Team Kratos Racing',
      },
      {
        fileName: 'pccoe_student_clubs_and_associations.txt',
        docId: 'pccoe-clubs-associations-2026',
        title: 'PCCOE Departmental Student Associations & Technical Clubs Handbook (ITSA, CESA, TKR)',
        department: 'Information Technology',
        collection: 'Student Clubs & Team Kratos Racing',
      },

      // ─── INSTITUTIONAL PROFILE & RANKINGS ───────────────────────────────────
      {
        fileName: 'pccoe_comprehensive_overview.txt',
        docId: 'pccoe-comprehensive-overview-2026',
        title: 'PCCOE Official Institutional Profile & Comprehensive Overview 2026',
        department: 'All Departments',
        collection: 'General College Circulars',
      },
      {
        fileName: 'pccoe_rankings_accreditations.txt',
        docId: 'pccoe-rankings-accreditations-2026',
        title: 'PCCOE National Rankings, NBA/NAAC Accreditations & Achievements 2026',
        department: 'All Departments',
        collection: 'General College Circulars',
      },
    ];

    let totalIndexed = 0;
    let adminUserId: any = null;

    if (isDbConnected()) {
      const adminUser = await User.findOne({ role: 'admin' });
      adminUserId = adminUser ? adminUser._id : new mongoose.Types.ObjectId();
    }

    for (const item of filesToResolve) {
      const resolvedPath = resolveKnowledgePath(item.fileName);

      if (!resolvedPath) {
        logger.warn(`Knowledge file "${item.fileName}" could not be found across search paths.`);
        continue;
      }

      logger.info(`Indexing: ${item.title}`);
      const fileStats = fs.statSync(resolvedPath);
      const extraction = await extractTextFromFile(resolvedPath, 'text/plain');
      const chunks = chunkDocumentPages(extraction.pages, {
        documentId: item.docId,
        documentTitle: item.title,
        department: item.department,
        collectionName: item.collection,
        documentVersion: 1,
      });

      const vectorRecords: VectorRecord[] = [];
      const dbChunkDocs: any[] = [];

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

        dbChunkDocs.push({
          documentId: item.docId,
          chunkIndex: chunk.chunkIndex,
          text: chunk.text,
          pageNumber: chunk.pageNumber,
          vectorId: chunk.vectorId,
          department: item.department,
          collectionName: item.collection,
          documentVersion: 1,
          metadata: chunk.metadata,
        });
      }

      await vectorStore.upsertVectors(vectorRecords);
      totalIndexed += vectorRecords.length;

      // Sync into MongoDB Database
      if (isDbConnected()) {
        await Collection.findOneAndUpdate(
          { name: item.collection },
          {
            $setOnInsert: {
              name: item.collection,
              description: `${item.collection} official documents`,
              department: item.department || 'All Departments',
              documentCount: 0,
            },
          },
          { upsert: true }
        );

        const existingDoc = await Document.findOne({ filename: item.fileName });
        let docId = item.docId;

        if (existingDoc) {
          docId = existingDoc._id.toString();
          existingDoc.title = item.title;
          existingDoc.department = item.department;
          existingDoc.collectionName = item.collection;
          existingDoc.fileSize = fileStats.size;
          existingDoc.chunkCount = chunks.length;
          existingDoc.pageCount = extraction.totalPages;
          existingDoc.status = 'processed';
          existingDoc.processingProgress = 100;
          existingDoc.processingStage = 'Ready';
          await existingDoc.save();
        } else {
          const newDoc = await Document.create({
            _id: new mongoose.Types.ObjectId(),
            title: item.title,
            filename: item.fileName,
            fileUrl: `/sample_data/${item.fileName}`,
            fileType: 'text/plain',
            fileSize: fileStats.size,
            department: item.department,
            collectionName: item.collection,
            version: 1,
            status: 'processed',
            processingProgress: 100,
            processingStage: 'Ready',
            chunkCount: chunks.length,
            pageCount: extraction.totalPages,
            uploadedBy: adminUserId,
          });
          docId = newDoc._id.toString();
        }

        await DocumentChunk.deleteMany({ documentId: docId });
        await DocumentChunk.insertMany(
          dbChunkDocs.map((c) => ({ ...c, documentId: docId }))
        );
      } else {
        // Sync into in-memory store
        const memDoc = {
          _id: item.docId,
          id: item.docId,
          title: item.title,
          filename: item.fileName,
          fileUrl: `/sample_data/${item.fileName}`,
          fileType: 'text/plain',
          fileSize: fileStats.size,
          department: item.department,
          collectionName: item.collection,
          version: 1,
          status: 'processed',
          processingProgress: 100,
          processingStage: 'Ready',
          chunkCount: chunks.length,
          pageCount: extraction.totalPages,
          uploadedBy: { _id: 'admin', name: 'Admin', email: 'admin@pccoe.org' },
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        memoryDb.documents.set(item.docId, memDoc);
        memoryDb.documentChunks.set(item.docId, dbChunkDocs);

        if (!Array.from(memoryDb.collections.values()).some((c: any) => c.name === item.collection)) {
          const newColId = `col-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`;
          memoryDb.collections.set(newColId, {
            _id: newColId,
            name: item.collection,
            description: `${item.collection} official documents`,
            department: item.department || 'All Departments',
            documentCount: 0,
            createdAt: new Date(),
          });
        }
      }

      logger.info(`  ✅ Indexed ${vectorRecords.length} chunks from: ${item.title}`);
    }

    logger.info(`Successfully auto-indexed ${totalIndexed} PCCOE knowledge vectors across all official handbooks.`);
  } catch (error: any) {
    logger.warn(`Auto-indexing knowledge notice: ${error.message}`);
  }
}
