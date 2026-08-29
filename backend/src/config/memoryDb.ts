import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

export class MemoryDatabase {
  users: Map<string, any> = new Map();
  documents: Map<string, any> = new Map();
  documentChunks: Map<string, any> = new Map();
  conversations: Map<string, any> = new Map();
  messages: Map<string, any> = new Map();
  feedbacks: Map<string, any> = new Map();
  collections: Map<string, any> = new Map();
  departments: Map<string, any> = new Map();
  clubs: Map<string, any> = new Map();
  placements: Map<string, any> = new Map();
  hostels: Map<string, any> = new Map();
  scholarships: Map<string, any> = new Map();
  libraries: Map<string, any> = new Map();

  constructor() {
    this.seedDefaults();
  }

  private async seedDefaults() {
    const salt = await bcrypt.genSalt(10);
    const adminHash = await bcrypt.hash('PccoeAdmin2026!', salt);
    const studentHash = await bcrypt.hash('PccoeStudent2026!', salt);

    const adminId = '65d1a1111111111111111111';
    const studentId = '65d1b2222222222222222222';

    this.users.set(adminId, {
      _id: new mongoose.Types.ObjectId(adminId),
      name: 'PCCOE Administrator',
      email: 'admin@pccoe.org',
      passwordHash: adminHash,
      role: 'admin',
      department: 'Central Administration',
      createdAt: new Date(),
      updatedAt: new Date(),
      comparePassword: async (pwd: string) => bcrypt.compare(pwd, adminHash),
    });

    this.users.set(studentId, {
      _id: new mongoose.Types.ObjectId(studentId),
      name: 'Rohan Deshmukh',
      email: 'student@pccoe.org',
      passwordHash: studentHash,
      role: 'student',
      department: 'Computer Engineering',
      createdAt: new Date(),
      updatedAt: new Date(),
      comparePassword: async (pwd: string) => bcrypt.compare(pwd, studentHash),
    });

    // ─── DEPARTMENTS ─────────────────────────────────────────────────────────

    this.departments.set('IT', {
      name: 'Information Technology',
      code: 'IT',
      hodName: 'Dr. Sonali Patil',
      hodEmail: 'hod.it@pccoepune.org',
      hodPhone: '+91-020-27653168 Ext 201',
      description: 'Department of Information Technology at PCCOE Pune focuses on Cloud Computing, AI/ML, Cybersecurity, and Software Engineering. NBA accredited. Annual intake: 180 students. Department website: it.pccoepune.com.',
      intake: 180,
      establishedYear: 2001,
      laboratories: ['Cloud & Virtualization Lab', 'AI & Deep Learning Lab', 'Software Engineering Lab', 'Networking Lab', 'IoT Lab', 'Data Analytics Lab'],
      clubs: ['ITSA (Information Technology Students Association)', 'ACM Chapter', 'GDSC PCCOE'],
    });

    this.departments.set('COMP', {
      name: 'Computer Engineering',
      code: 'COMP',
      hodName: 'Dr. K. Rajeswari',
      hodEmail: 'hod.comp@pccoepune.org',
      hodPhone: '+91-020-27653168 Ext 202',
      description: 'Department of Computer Engineering at PCCOE provides advanced education in Algorithms, Systems Architecture, AI, and Data Science. NBA accredited. Annual intake: 240 students. Department website: computer.pccoepune.com.',
      intake: 240,
      establishedYear: 1999,
      laboratories: ['High Performance Computing Lab', 'Open Source Software Lab', 'Data Analytics Lab', 'AI/ML Research Lab', 'Computer Networks Lab'],
      clubs: ['CESA (Computer Engineering Students Association)', 'IEEE Student Branch', 'CSI PCCOE'],
    });

    this.departments.set('ENTC', {
      name: 'Electronics & Telecommunication Engineering',
      code: 'ENTC',
      hodName: 'Dr. P. A. Deshmukh',
      hodEmail: 'hod.entc@pccoepune.org',
      hodPhone: '+91-020-27653168 Ext 203',
      description: 'Department of Electronics & Telecommunication Engineering (E&TC) at PCCOE covers VLSI design, embedded systems, communication, IoT, and signal processing. NBA accredited. Department website: entc.pccoepune.com.',
      intake: 120,
      establishedYear: 1999,
      laboratories: ['VLSI Lab', 'Embedded Systems Lab', 'Communication Lab', 'Microwave Lab', 'PCB Design Lab', 'Digital Electronics Lab'],
      clubs: ['ETSA (Electronics & Telecommunication Students Association)', 'IEEE PCCOE'],
    });

    this.departments.set('MECH', {
      name: 'Mechanical Engineering',
      code: 'MECH',
      hodName: 'Dr. G. N. Kulkarni',
      hodEmail: 'hod.mech@pccoepune.org',
      hodPhone: '+91-020-27653168 Ext 204',
      description: 'Department of Mechanical Engineering at PCCOE covers thermodynamics, machine design, manufacturing, robotics, and automotive engineering. NBA accredited. Department website: mechanical.pccoepune.com.',
      intake: 120,
      establishedYear: 1999,
      laboratories: ['CAD/CAM Lab', 'Fluid Mechanics Lab', 'Heat Transfer Lab', 'Manufacturing Lab', 'Dynamics of Machinery Lab', 'Metrology Lab'],
      clubs: ['MESA (Mechanical Engineering Students Association)', 'Team Red Baron', 'Team Kratos Racing Electric', 'Team Solarium', 'Team Ambush', 'Team Automatons', 'Team Maverick India', 'Team Anantam'],
    });

    this.departments.set('CIVIL', {
      name: 'Civil Engineering',
      code: 'CIVIL',
      hodName: 'Dr. A. R. Bhalerao',
      hodEmail: 'hod.civil@pccoepune.org',
      hodPhone: '+91-020-27653168 Ext 205',
      description: 'Department of Civil Engineering at PCCOE covers structural engineering, construction management, geotechnical, transportation, and environmental engineering. NBA accredited. Department website: civil.pccoepune.com.',
      intake: 60,
      establishedYear: 1999,
      laboratories: ['Concrete Technology Lab', 'Soil Mechanics Lab', 'Survey Lab', 'Transportation Lab', 'Environmental Engineering Lab', 'Fluid Mechanics Lab'],
      clubs: ['CESA-Civil (Civil Engineering Students Association)'],
    });

    this.departments.set('AIML', {
      name: 'Computer Science & Engineering (AI-ML)',
      code: 'AIML',
      hodName: 'Dr. Supriya Shinde',
      hodEmail: 'hod.aiml@pccoepune.org',
      hodPhone: '+91-020-27653168 Ext 206',
      description: 'Department of Computer Science & Engineering (AI-ML) at PCCOE focuses on machine learning, deep learning, NLP, computer vision, and data science. Department website: aiml.pccoepune.com.',
      intake: 60,
      establishedYear: 2020,
      laboratories: ['GPU Computing Lab', 'AI/ML Lab', 'Data Science Lab', 'Computer Vision Lab', 'NLP Lab'],
      clubs: ['GDSC PCCOE', 'ACM Chapter'],
    });

    // ─── CLUBS & ASSOCIATIONS ─────────────────────────────────────────────────

    this.clubs.set('ITSA', {
      name: 'Information Technology Students Association',
      shortCode: 'ITSA',
      department: 'Information Technology',
      category: 'Technical Departmental Association',
      description: 'Premier student association of the Department of IT at PCCOE Pune. Bridges academic learning and IT industry practices. Founded to foster technical excellence and leadership among IT students.',
      flagshipEvent: 'Inspiria (Annual National Level Technical Symposium)',
      activities: [
        'Inspiria - Annual National Technical Symposium (coding contests, hackathons, paper presentations)',
        'CodeCombat Weekly Competitive Programming Leagues (LeetCode/HackerRank)',
        'Full-Stack Web Development & Cloud Bootcamps (MERN, AWS, GCP)',
        'Alumni Tech Talks and Silicon Valley Mentorship Programs',
        'Community Digital Literacy Campaigns for rural schools',
      ],
      facultyCoordinator: 'Prof. R. S. Jadhav (Assistant Professor, IT)',
      studentPresident: 'Aditya Shinde (BE IT)',
      contactEmail: 'itsa@pccoepune.org',
    });

    this.clubs.set('CESA', {
      name: 'Computer Engineering Students Association',
      shortCode: 'CESA',
      department: 'Computer Engineering',
      category: 'Technical Departmental Association',
      description: 'Student body of the Computer Engineering department at PCCOE. Focuses on competitive programming, open source, and technical events.',
      flagshipEvent: 'Anant (Annual Technical Fest)',
      activities: [
        'Annual tech fest Anant',
        '24-hour hackathons',
        'Open source contribution drives',
        'Competitive programming bootcamps',
        'Smart India Hackathon (SIH) coordination',
        'ICPC (International Collegiate Programming Contest) participation',
      ],
      facultyCoordinator: 'Prof. A. K. More (Computer Department)',
      studentPresident: 'Kunal Patil (BE Computer)',
      contactEmail: 'cesa@pccoepune.org',
    });

    this.clubs.set('TKR', {
      name: 'Team Kratos Racing Electric',
      shortCode: 'TKR',
      department: 'Mechanical Engineering & ENTC',
      category: 'Collegiate Motor Sports Club',
      description: 'Team Kratos Racing Electric represents the Formula Student initiative at PCCOE. 40 dedicated undergraduate students from diverse disciplines design, manufacture, and test electric Formula Student race cars. Vision: To consistently compete for Podium position in Formula Student Germany.',
      flagshipEvent: 'Formula Student Germany & Formula Bharat',
      activities: [
        'Designing and manufacturing electric Formula Student race cars',
        'Participating in Formula Student Germany (international competition)',
        'Competing at Formula Bharat',
        'Interdisciplinary engineering collaboration across Mechanical, ENTC, Computer, IT departments',
        'Conducting technical workshops on EV technology for students',
      ],
      facultyCoordinator: 'Dr. S.R. Wankhede (Mechanical) & Dr. M.M. Narkhede (ENTC)',
      studentPresident: 'Suraj Aher (Managing Director)',
      contactEmail: 'kratos@pccoepune.org',
    });

    this.clubs.set('RED_BARON', {
      name: 'Team Red Baron',
      shortCode: 'RED_BARON',
      department: 'Mechanical Engineering',
      category: 'Collegiate Motor Sports Club',
      description: 'Team Red Baron is a group of 30 undergraduate students from PCCOE. They design, manufacture and test All-Terrain Vehicles (ATV) and participate in National and International SAE Baja competitions. Mission: To build the ideal ATV that can endure and survive the toughest conditions.',
      flagshipEvent: 'SAE Baja India & International SAE Baja',
      activities: [
        'Designing and manufacturing All-Terrain Vehicles (ATV)',
        'Participating in SAE Baja India (national competition)',
        'Competing in International SAE Baja competitions',
        'Vehicle dynamics, chassis design, and suspension engineering',
        'Technical workshops on off-road vehicle design',
      ],
      facultyCoordinator: 'Mr. U.I. Shaikh (Mechanical) & Mr. Rohit Tate (IT)',
      studentPresident: 'Om Kangle (Managing Director), Tanmay Chaskar (Co-MD)',
      contactEmail: 'redbaron@pccoepune.org',
    });

    this.clubs.set('CODING_CLUB', {
      name: 'Coding Club PCCOE',
      shortCode: 'CODING_CLUB',
      department: 'Computer Engineering',
      category: 'Technical Club',
      description: 'The Coding Club at PCCOE focuses on competitive programming, hackathons, software development, and technical skill building for students across all departments.',
      flagshipEvent: 'Annual Hackathon',
      activities: [
        'Competitive programming contests on LeetCode, Codeforces, HackerRank',
        'Internal and external hackathons',
        'Algorithm and data structure workshops',
        'Open-source contribution drives',
        'Technical interview preparation sessions',
      ],
      facultyCoordinator: 'Mr. Abhishek Raut (Computer Department)',
      studentPresident: 'Student representative (BE/TE Computer)',
      contactEmail: 'codingclub@pccoepune.org',
    });

    this.clubs.set('AUTOMATONS', {
      name: 'Team Automatons',
      shortCode: 'AUTOMATONS',
      department: 'Mechanical Engineering & ENTC',
      category: 'Collegiate Robotics & Automation Club',
      description: 'Team Automatons focuses on robotics, automation, and autonomous systems. They develop autonomous robots and participate in national robotics competitions.',
      flagshipEvent: 'National Robotics Competitions',
      activities: [
        'Building autonomous robots and automation systems',
        'Participating in national robotics competitions',
        'Workshops on embedded systems and robotics',
        'Robot programming and computer vision',
      ],
      facultyCoordinator: 'Dr. S.B. Matekar (Mechanical) & Dr. Varsha Bendre (ENTC)',
      studentPresident: 'Student representative',
      contactEmail: 'automatons@pccoepune.org',
    });

    this.clubs.set('MAVERICK_INDIA', {
      name: 'Team Maverick India',
      shortCode: 'MAVERICK_INDIA',
      department: 'Mechanical Engineering & ENTC',
      category: 'Collegiate Innovation Club',
      description: 'Team Maverick India is an innovation and disaster management team. Won Silver at NIDAR 2026 in Disaster Management category.',
      flagshipEvent: 'NIDAR (National Innovative Disaster Avoidance Robot)',
      activities: [
        'Disaster management robot design and development',
        'Competing in NIDAR national competition',
        'Innovation challenges and student competitions',
        'NIDAR 2026: SILVER WINNER in Disaster Management',
      ],
      facultyCoordinator: 'Prof. C.R. Ingole (Mechanical) & Mr. Ajjay Ghade (ENTC)',
      studentPresident: 'Student representative',
      contactEmail: 'maverickind@pccoepune.org',
    });

    this.clubs.set('SOLARIUM', {
      name: 'Team Solarium',
      shortCode: 'SOLARIUM',
      department: 'Mechanical Engineering & ENTC',
      category: 'Collegiate Solar Vehicle Club',
      description: 'Team Solarium develops solar-powered vehicles and participates in solar vehicle competitions, promoting renewable energy technology.',
      flagshipEvent: 'Solar Vehicle Competition',
      activities: [
        'Designing and building solar-powered vehicles',
        'Competing in solar vehicle competitions',
        'Research in renewable energy and sustainable transport',
        'Promoting solar technology awareness',
      ],
      facultyCoordinator: 'Dr. Jaya Goyal (Mechanical) & Dr. Pramod Sonavane (ENTC)',
      studentPresident: 'Student representative',
      contactEmail: 'solarium@pccoepune.org',
    });

    this.clubs.set('IEEE_PCCOE', {
      name: 'PCCOE IEEE Student Branch',
      shortCode: 'IEEE_PCCOE',
      department: 'All Departments',
      category: 'Professional Technical Chapter',
      description: 'PCCOE IEEE Student Branch conducts IEEE international conferences, paper presentations, and research symposiums. Member of the global IEEE network. Hosts ICCUBEA (International Conference on Computing, Communication, Control and Automation).',
      flagshipEvent: 'ICCUBEA (International Conference)',
      activities: [
        'Organizing ICCUBEA international conference',
        'IEEE paper presentations and workshops',
        'Technical symposiums and research sessions',
        'IEEE certification programs',
        'Industry expert lectures',
      ],
      facultyCoordinator: 'IEEE Faculty Advisor, PCCOE',
      studentPresident: 'IEEE Student Chair, PCCOE',
      contactEmail: 'ieee@pccoepune.org',
    });

    this.clubs.set('GDSC', {
      name: 'Google Developer Student Clubs PCCOE',
      shortCode: 'GDSC',
      department: 'All Departments',
      category: 'Professional Technical Chapter (Google Supported)',
      description: 'GDSC PCCOE is a Google-supported community for Android, Flutter, Cloud, and Machine Learning development. Organizes Google Solution Challenges and Study Jams.',
      flagshipEvent: 'Google Solution Challenge',
      activities: [
        'Android app development workshops',
        'Flutter mobile development sessions',
        'Google Cloud study jams',
        'Machine learning with TensorFlow',
        'Google Solution Challenge participation',
      ],
      facultyCoordinator: 'GDSC Faculty Advisor, PCCOE',
      studentPresident: 'GDSC Lead, PCCOE',
      contactEmail: 'gdsc@pccoepune.org',
    });

    // ─── PLACEMENTS ─────────────────────────────────────────────────────────

    this.placements.set('2025-2026', {
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

    // ─── HOSTELS ─────────────────────────────────────────────────────────────

    this.hostels.set('Nilgiri', {
      buildingName: 'PCCOE Boys Hostel (Nilgiri)',
      gender: 'Boys',
      location: 'Sector 26, Pradhikaran, Nigdi, Pune - 411044 (Adjacent to Main Campus)',
      totalCapacity: 350,
      doubleRoomFeeAnnual: 95000,
      tripleRoomFeeAnnual: 75000,
      messFeeAnnual: 38000,
      depositRefundable: 5000,
      curfewTimeWeekday: '9:30 PM',
      curfewTimeWeekend: '10:00 PM',
      wardenName: 'Prof. V. K. Kadam',
      wardenContact: '+91-020-27653168 Ext 401',
      facilities: [
        'High-speed Wi-Fi',
        '24/7 CCTV & Biometric Access Control',
        'Solar Water Heating',
        'Gymnasium',
        'Study Reading Rooms',
        'Pure Veg Multi-cuisine Mess',
        'Common Recreation Room',
      ],
    });

    this.hostels.set('Parvati', {
      buildingName: 'PCCOE Girls Hostel (Parvati)',
      gender: 'Girls',
      location: 'Sector 26, Pradhikaran, Nigdi, Pune - 411044 (Adjacent to Main Campus)',
      totalCapacity: 250,
      doubleRoomFeeAnnual: 95000,
      tripleRoomFeeAnnual: 75000,
      messFeeAnnual: 38000,
      depositRefundable: 5000,
      curfewTimeWeekday: '9:30 PM',
      curfewTimeWeekend: '10:00 PM',
      wardenName: 'Prof. M. S. Deshpande',
      wardenContact: '+91-020-27653168 Ext 402',
      facilities: [
        'High-speed Wi-Fi',
        '24/7 CCTV & Biometric Access Control',
        'Solar Water Heating',
        'Study Reading Rooms',
        'Pure Veg Multi-cuisine Mess',
        'Common Room & TV Room',
      ],
    });

    // ─── SCHOLARSHIPS ─────────────────────────────────────────────────────────

    this.scholarships.set('EBC', {
      schemeName: 'Rajarshi Chhatrapati Shahu Maharaj Shikshan Shulk Shishyavrutti Yojna (EBC)',
      category: 'Open / General',
      portal: 'MahaDBT (https://mahadbt.maharashtra.gov.in)',
      tuitionFeeWaiverPercentage: 50,
      examFeeWaiverPercentage: 50,
      incomeLimitAnnual: 800000,
      eligibilityCriteria: 'Maharashtra domicile, admitted through CAP, annual family income <= Rs. 8,00,000.',
      requiredDocuments: ['Income Certificate', 'Domicile Certificate', 'CAP Allotment Letter', 'Ration Card'],
    });

    this.scholarships.set('TFWS', {
      schemeName: 'Tuition Fee Waiver Scheme (TFWS)',
      category: 'Merit-based (All Categories)',
      portal: 'DTE Maharashtra CAP',
      tuitionFeeWaiverPercentage: 100,
      examFeeWaiverPercentage: 0,
      incomeLimitAnnual: 0,
      eligibilityCriteria: 'Merit students allotted through TFWS seats in DTE CAP rounds. Requires MHT-CET 99.35+ percentile for Computer Engineering. Limited seats per branch.',
      requiredDocuments: ['CAP TFWS Allotment Letter', 'MHT-CET Scorecard', 'Income Affidavit'],
    });

    this.scholarships.set('SC_ST', {
      schemeName: 'SC/ST/VJNT/SBC Government Scholarship',
      category: 'SC / ST / VJNT / SBC',
      portal: 'MahaDBT & Samaj Kalyan Vibhag (mahaeschol.maharashtra.gov.in)',
      tuitionFeeWaiverPercentage: 100,
      examFeeWaiverPercentage: 100,
      incomeLimitAnnual: 0,
      eligibilityCriteria: 'Scheduled Caste, Scheduled Tribe, Vimukta Jati, Nomadic Tribes, Special Backward Class students with valid caste certificate and caste validity.',
      requiredDocuments: ['Caste Certificate', 'Caste Validity Certificate', 'Non-Creamy Layer Certificate', 'Income Certificate', 'Domicile Certificate'],
    });

    // ─── LIBRARY ─────────────────────────────────────────────────────────────

    this.libraries.set('APJ_KALAM', {
      name: 'Dr. APJ Abdul Kalam Central Library',
      location: 'Main Building, PCCOE Campus, Sector 26, Nigdi, Pune',
      workingHoursRegular: 'Monday to Saturday: 8:00 AM - 10:00 PM',
      workingHoursExam: 'Extended till 12:00 Midnight (12 AM) during End-Semester Exams',
      totalVolumes: 60000,
      totalTitles: 15000,
      digitalSubscriptions: ['IEEE Xplore', 'ScienceDirect (Elsevier)', 'ASME Digital Library'],
      specialFacilities: ['Book Bank for First Year students', 'Book Bank for Reserved Category students', 'OPAC (Online Public Access Catalog)', 'Reading rooms', 'Computer terminals with internet'],
      website: 'pccoepune.com/library.php',
    });
  }

  isMongoActive(): boolean {
    return mongoose.connection.readyState === 1;
  }
}

export const memoryDb = new MemoryDatabase();
