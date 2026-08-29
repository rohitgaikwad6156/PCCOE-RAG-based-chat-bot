import { Department } from '../models/Department';
import { Course } from '../models/Course';
import { Club } from '../models/Club';
import { Placement } from '../models/Placement';
import { Hostel } from '../models/Hostel';
import { Scholarship } from '../models/Scholarship';
import { Library } from '../models/Library';
import { Notice } from '../models/Notice';
import { isDbConnected } from '../config/database';
import { logger } from './logger';

export async function seedStructuredData(): Promise<void> {
  if (!isDbConnected()) {
    logger.info('Database offline; structured knowledge initialized in memory.');
    return;
  }

  try {
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
          description: 'Department of Information Technology at PCCOE focuses on Cloud Computing, AI/ML, Cybersecurity, and Software Engineering.',
          intake: 180,
          establishedYear: 2001,
          laboratories: ['Cloud & Virtualization Lab', 'AI & Deep Learning Lab', 'Software Engineering Lab', 'Networking Lab'],
          clubs: ['ITSA (Information Technology Students Association)', 'ACM Chapter', 'GDSC PCCOE'],
        },
        {
          name: 'Computer Engineering',
          code: 'COMP',
          hodName: 'Dr. K. Rajeswari',
          hodEmail: 'hod.comp@pccoepune.org',
          hodPhone: '+91-020-27653168 Ext 202',
          description: 'Department of Computer Engineering provides advanced education in Algorithms, Systems Architecture, and Data Science.',
          intake: 240,
          establishedYear: 1999,
          laboratories: ['High Performance Computing Lab', 'Open Source Software Lab', 'Data Analytics Lab'],
          clubs: ['CESA', 'IEEE Student Branch', 'CSI PCCOE'],
        },
        {
          name: 'Artificial Intelligence & Machine Learning',
          code: 'AIML',
          hodName: 'Dr. S. B. Mane',
          hodEmail: 'hod.aiml@pccoepune.org',
          hodPhone: '+91-020-27653168 Ext 203',
          description: 'Department dedicated to cutting-edge research in Deep Learning, Computer Vision, and Natural Language Processing.',
          intake: 120,
          establishedYear: 2021,
          laboratories: ['NVIDIA AI Computing Lab', 'Robotics & Vision Lab'],
          clubs: ['AI Club', 'Data Science Society'],
        },
        {
          name: 'Electronics & Telecommunication',
          code: 'ENTC',
          hodName: 'Dr. M. T. Kolte',
          hodEmail: 'hod.entc@pccoepune.org',
          hodPhone: '+91-020-27653168 Ext 204',
          description: 'Department of E&TC excels in IoT, Embedded Systems, 5G Wireless Communications, and VLSI Design.',
          intake: 180,
          establishedYear: 1999,
          laboratories: ['IoT & Embedded Systems Lab', 'VLSI Design Lab', 'Robotics Fabrication Lab'],
          clubs: ['ETSA', 'Robocon PCCOE'],
        },
        {
          name: 'Mechanical Engineering',
          code: 'MECH',
          hodName: 'Dr. P. A. Deshmukh',
          hodEmail: 'hod.mech@pccoepune.org',
          hodPhone: '+91-020-27653168 Ext 205',
          description: 'Department of Mechanical Engineering focuses on Automotive Engineering, CAD/CAM/CAE, and Thermal Sciences.',
          intake: 180,
          establishedYear: 1999,
          laboratories: ['CAD/CAM Center of Excellence', 'Automobile Engineering Lab', 'Mechatronics Lab'],
          clubs: ['MESA', 'Team Kratos Racing (TKR)', 'Team Redline Racing'],
        },
        {
          name: 'Civil Engineering',
          code: 'CIVIL',
          hodName: 'Dr. S. T. Mali',
          hodEmail: 'hod.civil@pccoepune.org',
          hodPhone: '+91-020-27653168 Ext 206',
          description: 'Department of Civil Engineering specializes in Structural Engineering, Environmental Engineering, and Geomatics.',
          intake: 60,
          establishedYear: 2012,
          laboratories: ['Strength of Materials Lab', 'Environmental Engineering Lab', 'Geotechnical Lab'],
          clubs: ['CESA-Civil', 'Green Earth Forum'],
        },
      ]);
      logger.info('Seeded PCCOE Departments in MongoDB.');
    }

    // 2. Seed Clubs (all official PCCOE Collegiate Clubs)
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
            'Inspiria National Technical Symposium (coding, hackathons, paper presentations)',
            'CodeCombat Weekly Competitive Programming Leagues (LeetCode/HackerRank)',
            'Full-Stack Web Development & Cloud Bootcamps (MERN, AWS, GCP)',
            'Alumni Tech Talks and Silicon Valley Mentorship',
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
            'ICPC participation',
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
            'Interdisciplinary collaboration (Mechanical, ENTC, Computer, IT)',
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
      logger.info('Seeded PCCOE Clubs in MongoDB.');
    }

    // 3. Seed Placements
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
          'Cognizant', 'TCS Digital', 'Infosys', 'Capgemini', 'Dassault Systèmes',
          'ZF Group', 'KPIT', 'Cummins India', 'Tata Motors', 'Bosch',
        ],
        internshipOffersCount: 450,
        tpoEmail: 'tpo@pccoepune.org',
        tpoPhone: '+91-020-27653168',
      });
      logger.info('Seeded PCCOE Placement statistics in MongoDB.');
    }

    // 4. Seed Hostels
    const hostelCount = await Hostel.countDocuments();
    if (hostelCount === 0) {
      await Hostel.insertMany([
        {
          buildingName: 'PCCOE Boys Hostel (Nilgiri)',
          gender: 'Boys',
          location: 'Sector 26, Pradhikaran, Nigdi, Pune',
          totalCapacity: 350,
          doubleRoomFeeAnnual: 95000,
          tripleRoomFeeAnnual: 75000,
          messFeeAnnual: 38000,
          depositRefundable: 5000,
          curfewTimeWeekday: '9:30 PM',
          curfewTimeWeekend: '10:00 PM',
          wardenName: 'Prof. V. K. Kadam',
          wardenContact: '+91-020-27653168 Ext 401',
          facilities: ['High-speed Wi-Fi', '24/7 CCTV & Biometric', 'Solar Water Heating', 'Gymnasium', 'Study Reading Rooms'],
        },
        {
          buildingName: 'PCCOE Girls Hostel (Sahyadri)',
          gender: 'Girls',
          location: 'Sector 26, Pradhikaran, Nigdi, Pune',
          totalCapacity: 300,
          doubleRoomFeeAnnual: 95000,
          tripleRoomFeeAnnual: 75000,
          messFeeAnnual: 38000,
          depositRefundable: 5000,
          curfewTimeWeekday: '9:30 PM',
          curfewTimeWeekend: '10:00 PM',
          wardenName: 'Prof. Mrs. S. P. Shinde',
          wardenContact: '+91-020-27653168 Ext 402',
          facilities: ['High-speed Wi-Fi', '24/7 Security & Wardens', 'Solar Water Heating', 'Reading Hall', 'In-house Medical Assistance'],
        },
      ]);
      logger.info('Seeded PCCOE Hostels in MongoDB.');
    }

    // 5. Seed Scholarships
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
      ]);
      logger.info('Seeded PCCOE Scholarships in MongoDB.');
    }
  } catch (err: any) {
    logger.warn(`Error seeding structured data: ${err.message}`);
  }
}
