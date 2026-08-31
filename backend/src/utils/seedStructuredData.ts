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
import { Collection } from '../models/Collection';
import { DEFAULT_COLLECTIONS } from '../config/constants';
import { isDbConnected } from '../config/database';
import { logger } from './logger';

export async function seedStructuredData(): Promise<void> {
  if (!isDbConnected()) {
    logger.info('Database offline; structured knowledge initialized in memory.');
    return;
  }

  try {
    logger.info('Initializing MongoDB Atlas Database collections with PCCOE official data...');

    // 1. Seed Departments
    const deptCount = await Department.countDocuments();
    if (deptCount === 0) {
      await Department.insertMany([
        {
          name: 'Information Technology',
          code: 'IT',
          hodName: 'Dr. Sonali Patil',
          hodEmail: 'hod.it@pccoepune.org',
          hodPhone: '+91-020-27653168 Ext 201',
          description: 'Department of Information Technology at PCCOE focuses on Cloud Computing, AI/ML, Cybersecurity, and Software Engineering. NBA accredited till 2028.',
          intake: 180,
          establishedYear: 2001,
          laboratories: ['Cloud & Virtualization Lab', 'AI & Deep Learning Lab', 'Software Engineering Lab', 'Networking Lab', 'IoT & Cyber Security Lab', 'Data Analytics Lab'],
          clubs: ['ITSA (Information Technology Students Association)', 'ACM Chapter', 'GDSC PCCOE'],
        },
        {
          name: 'Computer Engineering',
          code: 'COMP',
          hodName: 'Dr. K. Rajeswari',
          hodEmail: 'hod.comp@pccoepune.org',
          hodPhone: '+91-020-27653168 Ext 202',
          description: 'Department of Computer Engineering provides advanced education in Algorithms, Systems Architecture, AI, and High Performance Computing. NBA accredited till 2028.',
          intake: 240,
          establishedYear: 1999,
          laboratories: ['High Performance Computing Lab', 'Open Source Software Lab', 'Data Analytics Lab', 'AI/ML Research Lab', 'Computer Networks Lab'],
          clubs: ['CESA (Computer Engineering Students Association)', 'IEEE Student Branch', 'CSI PCCOE', 'Coding Club PCCOE'],
        },
        {
          name: 'Computer Science & Engineering (AI & ML)',
          code: 'AIML',
          hodName: 'Dr. Supriya Shinde',
          hodEmail: 'hod.aiml@pccoepune.org',
          hodPhone: '+91-020-27653168 Ext 203',
          description: 'Department dedicated to cutting-edge research in Deep Learning, Computer Vision, Generative AI, and Natural Language Processing.',
          intake: 60,
          establishedYear: 2020,
          laboratories: ['NVIDIA AI Computing Lab', 'Robotics & Vision Lab', 'Data Science & NLP Lab'],
          clubs: ['AI Club', 'Data Science Society', 'GDSC PCCOE'],
        },
        {
          name: 'Electronics & Telecommunication Engineering',
          code: 'ENTC',
          hodName: 'Dr. M. T. Kolte',
          hodEmail: 'hod.entc@pccoepune.org',
          hodPhone: '+91-020-27653168 Ext 204',
          description: 'Department of E&TC excels in IoT, Embedded Systems, 5G Wireless Communications, and VLSI Design. NBA accredited till 2028.',
          intake: 180,
          establishedYear: 1999,
          laboratories: ['IoT & Embedded Systems Lab', 'VLSI Design Lab', 'Robotics Fabrication Lab', 'Microwave & Communication Lab', 'Signal Processing Lab'],
          clubs: ['ETSA (Electronics & Telecommunication Students Association)', 'Robocon PCCOE', 'Team Solarium'],
        },
        {
          name: 'Mechanical Engineering',
          code: 'MECH',
          hodName: 'Dr. P. A. Deshmukh',
          hodEmail: 'hod.mech@pccoepune.org',
          hodPhone: '+91-020-27653168 Ext 205',
          description: 'Department of Mechanical Engineering focuses on Automotive Engineering, CAD/CAM/CAE, Robotics, and Thermal Sciences. NBA accredited till 2028.',
          intake: 180,
          establishedYear: 1999,
          laboratories: ['CAD/CAM Center of Excellence', 'Automobile Engineering Lab', 'Mechatronics Lab', 'Fluid Mechanics & Thermal Lab', 'Dynamics of Machinery Lab'],
          clubs: ['MESA', 'Team Kratos Racing (TKR)', 'Team Red Baron', 'Team Solarium', 'Team Ambush', 'Team Automatons', 'Team Maverick India', 'Team Anantam'],
        },
        {
          name: 'Civil Engineering',
          code: 'CIVIL',
          hodName: 'Dr. S. T. Mali',
          hodEmail: 'hod.civil@pccoepune.org',
          hodPhone: '+91-020-27653168 Ext 206',
          description: 'Department of Civil Engineering specializes in Structural Engineering, Environmental Engineering, Geotechnical, and Smart City Planning. NBA accredited till 2028.',
          intake: 60,
          establishedYear: 2012,
          laboratories: ['Strength of Materials Lab', 'Environmental Engineering Lab', 'Geotechnical Lab', 'Concrete Technology Lab', 'Survey & Geomatics Lab'],
          clubs: ['CESA-Civil', 'Green Earth Forum'],
        },
      ]);
      logger.info('✅ Seeded PCCOE Departments in MongoDB Atlas.');
    }

    // 2. Seed Courses
    const courseCount = await Course.countDocuments();
    if (courseCount === 0) {
      await Course.insertMany([
        {
          name: 'B.Tech in Computer Engineering',
          department: 'Computer Engineering',
          degreeType: 'B.Tech',
          durationYears: 4,
          dteChoiceCode: '617524510',
          intake: 240,
          eligibility: 'Passed 10+2 with Physics & Math (min 45% Open, 40% Reserved) + MHT-CET / JEE Main',
          tuitionFeeAnnual: 118000,
          totalFeeAnnual: 135000,
        },
        {
          name: 'B.Tech in Information Technology',
          department: 'Information Technology',
          degreeType: 'B.Tech',
          durationYears: 4,
          dteChoiceCode: '617524610',
          intake: 180,
          eligibility: 'Passed 10+2 with Physics & Math (min 45% Open, 40% Reserved) + MHT-CET / JEE Main',
          tuitionFeeAnnual: 118000,
          totalFeeAnnual: 135000,
        },
        {
          name: 'B.Tech in Computer Science & Engineering (AI & ML)',
          department: 'Computer Science & Engineering (AI & ML)',
          degreeType: 'B.Tech',
          durationYears: 4,
          dteChoiceCode: '617526310',
          intake: 60,
          eligibility: 'Passed 10+2 with Physics & Math (min 45% Open, 40% Reserved) + MHT-CET / JEE Main',
          tuitionFeeAnnual: 118000,
          totalFeeAnnual: 135000,
        },
        {
          name: 'B.Tech in Electronics & Telecommunication Engineering',
          department: 'Electronics & Telecommunication Engineering',
          degreeType: 'B.Tech',
          durationYears: 4,
          dteChoiceCode: '617537210',
          intake: 180,
          eligibility: 'Passed 10+2 with Physics & Math (min 45% Open, 40% Reserved) + MHT-CET / JEE Main',
          tuitionFeeAnnual: 118000,
          totalFeeAnnual: 135000,
        },
        {
          name: 'B.Tech in Mechanical Engineering',
          department: 'Mechanical Engineering',
          degreeType: 'B.Tech',
          durationYears: 4,
          dteChoiceCode: '617561210',
          intake: 180,
          eligibility: 'Passed 10+2 with Physics & Math (min 45% Open, 40% Reserved) + MHT-CET / JEE Main',
          tuitionFeeAnnual: 118000,
          totalFeeAnnual: 135000,
        },
        {
          name: 'B.Tech in Civil Engineering',
          department: 'Civil Engineering',
          degreeType: 'B.Tech',
          durationYears: 4,
          dteChoiceCode: '617519110',
          intake: 60,
          eligibility: 'Passed 10+2 with Physics & Math (min 45% Open, 40% Reserved) + MHT-CET / JEE Main',
          tuitionFeeAnnual: 118000,
          totalFeeAnnual: 135000,
        },
        {
          name: 'Master of Computer Applications (MCA)',
          department: 'Computer Engineering',
          degreeType: 'MCA',
          durationYears: 2,
          dteChoiceCode: '617524110',
          intake: 60,
          eligibility: 'BCA or Bachelor Degree in Computer Science with min 50% + MAH-MCA-CET',
          tuitionFeeAnnual: 95000,
          totalFeeAnnual: 110000,
        },
        {
          name: 'M.Tech in VLSI & Embedded Systems',
          department: 'Electronics & Telecommunication Engineering',
          degreeType: 'M.Tech',
          durationYears: 2,
          dteChoiceCode: '617537220',
          intake: 18,
          eligibility: 'B.E./B.Tech in relevant branch with valid GATE / PGCET score',
          tuitionFeeAnnual: 85000,
          totalFeeAnnual: 98000,
        },
      ]);
      logger.info('✅ Seeded PCCOE Courses in MongoDB Atlas.');
    }

    // 3. Seed Faculty
    const facultyCount = await Faculty.countDocuments();
    if (facultyCount === 0) {
      await Faculty.insertMany([
        {
          name: 'Dr. G. N. Kulkarni',
          department: 'Administration / Mechanical Engineering',
          designation: 'Director, PCCOE & Professor',
          qualification: 'Ph.D., M.Tech (Mechanical)',
          email: 'director@pccoepune.org',
          phone: '+91-8087174347',
          specialization: ['Thermal Engineering', 'Renewable Energy Systems', 'Institutional Leadership'],
          experienceYears: 28,
          cabinLocation: "Director's Office, Main Administrative Building",
          researchArea: 'Solar Thermal Applications & Clean Energy Systems',
        },
        {
          name: 'Dr. P. A. Deshmukh',
          department: 'Mechanical Engineering / Student Development',
          designation: 'Dean Student Development & Welfare (SDW) & Professor',
          qualification: 'Ph.D. (Mechanical Engineering)',
          email: 'dean.sdw@pccoepune.org',
          phone: '+91-020-27653168 Ext 205',
          specialization: ['Thermal Engineering', 'CFD', 'Student Affairs'],
          experienceYears: 22,
          cabinLocation: 'Dean SDW Office, 2nd Floor',
          researchArea: 'Computational Fluid Dynamics & Heat Transfer',
        },
        {
          name: 'Dr. Sonali Patil',
          department: 'Information Technology',
          designation: 'Head of Department (HOD) & Professor',
          qualification: 'Ph.D. (Computer Science & Engineering)',
          email: 'hod.it@pccoepune.org',
          phone: '+91-020-27653168 Ext 201',
          specialization: ['Cloud Computing', 'Information Security', 'Machine Learning'],
          experienceYears: 20,
          cabinLocation: 'IT Department HOD Cabin, IT Building 3rd Floor',
          researchArea: 'Cloud Security and Distributed AI Architectures',
        },
        {
          name: 'Dr. K. Rajeswari',
          department: 'Computer Engineering',
          designation: 'Head of Department (HOD) & Professor',
          qualification: 'Ph.D. (Computer Engineering)',
          email: 'hod.comp@pccoepune.org',
          phone: '+91-020-27653168 Ext 202',
          specialization: ['Data Mining', 'Artificial Intelligence', 'Software Systems'],
          experienceYears: 24,
          cabinLocation: 'Computer Department HOD Cabin, Computer Wing 2nd Floor',
          researchArea: 'Big Data Analytics and Predictive Machine Learning',
        },
        {
          name: 'Prof. Amit Panchwadkar',
          department: 'Mechanical Engineering / Student Development',
          designation: 'Associate Dean SDW & Secretary Collegiate Clubs',
          qualification: 'M.Tech (Mechanical Engineering)',
          email: 'collegiatelubs@pccoepune.org',
          phone: '+91-020-27653168 Ext 208',
          specialization: ['Automotive Engineering', 'Motorsports Design', 'Student Clubs Mentorship'],
          experienceYears: 16,
          cabinLocation: 'Collegiate Clubs Central Office',
          researchArea: 'Automotive Powertrains and Electric Vehicle Dynamics',
        },
        {
          name: 'Prof. R. S. Jadhav',
          department: 'Information Technology',
          designation: 'Assistant Professor & Faculty Coordinator ITSA',
          qualification: 'M.Tech (IT)',
          email: 'itsa@pccoepune.org',
          phone: '+91-020-27653168 Ext 212',
          specialization: ['Web Technologies', 'Cloud Computing', 'Competitive Coding'],
          experienceYears: 11,
          cabinLocation: 'IT Faculty Room 304',
          researchArea: 'Full-Stack Distributed Applications and Microservices',
        },
        {
          name: 'Dr. S. R. Wankhede',
          department: 'Mechanical Engineering',
          designation: 'Associate Professor & Faculty Secretary (Team Kratos Racing)',
          qualification: 'Ph.D. (Mechanical Engineering)',
          email: 'kratos@pccoepune.org',
          phone: '+91-020-27653168 Ext 215',
          specialization: ['Vehicle Dynamics', 'Formula Student Engineering', 'EV Powertrain'],
          experienceYears: 15,
          cabinLocation: 'Motorsports Workshop / Mechanical Wing',
          researchArea: 'Lightweight Chassis Structures and Aerodynamics',
        },
        {
          name: 'Prof. U. I. Shaikh',
          department: 'Mechanical Engineering',
          designation: 'Assistant Professor & Faculty Secretary (Team Red Baron)',
          qualification: 'M.Tech (Design Engineering)',
          email: 'redbaron@pccoepune.org',
          phone: '+91-020-27653168 Ext 216',
          specialization: ['SAE Baja Off-Road Vehicles', 'CAD/CAM', 'Suspension Design'],
          experienceYears: 12,
          cabinLocation: 'SAE Baja Workshop / Mechanical Block',
          researchArea: 'All-Terrain Vehicle Durability and Terrain Dynamics',
        },
      ]);
      logger.info('✅ Seeded PCCOE Faculty in MongoDB Atlas.');
    }

    // 4. Seed Fee Structures
    const feeCount = await Fee.countDocuments();
    if (feeCount === 0) {
      await Fee.insertMany([
        {
          courseName: 'First Year B.Tech (All Branches)',
          degreeType: 'B.Tech',
          academicYear: '2026-2027',
          category: 'Open',
          tuitionFee: 118000,
          developmentFee: 17000,
          otherFees: 3500,
          totalFeeAnnual: 138500,
          scholarshipWaiverDescription: 'Full fee payable. Open category students with family income <= 8 Lakhs can claim 50% EBC waiver on tuition fee.',
        },
        {
          courseName: 'First Year B.Tech (All Branches)',
          degreeType: 'B.Tech',
          academicYear: '2026-2027',
          category: 'EBC/EWS',
          tuitionFee: 59000,
          developmentFee: 17000,
          otherFees: 3500,
          totalFeeAnnual: 79500,
          scholarshipWaiverDescription: '50% Tuition Fee waiver provided under Rajarshi Chhatrapati Shahu Maharaj EBC scheme via MahaDBT portal.',
        },
        {
          courseName: 'First Year B.Tech (All Branches)',
          degreeType: 'B.Tech',
          academicYear: '2026-2027',
          category: 'OBC',
          tuitionFee: 59000,
          developmentFee: 17000,
          otherFees: 3500,
          totalFeeAnnual: 79500,
          scholarshipWaiverDescription: '50% Tuition Fee concession for OBC students having valid Non-Creamy Layer Certificate via MahaDBT.',
        },
        {
          courseName: 'First Year B.Tech (All Branches)',
          degreeType: 'B.Tech',
          academicYear: '2026-2027',
          category: 'SC/ST/VJNT/SBC',
          tuitionFee: 0,
          developmentFee: 0,
          otherFees: 3500,
          totalFeeAnnual: 3500,
          scholarshipWaiverDescription: '100% Tuition & Development fee waiver reimbursed by Social Welfare Department (Samaj Kalyan Vibhag) Maharashtra.',
        },
        {
          courseName: 'First Year B.Tech (All Branches)',
          degreeType: 'B.Tech',
          academicYear: '2026-2027',
          category: 'TFWS',
          tuitionFee: 0,
          developmentFee: 17000,
          otherFees: 3500,
          totalFeeAnnual: 20500,
          scholarshipWaiverDescription: '100% Tuition Fee waiver for merit candidates allotted under 5% TFWS seats in State CET Cell CAP rounds.',
        },
      ]);
      logger.info('✅ Seeded PCCOE Fee Structures in MongoDB Atlas.');
    }

    // 5. Seed Clubs (All 10 Official Collegiate Clubs & Associations)
    const clubCount = await Club.countDocuments();
    if (clubCount === 0) {
      await Club.insertMany([
        {
          name: 'Information Technology Students Association',
          shortCode: 'ITSA',
          department: 'Information Technology',
          category: 'Technical Departmental Association',
          description: 'Premier student association of the Department of IT at PCCOE Pune. Bridges academic learning and IT industry practices. Flagship event: Inspiria national technical symposium.',
          flagshipEvent: 'Inspiria (Annual National Level Technical Symposium)',
          activities: [
            'Inspiria National Technical Symposium (algorithmic coding, hackathons, technical paper presentations)',
            'CodeCombat Weekly Competitive Programming Leagues (LeetCode & HackerRank preparation)',
            'Full-Stack Web Development & Cloud Bootcamps (MERN, AWS, GCP, DevOps)',
            'Alumni Tech Talks and Silicon Valley Mentorship Programs',
            'Community Digital Literacy Campaigns for rural schools',
          ],
          facultyCoordinator: 'Prof. R. S. Jadhav (Assistant Professor, IT)',
          studentPresident: 'Aditya Shinde (BE IT)',
          contactEmail: 'itsa@pccoepune.org',
        },
        {
          name: 'Computer Engineering Students Association',
          shortCode: 'CESA',
          department: 'Computer Engineering',
          category: 'Technical Departmental Association',
          description: 'Student body of Computer Engineering department at PCCOE. Organizes Anant tech fest, hackathons, and competitive programming events.',
          flagshipEvent: 'Anant (Annual Technical Fest)',
          activities: [
            'Annual tech fest Anant',
            '24-hour hackathons',
            'Open source contribution drives',
            'Smart India Hackathon (SIH) coordination',
            'ICPC competitive programming mentorship',
          ],
          facultyCoordinator: 'Prof. A. K. More (Computer Department)',
          studentPresident: 'Kunal Patil (BE Computer)',
          contactEmail: 'cesa@pccoepune.org',
        },
        {
          name: 'Team Kratos Racing Electric',
          shortCode: 'TKR',
          department: 'Mechanical Engineering & ENTC',
          category: 'Collegiate Motor Sports Club',
          description: 'Team Kratos Racing Electric represents the Formula Student initiative at PCCOE. 40 interdisciplinary students design, manufacture and test electric Formula Student race cars. Vision: Compete for Podium at Formula Student Germany.',
          flagshipEvent: 'Formula Student Germany & Formula Bharat',
          activities: [
            'Designing and manufacturing electric Formula Student race cars',
            'Participating in Formula Student Germany (top 10 finish target)',
            'Competing at Formula Bharat',
            'Interdisciplinary engineering collaboration across branches',
            'Technical workshops on EV technology',
          ],
          facultyCoordinator: 'Dr. S.R. Wankhede (Mechanical) & Dr. M.M. Narkhede (ENTC)',
          studentPresident: 'Suraj Aher (Managing Director)',
          contactEmail: 'tkr@pccoepune.org',
        },
        {
          name: 'Team Red Baron',
          shortCode: 'RED_BARON',
          department: 'Mechanical Engineering',
          category: 'Collegiate Motor Sports Club',
          description: 'Team Red Baron is 30 undergraduate students from PCCOE who design, manufacture and test All-Terrain Vehicles (ATV). Competes in SAE Baja national and international events. Mission: Build the ideal ATV for toughest conditions.',
          flagshipEvent: 'SAE Baja India & International SAE Baja',
          activities: [
            'Designing and manufacturing All-Terrain Vehicles (ATV)',
            'Participating in SAE Baja India (national)',
            'Competing in International SAE Baja',
            'Vehicle dynamics, chassis design, suspension engineering',
          ],
          facultyCoordinator: 'Mr. U.I. Shaikh (Mechanical) & Mr. Rohit Tate (IT)',
          studentPresident: 'Om Kangle (Managing Director), Tanmay Chaskar (Co-MD)',
          contactEmail: 'redbaron@pccoepune.org',
        },
        {
          name: 'Team Solarium',
          shortCode: 'SOLARIUM',
          department: 'Mechanical Engineering & ENTC',
          category: 'Collegiate Solar Vehicle Club',
          description: 'Team Solarium develops solar-powered vehicles, promoting renewable energy technology and participating in solar vehicle competitions.',
          flagshipEvent: 'Solar Vehicle Competition',
          activities: [
            'Designing solar-powered vehicles',
            'Competing in solar vehicle competitions',
            'Renewable energy and sustainable transport research',
          ],
          facultyCoordinator: 'Dr. Jaya Goyal (Mechanical) & Dr. Pramod Sonavane (ENTC)',
          studentPresident: 'Student representative',
          contactEmail: 'solarium@pccoepune.org',
        },
        {
          name: 'Team Ambush',
          shortCode: 'AMBUSH',
          department: 'Mechanical Engineering & Computer',
          category: 'Collegiate Motor Sports Club',
          description: 'Team Ambush is an engineering team building specialized competition vehicles and participating in national engineering competitions at PCCOE.',
          flagshipEvent: 'National Engineering Competitions',
          activities: [
            'Designing and building competition vehicles',
            'National engineering competitions',
            'Vehicle design and manufacturing workshops',
          ],
          facultyCoordinator: 'Dr. I.R. Satone (Mechanical) & Mr. Rahul Pitale (Computer)',
          studentPresident: 'Student representative',
          contactEmail: 'ambush@pccoepune.org',
        },
        {
          name: 'Team Automatons',
          shortCode: 'AUTOMATONS',
          department: 'Mechanical Engineering & ENTC',
          category: 'Collegiate Robotics & Automation Club',
          description: 'Team Automatons focuses on robotics, automation, and autonomous systems. Develops autonomous robots for national robotics competitions.',
          flagshipEvent: 'National Robotics Competitions',
          activities: [
            'Building autonomous robots and automation systems',
            'National robotics competitions',
            'Embedded systems and robotics workshops',
            'Computer vision and robot programming',
          ],
          facultyCoordinator: 'Dr. S.B. Matekar (Mechanical) & Dr. Varsha Bendre (ENTC)',
          studentPresident: 'Student representative',
          contactEmail: 'automatons@pccoepune.org',
        },
        {
          name: 'Team Maverick India',
          shortCode: 'MAVERICK_INDIA',
          department: 'Mechanical Engineering & ENTC',
          category: 'Collegiate Innovation Club',
          description: 'Team Maverick India is a disaster management and innovation team. Won SILVER at NIDAR 2026 in Disaster Management. Develops robots for disaster response scenarios.',
          flagshipEvent: 'NIDAR (National Innovative Disaster Avoidance Robot)',
          activities: [
            'Disaster management robot design',
            'Competing in NIDAR national competition',
            'NIDAR 2026: SILVER WINNER in Disaster Management',
            'Innovation challenges',
          ],
          facultyCoordinator: 'Prof. C.R. Ingole (Mechanical) & Mr. Ajjay Ghade (ENTC)',
          studentPresident: 'Student representative',
          contactEmail: 'maverickindia@pccoepune.org',
        },
        {
          name: 'Team Anantam',
          shortCode: 'ANANTAM',
          department: 'Mechanical Engineering & ENTC',
          category: 'Collegiate Engineering Club',
          description: 'Team Anantam is an engineering competition team from PCCOE participating in national level engineering design and competition events.',
          flagshipEvent: 'National Engineering Design Competition',
          activities: [
            'Engineering design competitions',
            'National level competitions',
            'Technical skill development',
          ],
          facultyCoordinator: 'Dr. Jayesh Chordiya (Mechanical) & Dr. Ashwini Shinde (ENTC)',
          studentPresident: 'Student representative',
          contactEmail: 'anantam@pccoepune.org',
        },
        {
          name: 'Coding Club PCCOE',
          shortCode: 'CODING_CLUB',
          department: 'Computer Engineering',
          category: 'Technical Club',
          description: 'The Coding Club at PCCOE focuses on competitive programming, hackathons, software development, and technical skill building for students across all departments.',
          flagshipEvent: 'Annual Hackathon',
          activities: [
            'Competitive programming contests (LeetCode, Codeforces, HackerRank)',
            'Internal and external hackathons',
            'Algorithm and data structure workshops',
            'Open-source contribution drives',
            'Technical interview preparation',
          ],
          facultyCoordinator: 'Mr. Abhishek Raut (Computer Department)',
          studentPresident: 'Student representative (BE/TE Computer)',
          contactEmail: 'codingclub@pccoepune.org',
        },
      ]);
      logger.info('✅ Seeded PCCOE Clubs in MongoDB Atlas.');
    }

    // 6. Seed Notices
    const noticeCount = await Notice.countDocuments();
    if (noticeCount === 0) {
      await Notice.insertMany([
        {
          title: 'FY B.Tech Institute Level (IL) & Against CAP Admissions AY 2026-27',
          category: 'Admission',
          department: 'All Departments',
          publishedDate: new Date(),
          content: 'Applications are invited for Institute Level (IL) and Against CAP vacant seats for First Year B.Tech Academic Year 2026-27. Eligible candidates can submit application online at pccoepune.com/admission-home.php.',
          isImportant: true,
          referenceNo: 'PCCOE/ADM/2026-27/01',
        },
        {
          title: 'Autonomous Winter End-Semester Examination (ESE) 2026 Schedule & 75% Attendance Rule',
          category: 'Examination',
          department: 'All Departments',
          publishedDate: new Date(),
          content: 'Winter End-Semester Examination (ESE) 2026 will commence from December 08, 2026. Students must ensure minimum 75% attendance in theory and 80% in practicals to be eligible for hall tickets.',
          isImportant: true,
          referenceNo: 'PCCOE/EXAM/2026/142',
        },
        {
          title: 'MahaDBT Scholarship & EBC Fee Concession Application Deadline AY 2026-27',
          category: 'Scholarship',
          department: 'All Departments',
          publishedDate: new Date(),
          content: 'All eligible students (EBC, OBC, SC, ST, VJNT, SBC) must complete their scholarship forms on the MahaDBT portal (mahadbt.maharashtra.gov.in) and submit physical document verification at the Scholarship Counter.',
          isImportant: true,
          referenceNo: 'PCCOE/SCHOL/2026/33',
        },
        {
          title: 'Campus Placement Drive 2025-26: Microsoft, Barclays, Dassault Systèmes & Veritas',
          category: 'T&P',
          department: 'All Departments',
          publishedDate: new Date(),
          content: 'Final and pre-final year students registered with Training & Placement Cell must check ERP portal for recruitment schedules. Highest CTC offered is Rs. 61.0 LPA with 650+ recruiting companies visiting.',
          isImportant: false,
          referenceNo: 'PCCOE/TPO/2026/89',
        },
      ]);
      logger.info('✅ Seeded PCCOE Official Notices in MongoDB Atlas.');
    }

    // 7. Seed Placements
    const placementCount = await Placement.countDocuments();
    if (placementCount === 0) {
      await Placement.create({
        academicYear: '2025-2026',
        highestPackageLPA: 61.0,
        averagePackageLPA: 8.4,
        totalCompaniesVisited: 650,
        totalOffers: 1250,
        topRecruiters: [
          'Microsoft', 'Adobe', 'Barclays', 'Credit Suisse', 'Veritas', 'Amazon',
          'Cognizant', 'TCS Digital', 'Infosys', 'Capgemini', 'LTI Mindtree',
          'Persistent Systems', 'Zensar', 'Dassault Systèmes', 'ZF Group',
          'KPIT Technologies', 'Cummins India', 'Tata Motors', 'Bosch',
          'Mercedes-Benz R&D India', 'Schindler India', 'Godrej Industries',
        ],
        internshipOffersCount: 450,
        tpoEmail: 'tpo@pccoepune.org',
        tpoPhone: '+91-020-27653168',
      });
      logger.info('✅ Seeded PCCOE Placement statistics in MongoDB Atlas.');
    }

    // 8. Seed Hostels
    const hostelCount = await Hostel.countDocuments();
    if (hostelCount === 0) {
      await Hostel.insertMany([
        {
          buildingName: 'PCCOE Boys Hostel (Nilgiri)',
          gender: 'Boys',
          location: 'Sector 26, Pradhikaran, Nigdi, Pune - 411044',
          totalCapacity: 350,
          doubleRoomFeeAnnual: 95000,
          tripleRoomFeeAnnual: 75000,
          messFeeAnnual: 38000,
          depositRefundable: 5000,
          curfewTimeWeekday: '9:30 PM',
          curfewTimeWeekend: '10:00 PM',
          wardenName: 'Prof. V. K. Kadam',
          wardenContact: '+91-020-27653168 Ext 401',
          facilities: ['High-speed Wi-Fi', '24/7 CCTV & Biometric', 'Solar Water Heating', 'Gymnasium', 'Study Reading Rooms', 'Pure Veg Multi-cuisine Mess'],
        },
        {
          buildingName: 'PCCOE Girls Hostel (Sahyadri)',
          gender: 'Girls',
          location: 'Sector 26, Pradhikaran, Nigdi, Pune - 411044',
          totalCapacity: 300,
          doubleRoomFeeAnnual: 95000,
          tripleRoomFeeAnnual: 75000,
          messFeeAnnual: 38000,
          depositRefundable: 5000,
          curfewTimeWeekday: '9:30 PM',
          curfewTimeWeekend: '10:00 PM',
          wardenName: 'Prof. Mrs. S. P. Shinde',
          wardenContact: '+91-020-27653168 Ext 402',
          facilities: ['High-speed Wi-Fi', '24/7 Security & Wardens', 'Solar Water Heating', 'Reading Hall', 'In-house Medical Assistance', 'Pure Veg Multi-cuisine Mess'],
        },
      ]);
      logger.info('✅ Seeded PCCOE Hostels in MongoDB Atlas.');
    }

    // 9. Seed Scholarships
    const scholarshipCount = await Scholarship.countDocuments();
    if (scholarshipCount === 0) {
      await Scholarship.insertMany([
        {
          schemeName: 'Rajarshi Chhatrapati Shahu Maharaj Shikshan Shulk Shishyavrutti Yojna (EBC)',
          category: 'Open / General',
          portal: 'MahaDBT (https://mahadbt.maharashtra.gov.in)',
          tuitionFeeWaiverPercentage: 50,
          examFeeWaiverPercentage: 50,
          incomeLimitAnnual: 800000,
          eligibilityCriteria: 'Maharashtra domicile, admitted through CAP, annual family income <= Rs. 8,00,000.',
          requiredDocuments: ['Income Certificate', 'Domicile Certificate', 'CAP Allotment Letter', 'Ration Card'],
        },
        {
          schemeName: 'Tuition Fee Waiver Scheme (TFWS)',
          category: 'All Merit Categories',
          portal: 'State CET Cell CAP Allotment',
          tuitionFeeWaiverPercentage: 100,
          examFeeWaiverPercentage: 0,
          incomeLimitAnnual: 800000,
          eligibilityCriteria: 'Merit-based seat allotment under 5% supernumerary TFWS quota via CAP.',
          requiredDocuments: ['Income Certificate (issued by Tahsildar)', 'MHT-CET Scorecard', 'CAP Allotment Letter'],
        },
        {
          schemeName: 'Government Social Welfare Post Matric Scholarship (SC / ST / VJNT / SBC / OBC)',
          category: 'Reserved Categories',
          portal: 'MahaDBT & Samaj Kalyan Vibhag',
          tuitionFeeWaiverPercentage: 100,
          examFeeWaiverPercentage: 100,
          incomeLimitAnnual: 250000,
          eligibilityCriteria: 'Reserved category students belonging to Maharashtra state with valid Caste Certificate and Caste Validity.',
          requiredDocuments: ['Caste Certificate', 'Caste Validity Certificate', 'Non-Creamy Layer Certificate', 'Income Certificate', 'Domicile Certificate'],
        },
      ]);
      logger.info('✅ Seeded PCCOE Scholarships in MongoDB Atlas.');
    }

    // 10. Seed Library
    const libraryCount = await Library.countDocuments();
    if (libraryCount === 0) {
      await Library.create({
        libraryName: 'Dr. APJ Abdul Kalam Central Library',
        location: 'Main Building, PCCOE Campus, Sector 26, Nigdi, Pune',
        workingHoursRegular: 'Monday to Saturday: 8:00 AM - 10:00 PM',
        workingHoursExamPeriod: 'Extended till 12:00 Midnight (12 AM) during End-Semester Exams',
        totalVolumes: 60000,
        totalTitles: 15000,
        eJournalSubscriptions: ['IEEE Xplore', 'ScienceDirect (Elsevier)', 'ASME Digital Library', 'Springer E-Journals'],
        librarianName: 'Dr. S. K. Patil',
        librarianEmail: 'library@pccoepune.org',
        facilities: ['Book Bank for First Year students', 'Book Bank for Reserved Category students', 'OPAC (Online Public Access Catalog)', 'Reading halls with quiet study zones', 'Computer terminals with high-speed internet'],
      });
      logger.info('✅ Seeded PCCOE Central Library in MongoDB Atlas.');
    }

    // 11. Seed Knowledge Collections
    const colCount = await Collection.countDocuments();
    if (colCount === 0) {
      await Collection.insertMany(
        DEFAULT_COLLECTIONS.map((name) => ({
          name,
          description: `${name} official documents`,
          department: 'All Departments',
          documentCount: 0,
        }))
      );
      logger.info('✅ Seeded PCCOE Knowledge Collections in MongoDB Atlas.');
    }

    logger.info('🎉 All PCCOE collections successfully seeded in MongoDB Atlas.');
  } catch (err: any) {
    logger.warn(`Notice while seeding structured data: ${err.message}`);
  }
}
