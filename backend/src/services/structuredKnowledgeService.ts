import { Department } from '../models/Department';
import { Course } from '../models/Course';
import { Faculty } from '../models/Faculty';
import { Fee } from '../models/Fee';
import { Club } from '../models/Club';
import { Notice } from '../models/Notice';
import { Placement } from '../models/Placement';
import { Hostel } from '../models/Hostel';
import { Scholarship } from '../models/Scholarship';
import { Library } from '../models/Library';
import { isDbConnected } from '../config/database';
import { memoryDb } from '../config/memoryDb';
import { logger } from '../utils/logger';

export class StructuredKnowledgeService {
  async queryStructuredKnowledge(query: string): Promise<string> {
    const qLower = query.toLowerCase();
    const findings: string[] = [];

    // Helper: check if query contains any of these terms
    const has = (...terms: string[]) => terms.some(t => qLower.includes(t));

    try {
      if (isDbConnected()) {
        // 1. Department queries
        if (has('department', 'hod', 'head of department', 'it department',
          'computer department', 'mechanical', 'civil', 'entc', 'aiml', 'electronics',
          'telecommunication', 'intake', 'labs', 'laboratory')) {
          const depts = await Department.find().lean();
          for (const d of depts) {
            if (qLower.includes(d.code.toLowerCase()) || qLower.includes(d.name.toLowerCase()) ||
              has('department', 'hod', 'head of department')) {
              findings.push(
                `[STRUCTURED DB: Department Profile]\n` +
                `Department: ${d.name} (${d.code})\n` +
                `HOD: ${d.hodName} | Email: ${d.hodEmail} | Phone: ${d.hodPhone}\n` +
                `Annual Intake: ${d.intake} Students | Established: ${d.establishedYear}\n` +
                `Key Laboratories: ${d.laboratories.join(', ')}\n` +
                `Affiliated Student Clubs: ${d.clubs.join(', ')}\n` +
                `Overview: ${d.description}`
              );
            }
          }
        }

        // 2. Course & Program queries
        if (has('course', 'program', 'degree', 'b.tech', 'btech', 'm.tech', 'mtech', 'mca', 'phd', 'intake', 'choice code', 'dte code', 'eligibility', 'duration')) {
          const courses = await Course.find().lean();
          for (const c of courses) {
            if (qLower.includes(c.name.toLowerCase()) || qLower.includes(c.department.toLowerCase()) || has('course', 'program', 'degree', 'btech', 'mca', 'mtech')) {
              findings.push(
                `[STRUCTURED DB: Academic Program / Course Record]\n` +
                `Course: ${c.name} (${c.degreeType})\n` +
                `Department: ${c.department} | Duration: ${c.durationYears} Years\n` +
                `DTE Choice Code: ${c.dteChoiceCode} | Annual Intake: ${c.intake} Seats\n` +
                `Eligibility: ${c.eligibility}\n` +
                `Annual Tuition Fee: Rs. ${c.tuitionFeeAnnual.toLocaleString()} | Total Annual Fee: Rs. ${c.totalFeeAnnual.toLocaleString()}`
              );
            }
          }
        }

        // 3. Faculty queries
        if (has('faculty', 'professor', 'teacher', 'dean', 'hod', 'director', 'kulkarni', 'deshmukh', 'patil', 'rajeswari', 'jadhav', 'wankhede', 'shaikh', 'panchwadkar', 'coordinator')) {
          const faculties = await Faculty.find().lean();
          for (const f of faculties) {
            if (qLower.includes(f.name.toLowerCase()) || qLower.includes(f.department.toLowerCase()) || has('faculty', 'professor', 'teacher', 'dean', 'hod', 'director')) {
              findings.push(
                `[STRUCTURED DB: Faculty Profile]\n` +
                `Name: ${f.name}\n` +
                `Department: ${f.department} | Designation: ${f.designation}\n` +
                `Qualification: ${f.qualification} | Experience: ${f.experienceYears} Years\n` +
                `Email: ${f.email} | Phone: ${f.phone}\n` +
                `Cabin: ${f.cabinLocation} | Research Area: ${f.researchArea}\n` +
                `Specializations: ${f.specialization.join(', ')}`
              );
            }
          }
        }

        // 4. Fee queries
        if (has('fee', 'fees', 'tuition', 'cost', 'charge', 'concession', 'waiver', 'development fee', 'open category fee', 'obc fee', 'sc fee', 'st fee', 'tfws fee', 'ebc fee')) {
          const fees = await Fee.find().lean();
          for (const fee of fees) {
            findings.push(
              `[STRUCTURED DB: Official College Fee Structure]\n` +
              `Course: ${fee.courseName} (${fee.academicYear})\n` +
              `Category: ${fee.category}\n` +
              `Tuition Fee: Rs. ${fee.tuitionFee.toLocaleString()} | Development Fee: Rs. ${fee.developmentFee.toLocaleString()} | Other Fees: Rs. ${fee.otherFees.toLocaleString()}\n` +
              `Total Annual Fee: Rs. ${fee.totalFeeAnnual.toLocaleString()}\n` +
              `Scholarship / Waiver Details: ${fee.scholarshipWaiverDescription}`
            );
          }
        }

        // 5. Club & Association queries
        if (has('club', 'association', 'itsa', 'cesa', 'tkr', 'kratos', 'robocon',
          'ieee', 'acm', 'gdsc', 'red baron', 'redbaron', 'solarium', 'ambush',
          'automatons', 'maverick', 'anantam', 'coding club', 'etsa', 'mesa',
          'motorsport', 'formula student', 'baja', 'atv', 'racing', 'student body',
          'student organization', 'technical club', 'student club', 'team')) {
          const clubs = await Club.find().lean();
          for (const c of clubs) {
            if (qLower.includes(c.shortCode.toLowerCase()) || qLower.includes(c.name.toLowerCase()) ||
              has('club', 'association', 'team', 'motorsport', 'racing', 'baja', 'formula')) {
              findings.push(
                `[STRUCTURED DB: Student Club / Association Profile]\n` +
                `Club Name: ${c.name} (${c.shortCode})\n` +
                `Department: ${c.department} | Category: ${c.category}\n` +
                `Faculty Coordinator: ${c.facultyCoordinator} | President: ${c.studentPresident}\n` +
                `Flagship Event: ${c.flagshipEvent}\n` +
                `Key Activities: ${c.activities.join('; ')}\n` +
                `Contact: ${c.contactEmail}\n` +
                `Mission: ${c.description}`
              );
            }
          }
        }

        // 6. Notices & Circular queries
        if (has('notice', 'circular', 'announcement', 'notification', 'update', 'latest news', 'advisory', 'dates')) {
          const notices = await Notice.find().sort({ publishedDate: -1 }).limit(5).lean();
          for (const n of notices) {
            findings.push(
              `[STRUCTURED DB: Official Notice / Circular]\n` +
              `Title: ${n.title}\n` +
              `Category: ${n.category} | Reference No: ${n.referenceNo}\n` +
              `Department: ${n.department} | Published: ${new Date(n.publishedDate).toLocaleDateString()}\n` +
              `Notice Summary: ${n.content}`
            );
          }
        }

        // 7. Placement queries
        if (has('placement', 'package', 'salary', 'recruiter', 'tpo', 'internship',
          'highest', 'average', 'lpa', 'ctc', 'company', 'job', 'offer', 'campus',
          'recruitment', 'microsoft', 'tcs', 'infosys', 'wipro', 'cognizant',
          'capgemini', 'adobe', 'amazon', 'bosch', 'cummins', 'kpit')) {
          const placements = await Placement.find().lean();
          for (const p of placements) {
            findings.push(
              `[STRUCTURED DB: Training & Placement Statistics]\n` +
              `Academic Year: ${p.academicYear}\n` +
              `Highest CTC: Rs. ${p.highestPackageLPA} LPA | Average CTC: Rs. ${p.averagePackageLPA} LPA\n` +
              `Total Companies Visited: ${p.totalCompaniesVisited}+ | Total Offers: ${p.totalOffers}+\n` +
              `Top Recruiting Companies: ${p.topRecruiters.join(', ')}\n` +
              `Internship Offers: ${p.internshipOffersCount}+ mandatory capstone internships\n` +
              `TPO Contact: ${p.tpoEmail} | Phone: ${p.tpoPhone}`
            );
          }
        }

        // 8. Hostel queries
        if (has('hostel', 'mess', 'curfew', 'warden', 'accommodation', 'room',
          'fee', 'dormitory', 'residence', 'stay', 'night out', 'biometric', 'boys hostel',
          'girls hostel', 'double occupancy', 'triple occupancy', 'mess charges')) {
          const hostels = await Hostel.find().lean();
          for (const h of hostels) {
            findings.push(
              `[STRUCTURED DB: Nigdi Campus Hostel Facility]\n` +
              `Building: ${h.buildingName} (${h.gender} Hostel)\n` +
              `Location: ${h.location} | Capacity: ${h.totalCapacity} Students\n` +
              `Fee Structure: Double Occupancy: Rs. ${h.doubleRoomFeeAnnual.toLocaleString()}/yr | Triple Occupancy: Rs. ${h.tripleRoomFeeAnnual.toLocaleString()}/yr\n` +
              `Mess Charges: Rs. ${h.messFeeAnnual.toLocaleString()}/yr (Pure Veg meal plans) | Caution Deposit: Rs. ${h.depositRefundable.toLocaleString()} (Refundable)\n` +
              `Curfew Timings: ${h.curfewTimeWeekday} (Weekdays), ${h.curfewTimeWeekend} (Weekends)\n` +
              `Warden: ${h.wardenName} (${h.wardenContact})\n` +
              `Amenities: ${h.facilities.join(', ')}`
            );
          }
        }

        // 9. Scholarship queries
        if (has('scholarship', 'freeship', 'mahadbt', 'ebc', 'fee waiver', 'financial aid', 'tfws', 'sc category', 'st category', 'obc', 'ews')) {
          const scholarships = await Scholarship.find().lean();
          for (const s of scholarships) {
            findings.push(
              `[STRUCTURED DB: Scholarship / Financial Aid Scheme]\n` +
              `Scheme: ${s.schemeName}\n` +
              `Eligible Category: ${s.category} | Portal: ${s.portal}\n` +
              `Tuition Fee Waiver: ${s.tuitionFeeWaiverPercentage}% | Exam Fee Waiver: ${s.examFeeWaiverPercentage}%\n` +
              `Income Limit: Rs. ${(s.incomeLimitAnnual || 0).toLocaleString()} per annum\n` +
              `Eligibility: ${s.eligibilityCriteria}\n` +
              `Required Documents: ${s.requiredDocuments.join(', ')}`
            );
          }
        }

        // 10. Library queries
        if (has('library', 'books', 'journals', 'kalam', 'volumes', 'reading room', 'ieee xplore', 'sciencedirect', 'opac', 'book bank')) {
          const libraries = await Library.find().lean();
          for (const lib of libraries) {
            findings.push(
              `[STRUCTURED DB: Central Library Facilities]\n` +
              `Library: ${lib.libraryName}\n` +
              `Location: ${lib.location}\n` +
              `Working Hours: ${lib.workingHoursRegular} (Exams: ${lib.workingHoursExamPeriod})\n` +
              `Resources: ${lib.totalVolumes.toLocaleString()}+ Volumes | ${lib.totalTitles.toLocaleString()}+ Titles\n` +
              `Digital Subscriptions: ${lib.eJournalSubscriptions.join(', ')}\n` +
              `Special Facilities: ${lib.facilities.join(', ')}`
            );
          }
        }
      } else {
        // In-Memory Database Fallback for Structured Data
        if (has('department', 'hod', 'head of department', 'faculty', 'it department', 'computer department', 'mechanical', 'civil', 'entc', 'aiml', 'labs', 'laboratory')) {
          for (const d of memoryDb.departments.values()) {
            if (qLower.includes(d.code.toLowerCase()) || qLower.includes(d.name.toLowerCase()) || has('department', 'hod', 'head of department')) {
              findings.push(
                `[STRUCTURED DB: Department Profile]\n` +
                `Department: ${d.name} (${d.code})\n` +
                `HOD: ${d.hodName} | Email: ${d.hodEmail} | Phone: ${d.hodPhone}\n` +
                `Annual Intake: ${d.intake} Students | Established: ${d.establishedYear}\n` +
                `Key Laboratories: ${d.laboratories.join(', ')}\n` +
                `Affiliated Student Clubs: ${d.clubs.join(', ')}\n` +
                `Overview: ${d.description}`
              );
            }
          }
        }

        if (has('club', 'association', 'itsa', 'cesa', 'tkr', 'kratos', 'robocon', 'ieee', 'acm', 'gdsc', 'red baron', 'redbaron', 'solarium', 'ambush', 'automatons', 'maverick', 'anantam', 'coding club', 'motorsport', 'formula student', 'baja', 'atv', 'racing', 'team', 'student body', 'etsa', 'mesa')) {
          for (const c of memoryDb.clubs.values()) {
            if (qLower.includes(c.shortCode.toLowerCase()) || qLower.includes(c.name.toLowerCase()) || has('club', 'association', 'team', 'motorsport', 'racing', 'baja')) {
              findings.push(
                `[STRUCTURED DB: Student Club / Association Profile]\n` +
                `Club Name: ${c.name} (${c.shortCode})\n` +
                `Department: ${c.department} | Category: ${c.category}\n` +
                `Faculty Coordinator: ${c.facultyCoordinator} | President: ${c.studentPresident}\n` +
                `Flagship Event: ${c.flagshipEvent}\n` +
                `Key Activities: ${c.activities.join('; ')}\n` +
                `Contact: ${c.contactEmail}\n` +
                `Mission: ${c.description}`
              );
            }
          }
        }

        if (has('placement', 'package', 'salary', 'recruiter', 'tpo', 'internship', 'highest', 'average', 'lpa', 'ctc', 'company', 'job', 'offer', 'campus')) {
          for (const p of memoryDb.placements.values()) {
            findings.push(
              `[STRUCTURED DB: Training & Placement Statistics]\n` +
              `Academic Year: ${p.academicYear}\n` +
              `Highest CTC: Rs. ${p.highestPackageLPA} LPA | Average CTC: Rs. ${p.averagePackageLPA} LPA\n` +
              `Total Companies Visited: ${p.totalCompaniesVisited}+ | Total Offers: ${p.totalOffers}+\n` +
              `Top Recruiting Companies: ${p.topRecruiters.join(', ')}\n` +
              `Internship Offers: ${p.internshipOffersCount}+ mandatory capstone internships\n` +
              `TPO Contact: ${p.tpoEmail} | Phone: ${p.tpoPhone}`
            );
          }
        }

        if (has('hostel', 'mess', 'curfew', 'warden', 'accommodation', 'room', 'dormitory', 'double occupancy', 'triple occupancy', 'mess charges', 'stay')) {
          for (const h of memoryDb.hostels.values()) {
            findings.push(
              `[STRUCTURED DB: Nigdi Campus Hostel Facility]\n` +
              `Building: ${h.buildingName} (${h.gender} Hostel)\n` +
              `Location: ${h.location} | Capacity: ${h.totalCapacity} Students\n` +
              `Fee Structure: Double Occupancy: Rs. ${h.doubleRoomFeeAnnual.toLocaleString()}/yr | Triple Occupancy: Rs. ${h.tripleRoomFeeAnnual.toLocaleString()}/yr\n` +
              `Mess Charges: Rs. ${h.messFeeAnnual.toLocaleString()}/yr | Caution Deposit: Rs. ${h.depositRefundable.toLocaleString()} (Refundable)\n` +
              `Curfew Timings: ${h.curfewTimeWeekday} (Weekdays), ${h.curfewTimeWeekend} (Weekends)\n` +
              `Warden: ${h.wardenName} (${h.wardenContact})\n` +
              `Amenities: ${h.facilities.join(', ')}`
            );
          }
        }

        if (has('scholarship', 'freeship', 'mahadbt', 'ebc', 'tuition fee', 'fee waiver', 'financial aid', 'tfws', 'sc category', 'st category', 'obc', 'ews')) {
          for (const s of memoryDb.scholarships.values()) {
            findings.push(
              `[STRUCTURED DB: Scholarship / Financial Aid Scheme]\n` +
              `Scheme: ${s.schemeName}\n` +
              `Eligible Category: ${s.category}\n` +
              `Portal: ${s.portal}\n` +
              `Tuition Fee Waiver: ${s.tuitionFeeWaiverPercentage}% | Exam Fee Waiver: ${s.examFeeWaiverPercentage}%\n` +
              `Income Limit: Rs. ${(s.incomeLimitAnnual || 0).toLocaleString()} per annum\n` +
              `Eligibility: ${s.eligibilityCriteria}\n` +
              `Required Documents: ${s.requiredDocuments.join(', ')}`
            );
          }
        }

        if (has('library', 'books', 'journals', 'kalam', 'volumes', 'reading room', 'ieee xplore', 'sciencedirect', 'opac', 'book bank')) {
          for (const lib of memoryDb.libraries.values()) {
            findings.push(
              `[STRUCTURED DB: Central Library Facilities]\n` +
              `Library: ${lib.name}\n` +
              `Location: ${lib.location}\n` +
              `Working Hours: ${lib.workingHoursRegular} (Exams: ${lib.workingHoursExam})\n` +
              `Resources: ${lib.totalVolumes.toLocaleString()}+ Volumes | ${lib.totalTitles.toLocaleString()}+ Titles\n` +
              `Digital Subscriptions: ${lib.digitalSubscriptions.join(', ')}\n` +
              `Special Facilities: ${lib.specialFacilities.join(', ')}`
            );
          }
        }
      }
    } catch (err: any) {
      logger.warn(`Structured knowledge query notice: ${err.message}`);
    }

    return findings.join('\n\n---\n\n');
  }
}

export const structuredKnowledgeService = new StructuredKnowledgeService();
