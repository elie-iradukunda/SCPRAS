/**
 * One-shot migration + seed script for Demo Homes Mixed-Use Complex.
 * Run with: node seed-demohomes.mjs
 * Safe to run multiple times (uses INSERT IGNORE / upserts).
 */
import bcrypt from 'bcryptjs';
import mysql from 'mysql2/promise';

const conn = await mysql.createConnection({
  host: 'localhost', user: 'root', password: '', database: 'buildintel', port: 3306,
  multipleStatements: true,
});
console.log('Connected to MySQL.');

// ── 1. Fix Projects schema ──────────────────────────────────────────────
console.log('\n[1/7] Patching Projects schema...');
const [cols] = await conn.query('SHOW COLUMNS FROM Projects');
const colNames = cols.map(c => c.Field);

const projectCols = [
  ['clientPhone',  'VARCHAR(30) DEFAULT NULL AFTER clientName'],
  ['clientEmail',  'VARCHAR(191) DEFAULT NULL AFTER clientPhone'],
  ['contractRef',  'VARCHAR(100) DEFAULT NULL AFTER clientEmail'],
  ['priority',     "ENUM('low','normal','high','critical') DEFAULT 'normal' AFTER status"],
];
for (const [name, def] of projectCols) {
  if (!colNames.includes(name)) {
    await conn.query(`ALTER TABLE Projects ADD COLUMN ${name} ${def}`);
    console.log(`  Added column: ${name}`);
  } else {
    console.log(`  Already exists: ${name}`);
  }
}

// ── 2. Users 6-9 ────────────────────────────────────────────────────────
console.log('\n[2/7] Seeding users 6-9...');
const workerPwd = await bcrypt.hash('worker123', 10);
const newUsers = [
  { id: 6, fullName: 'Hakizimana Pierre',  email: 'pierre.hakizimana@buildintel.rw',  role: 'project_manager', phone: '0782340001', nationalId: '119878005' },
  { id: 7, fullName: 'Uwimana Vestine',    email: 'vestine.uwimana@buildintel.rw',    role: 'site_engineer',   phone: '0782340002', nationalId: '119878006' },
  { id: 8, fullName: 'Habimana Gilbert',   email: 'gilbert.habimana@buildintel.rw',   role: 'worker',          phone: '0782340003', nationalId: '119878007' },
  { id: 9, fullName: 'Nzeyimana Patrick',  email: 'patrick.nzeyimana@buildintel.rw',  role: 'worker',          phone: '0782340004', nationalId: '119878008' },
];
for (const u of newUsers) {
  await conn.query(
    `INSERT IGNORE INTO Users (id,fullName,email,password,role,phone,nationalId,status,createdAt,updatedAt)
     VALUES (?,?,?,?,'${u.role}','${u.phone}','${u.nationalId}','active',NOW(),NOW())`,
    [u.id, u.fullName, u.email, workerPwd]
  );
}
console.log('  Users 6-9 seeded.');

// ── 3. Workers 5-8 ──────────────────────────────────────────────────────
console.log('\n[3/7] Seeding workers 5-8...');
const newWorkers = [
  { id:5, userId:6,  employeeCode:'BI-W-005', position:'Site Foreman',       salary:1850, dailyRate:92,  employmentType:'permanent', skillLevel:'expert',  productivityScore:94, smartCardCode:'BI-W-005', joinDate:'2026-02-28', gender:'male',   department:'Site Management', status:'active' },
  { id:6, userId:7,  employeeCode:'BI-W-006', position:'Glazing Specialist',  salary:1620, dailyRate:81,  employmentType:'contract',  skillLevel:'expert',  productivityScore:91, smartCardCode:'BI-W-006', joinDate:'2026-05-15', gender:'female', department:'Facade Works',    status:'active' },
  { id:7, userId:8,  employeeCode:'BI-W-007', position:'Lead Bricklayer',     salary:1240, dailyRate:62,  employmentType:'contract',  skillLevel:'skilled', productivityScore:89, smartCardCode:'BI-W-007', joinDate:'2026-03-05', gender:'male',   department:'Masonry',         status:'active' },
  { id:8, userId:9,  employeeCode:'BI-W-008', position:'Electrician',         salary:1380, dailyRate:69,  employmentType:'contract',  skillLevel:'skilled', productivityScore:86, smartCardCode:'BI-W-008', joinDate:'2026-04-01', gender:'male',   department:'MEP',             status:'active' },
];
for (const w of newWorkers) {
  await conn.query(
    `INSERT IGNORE INTO Workers
      (id,userId,employeeCode,position,salary,dailyRate,employmentType,skillLevel,productivityScore,smartCardCode,joinDate,gender,department,ppeIssued,status,createdAt,updatedAt)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,1,?,NOW(),NOW())`,
    [w.id,w.userId,w.employeeCode,w.position,w.salary,w.dailyRate,w.employmentType,w.skillLevel,w.productivityScore,w.smartCardCode,w.joinDate,w.gender,w.department,w.status]
  );
}
console.log('  Workers 5-8 seeded.');

// ── 4. Project 5 ────────────────────────────────────────────────────────
console.log('\n[4/7] Seeding Project 5...');
await conn.query(`
  INSERT IGNORE INTO Projects
    (id,projectName,clientName,clientPhone,clientEmail,contractRef,location,projectType,budget,spent,startDate,deadline,status,priority,progress,siteEngineer,projectManager,description,createdAt,updatedAt)
  VALUES
    (5,'Demo Homes Mixed-Use Complex','Demo Homes Ltd','+250788123456','info@demohomes.rw','DHL-2026-042',
     'KG 17 Ave, Kacyiru, Kigali','Mixed-Use',2850000.00,885000.00,'2026-03-01','2027-06-30','active','high',38,
     'Uwimana Vestine','Hakizimana Pierre',
     '42-unit residential and commercial mixed-use complex — 3 blocks (A/B/C), podium bookshop and retail, curtain-wall facade, RC frame structure up to G+6.',
     NOW(),NOW())
`);
console.log('  Project 5 seeded.');

// ── 5. Phases ────────────────────────────────────────────────────────────
console.log('\n[5/7] Seeding 12 phases...');
await conn.query('DELETE FROM ProjectPhases WHERE projectId=5');
const phases = [
  [7,  'Site Preparation & Demolition',             '2026-03-01','2026-03-15',100,'completed'],
  [8,  'Foundation & Basement Slab',                '2026-03-16','2026-04-30',100,'completed'],
  [9,  'RC Frame & Structural Columns',             '2026-05-01','2026-07-15', 95,'active'],
  [10, 'Block A Brickwork & Walling',               '2026-05-15','2026-08-31', 60,'active'],
  [11, 'Block B Tower Shell',                       '2026-06-01','2026-09-30', 40,'active'],
  [12, 'Block C Podium Shell',                      '2026-06-10','2026-10-31', 15,'active'],
  [13, 'Curtain Wall & Glazing Installation',       '2026-07-01','2026-10-31', 10,'active'],
  [14, 'Roof Structure & Waterproofing',            '2026-08-01','2026-10-15',  5,'planned'],
  [15, 'MEP Rough-in (Electrical & Plumbing)',      '2026-08-15','2027-01-31',  0,'planned'],
  [16, 'Interior Common Areas Fit-out',             '2026-11-01','2027-03-31',  0,'planned'],
  [17, 'Interior Residential Fit-out (42 Units)',   '2027-01-01','2027-05-31',  0,'planned'],
  [18, 'External Works, Landscaping & Commissioning','2027-03-01','2027-06-30', 0,'planned'],
];
for (const [id,name,sd,ed,prog,status] of phases) {
  await conn.query(
    `INSERT IGNORE INTO ProjectPhases (id,projectId,name,startDate,endDate,progress,status,createdAt,updatedAt) VALUES (?,5,?,?,?,?,?,NOW(),NOW())`,
    [id,name,sd,ed,prog,status]
  );
}
console.log('  12 phases seeded.');

// ── 6. Materials (45 items) ──────────────────────────────────────────────
console.log('\n[6/7] Seeding 45 BOQ materials...');
await conn.query('DELETE FROM Materials WHERE projectId=5');
const mats = [
  // id, name, category, unit, planned, received, used, unitCost, estCost, supplier, poNum, grade, status
  [7,  'Red Clay Bricks (Machine-Pressed)',       'Material',  'Pcs',    4000000, 2400000, 1600000, 0.28,  1120000, 'Rwanda Clay Works Ltd',          'PO-DHL-2026-007', 'Grade B Compressive ≥ 20 N/mm²',         'received'],
  [8,  'OPC Cement 50 kg (CIMERWA)',              'Material',  'Bag',      18000,    9800,    8500, 13,     234000, 'CIMERWA Rwanda',                  'PO-DHL-2026-008', 'OPC 42.5N EN 197-1',                     'received'],
  [9,  'River Sand (Washed)',                     'Material',  'm³',         650,     420,     380, 18,      11700, 'Volcano Aggregates Ltd',          'PO-DHL-2026-009', 'Zone II FM 2.0–3.0',                     'received'],
  [10, 'Crushed Stone 20 mm (Coarse Aggregate)',  'Material',  'm³',         450,     300,     260, 22,       9900, 'Volcano Aggregates Ltd',          'PO-DHL-2026-010', 'BS 882 Grading C/M',                     'received'],
  [11, 'Y12 Deformed Rebar 12 m',                'Material',  'Tonne',      320,     295,     290, 950,    304000, 'Steel Works Rwanda Ltd',          'PO-DHL-2026-011', 'Grade 500B BS 4449',                     'received'],
  [12, 'Y16 Deformed Rebar 12 m',                'Material',  'Tonne',      180,     175,     170, 1050,   189000, 'Steel Works Rwanda Ltd',          'PO-DHL-2026-012', 'Grade 500B BS 4449',                     'received'],
  [13, 'Y20 Deformed Rebar 12 m',                'Material',  'Tonne',       95,      90,      85, 1120,   106400, 'Steel Works Rwanda Ltd',          'PO-DHL-2026-013', 'Grade 500B',                             'received'],
  [14, 'C30 Ready-Mix Concrete',                 'Material',  'm³',         480,     478,     478, 145,     69600, 'ReadyMix Kigali',                 'PO-DHL-2026-014', 'C30/37 XC2 — structural columns & slabs', 'used'],
  [15, 'C25 Ready-Mix Concrete',                 'Material',  'm³',         320,     318,     318, 132,     42240, 'ReadyMix Kigali',                 'PO-DHL-2026-015', 'C25/30 XC1 — ground beams',              'used'],
  [16, 'Aluminium Curtain Wall System',           'Material',  'm²',         820,      38,      10, 680,    557600, 'Alupco Trading Rwanda',           'PO-DHL-2026-016', 'Alupco Series 65 — thermal break',       'received'],
  [17, 'Double-Glazed IGU 6+12+6 mm',            'Material',  'm²',         650,       8,       5, 420,    273000, 'GlazTech Africa',                 'PO-DHL-2026-017', 'U-value ≤ 1.6 W/m²K, SHGC 0.25',        'received'],
  [18, 'Ceramic Floor Tiles 600×600 mm',         'Material',  'm²',        4200,       0,       0, 38,     159600, 'Tiles & Ceramics Rwanda',         'PO-DHL-2026-018', 'ISO 13006 Class BIa, R10 anti-slip',     'pending'],
  [19, 'External Face Brick (Textured)',          'Material',  'Pcs',     180000,   60000,   42000, 0.32,    57600, 'Heritage Bricks Ltd',             'PO-DHL-2026-019', 'Textured buff, compressive ≥ 15 N/mm²',  'received'],
  [20, 'Anti-Crack Render & Plaster',            'Material',  'Bag',        380,     180,     140, 18,       6840, 'BuildChem Rwanda',                'PO-DHL-2026-020', 'Polymer-modified, BS EN 998-1',          'received'],
  [21, 'Exterior Waterproof Masonry Paint',       'Material',  'Tin',        480,       0,       0, 48,      23040, 'Crown Paints Rwanda',             'PO-DHL-2026-021', 'Crown WeatherShield, 20L tins',          'pending'],
  [22, 'DPC Sheet 1000 mm (Polythene)',           'Material',  'm',         1200,    1200,    1200, 3.2,      3840, 'Construction Materials Depot',    'PO-DHL-2026-022', 'BS 6515, 500-micron polyethylene',       'used'],
  [23, '12 mm Plywood Formwork Sheets',           'Material',  'Sheet',      620,     600,     580, 28,      17360, 'Kigali Timber & Hardware',        'PO-DHL-2026-023', 'WBP phenolic-bonded, 2440×1220 mm',      'received'],
  [24, 'C16 Binding Wire (Annealed)',             'Material',  'Kg',        2400,    2000,    1900, 1.85,     4440, 'Steel Works Rwanda Ltd',          'PO-DHL-2026-024', 'Annealed soft wire, 1.0 mm diameter',   'received'],
  [25, 'Class A Engineering Bricks',             'Material',  'Pcs',      32000,   32000,   32000, 0.65,    20800, 'Heritage Bricks Ltd',             'PO-DHL-2026-025', 'Compressive ≥ 70 N/mm², BS EN 771-1',   'used'],
  [26, 'Manufactured M-Sand (Plastering Grade)', 'Material',  'm³',         180,     120,      90, 22,       3960, 'Volcano Aggregates Ltd',          'PO-DHL-2026-026', 'IS 383 Grading Zone II',                 'received'],
  [27, 'PVC Conduit 20 mm (Light Gauge)',        'Material',  'm',         4800,       0,       0, 2.8,      13440, 'ElectroParts Rwanda',             'PO-DHL-2026-027', 'BS EN 61386-1, self-extinguishing',      'pending'],
  [28, 'HDPE Pipe 110 mm (Drainage)',            'Material',  'm',         2400,       0,       0, 8.5,      20400, 'Plumb Systems Rwanda',            'PO-DHL-2026-028', 'SN8 BS EN 13476-3',                      'pending'],
  [29, 'Ceramic Wall Tiles 300×450 mm',          'Material',  'm²',        2800,       0,       0, 32,       89600, 'Tiles & Ceramics Rwanda',         'PO-DHL-2026-029', 'ISO 13006 Class BIII, W3 wet room',      'pending'],
  [30, 'Anti-Termite Treatment (Chlorpyrifos)',  'Material',  'Litre',      120,     120,     120, 42,        5040, 'Pest Guard Africa',               'PO-DHL-2026-030', 'WHO Category II — soil treatment',       'used'],
  [31, 'Structural Steel I-Beam (Universal)',    'Material',  'Tonne',       28,      28,      28, 1380,     38640, 'ArcelorMittal South Africa',      'PO-DHL-2026-031', 'S355 JR EN 10025 — transfer beams',      'used'],
  // Equipment
  [32, 'Tower Crane TC7052 (55 m jib)',          'Equipment', 'Month',       15,      15,       4, 8500,    127500, 'Kranemann Plant Hire Rwanda',     'PO-DHL-2026-032', 'Max SWL 8T @ 25 m, 55 m jib radius',    'received'],
  [33, 'Concrete Batching Plant 35 m³/hr',       'Equipment', 'Month',       12,      12,       4, 4200,     50400, 'Kigali Plant Hire',               'PO-DHL-2026-033', 'Output 35 m³/hr, twin-shaft mixer',      'received'],
  [34, 'Ringlock Scaffolding System (2400 m²)',  'Equipment', 'Month',       18,      18,       5, 2800,     50400, 'SafeScaff Rwanda',                'PO-DHL-2026-034', 'EN 12810-1 certified, 600 kg/m² capacity','received'],
  [35, 'Poker Vibrators 45 mm (×4 units)',       'Equipment', 'Unit',         4,       4,       4, 380,       1520, 'Bosch Tools Rwanda',              'PO-DHL-2026-035', 'Bosch GVC 35 EX, 350W, 45 mm head',      'received'],
  [36, '125 kVA Diesel Generator',               'Equipment', 'Month',       16,      16,       4, 1800,     28800, 'AggrePower Rwanda',               'PO-DHL-2026-036', 'Cummins 125 kVA, auto-transfer switch', 'received'],
  [37, 'Articulated Boom Lift 24 m (JLG)',       'Equipment', 'Month',       10,      10,       2, 5200,     52000, 'Cranab Plant Hire',               'PO-DHL-2026-037', 'JLG 800AJ, 24.4 m working height',       'received'],
  [38, 'Bar Bending Machine (Electric)',         'Equipment', 'Unit',         1,       1,       1, 2400,      2400, 'Tools & Equipment Ltd Rwanda',    'PO-DHL-2026-038', 'GF-32 bender, Ø8–32 mm capacity',        'used'],
  [39, 'Concrete Pump 40 m Line',                'Equipment', 'Month',       12,      12,       4, 3600,     43200, 'ReadyMix Kigali',                 'PO-DHL-2026-039', 'Schwing BPA 1000 truck-mounted',          'received'],
  // Labor
  [40, 'Lead Masons & Brickwork Team (×8)',      'Labor',     'WD',        2560,    2560,     630, 28,       71680, 'Kigali Labour Bureau',            'PO-DHL-2026-040', 'NVQ Level 3 Bricklaying or equivalent',  'received'],
  [41, 'Steel Fixers Gang (×6)',                 'Labor',     'WD',        1440,    1440,    1200, 35,       50400, 'Direct Hire',                     'PO-DHL-2026-041', 'Competent Bar-Fixer + Safety Card',       'used'],
  [42, 'RC Frame Carpenters (×5)',               'Labor',     'WD',         900,     900,     900, 32,       28800, 'Direct Hire',                     'PO-DHL-2026-042', 'Formwork carpentry + shuttering',         'used'],
  [43, 'Glazing Technicians (×4)',               'Labor',     'WD',         640,     640,      60, 48,       30720, 'GlazTech Africa',                 'PO-DHL-2026-043', 'Curtain-wall certified installer',        'received'],
  [44, 'Site Supervisors (×3)',                  'Labor',     'WD',         900,     900,     300, 55,       49500, 'Direct Hire',                     'PO-DHL-2026-044', 'HNC Construction or equivalent',          'received'],
  [45, 'General Labourers (×20)',                'Labor',     'WD',        8000,    8000,    2800, 18,      144000, 'Kigali Labour Bureau',            'PO-DHL-2026-045', 'Basic Safety Induction required',         'received'],
  [46, 'Electricians (×4)',                      'Labor',     'WD',         800,       0,       0, 45,       36000, 'Power Systems Rwanda',            'PO-DHL-2026-046', 'REG/REMA Licensed Electrician',           'pending'],
  [47, 'Plumbers (×4)',                          'Labor',     'WD',         800,       0,       0, 42,       33600, 'Plumb Rwanda',                    'PO-DHL-2026-047', 'NVQ Plumbing or equivalent',              'pending'],
  [48, 'Tilers & Finishers (×8)',                'Labor',     'WD',        1920,       0,       0, 30,       57600, 'Finishers Guild Rwanda',          'PO-DHL-2026-048', 'Tiling + screeding competency',           'pending'],
  [49, 'External Scaffold Crew (×6)',            'Labor',     'WD',        1080,    1080,     480, 22,       23760, 'SafeScaff Rwanda',                'PO-DHL-2026-049', 'CISRS Scaffold Card required',            'received'],
  [50, 'Concrete Pump Operators (×2)',           'Labor',     'WD',         240,     240,     240, 38,        9120, 'Direct Hire',                     'PO-DHL-2026-050', 'CPCS Pump Certificate',                   'used'],
  [51, 'Safety & QC Inspector (×2)',             'Labor',     'WD',         600,     600,     200, 52,       31200, 'BuildSafe Rwanda',                'PO-DHL-2026-051', 'NEBOSH IGC certified',                    'received'],
];
for (const [id,name,cat,unit,planned,received,used,unitCost,estCost,supplier,poNum,grade,status] of mats) {
  const remaining = received - used;
  await conn.query(
    `INSERT IGNORE INTO Materials
      (id,projectId,materialName,category,unit,plannedQuantity,receivedQuantity,usedQuantity,remainingStock,unitCost,estimatedCost,supplier,purchaseOrderNumber,gradeSpecification,status,qualityStatus,wastageAllowancePercent,createdAt,updatedAt)
     VALUES (?,5,?,?,?,?,?,?,?,?,?,?,?,?,'${status}','approved',5,NOW(),NOW())`,
    [id,name,cat,unit,planned,received,used,remaining,unitCost,estCost,supplier,poNum,grade]
  );
}
console.log('  45 BOQ materials seeded.');

// ── 7. Assignments + Attendance ──────────────────────────────────────────
console.log('\n[7/7] Seeding assignments and attendance...');
await conn.query('DELETE FROM ProjectAssignments WHERE projectId=5');
const assignments = [
  [6,5,5,'Site Foreman'],[7,5,6,'Glazing Specialist'],[8,5,7,'Lead Bricklayer'],[9,5,8,'Electrician'],
  [10,5,1,'Mason'],[11,5,2,'Site Engineer'],[12,5,3,'General Labourer'],[13,5,4,'Steel Fixer'],
];
for (const [id,pid,wid,role] of assignments) {
  await conn.query(
    `INSERT IGNORE INTO ProjectAssignments (id,projectId,workerId,role,createdAt,updatedAt) VALUES (?,?,?,?,NOW(),NOW())`,
    [id,pid,wid,role]
  );
}

await conn.query('DELETE FROM Attendances WHERE projectId=5');
const buildAtt = (id, wid, _date, checkIn, checkOut, hours, notes) => [id, wid, 5, checkIn, checkOut, hours, 'present', 'KG 17 Ave, Kacyiru, Kigali', notes];
const attendance = [
  // Pierre (w5) Jun 4-9
  buildAtt(6,  5,'2026-06-04','2026-06-04T05:30:00Z','2026-06-04T15:15:00Z',9.75,'Supervised Block A column pour — 4 columns complete'),
  buildAtt(7,  5,'2026-06-05','2026-06-05T05:30:00Z','2026-06-05T15:15:00Z',9.75,'Brickwork setting-out inspection — Block A Level 1'),
  buildAtt(8,  5,'2026-06-06','2026-06-06T05:30:00Z','2026-06-06T15:00:00Z',9.50,'Safety toolbox talk + scaffolding inspection'),
  buildAtt(9,  5,'2026-06-07','2026-06-07T05:30:00Z','2026-06-07T15:15:00Z',9.75,'Curtain wall mock-up review with glazing team'),
  buildAtt(10, 5,'2026-06-08','2026-06-08T05:30:00Z','2026-06-08T15:00:00Z',9.50,'Block B: column alignment check, rebar inspection'),
  buildAtt(11, 5,'2026-06-09','2026-06-09T05:30:00Z','2026-06-09T15:00:00Z',9.50,'Site diary + progress photos for client report'),
  // Vestine (w6) Jun 4-8
  buildAtt(12, 6,'2026-06-04','2026-06-04T05:35:00Z','2026-06-04T15:05:00Z',9.50,'Curtain wall frame installation — bookshop façade Bay 1'),
  buildAtt(13, 6,'2026-06-05','2026-06-05T05:35:00Z','2026-06-05T15:05:00Z',9.50,'IGU panel installation — 5 units fixed, sealant applied'),
  buildAtt(14, 6,'2026-06-06','2026-06-06T05:35:00Z','2026-06-06T14:59:00Z',9.40,'Thermal break insert — Bay 1 complete, Bay 2 started'),
  buildAtt(15, 6,'2026-06-07','2026-06-07T05:35:00Z','2026-06-07T15:05:00Z',9.50,'Façade water-tightness test — Bay 1 passed QA check'),
  buildAtt(16, 6,'2026-06-08','2026-06-08T05:35:00Z','2026-06-08T15:05:00Z',9.50,'Bay 2 frame assembly — transoms and mullions complete'),
  // Gilbert (w7) Jun 4-9
  buildAtt(17, 7,'2026-06-04','2026-06-04T05:25:00Z','2026-06-04T15:05:00Z',9.67,'Block A Level 1 brickwork — 8 courses laid (east elevation)'),
  buildAtt(18, 7,'2026-06-05','2026-06-05T05:25:00Z','2026-06-05T15:05:00Z',9.67,'Block A Level 1 — window openings formed, lintels set'),
  buildAtt(19, 7,'2026-06-06','2026-06-06T05:25:00Z','2026-06-06T15:05:00Z',9.67,'Block A Level 1 — internal leaf brickwork, 6 courses'),
  buildAtt(20, 7,'2026-06-07','2026-06-07T05:25:00Z','2026-06-07T15:05:00Z',9.67,'Block B Level 1 started — external leaf set-out'),
  buildAtt(21, 7,'2026-06-08','2026-06-08T05:25:00Z','2026-06-08T15:05:00Z',9.67,'Block B Level 1 — 4 courses laid, face brickwork'),
  buildAtt(22, 7,'2026-06-09','2026-06-09T05:25:00Z','2026-06-09T15:05:00Z',9.67,'Block A Level 2 — started, 2 courses, scaffold raised'),
  // Patrick (w8) Jun 4-7
  buildAtt(23, 8,'2026-06-04','2026-06-04T05:30:00Z','2026-06-04T15:00:00Z',9.50,'Main DB cable tray routing — ground floor corridor'),
  buildAtt(24, 8,'2026-06-05','2026-06-05T05:30:00Z','2026-06-05T15:00:00Z',9.50,'First-fix conduit — Block A ground floor Units 1-6'),
  buildAtt(25, 8,'2026-06-06','2026-06-06T05:30:00Z','2026-06-06T15:00:00Z',9.50,'Earthing electrode installation — main switchroom'),
  buildAtt(26, 8,'2026-06-07','2026-06-07T05:30:00Z','2026-06-07T15:00:00Z',9.50,'Electrical inspection prep — block A ground floor'),
  // Jean Bosco (w1) Jun 8-9 (support)
  buildAtt(27, 1,'2026-06-08','2026-06-08T05:30:00Z','2026-06-08T15:00:00Z',9.50,'Support masonry — Block C podium internal walls'),
  buildAtt(28, 1,'2026-06-09','2026-06-09T05:30:00Z','2026-06-09T15:00:00Z',9.50,'Support masonry — Block C podium slab shuttering'),
  // Claudine (w2) Jun 8-9 (structural inspection)
  buildAtt(29, 2,'2026-06-08','2026-06-08T05:30:00Z','2026-06-08T15:00:00Z',9.50,'Structural inspection — RC frame columns + slab soffit'),
  buildAtt(30, 2,'2026-06-09','2026-06-09T05:30:00Z','2026-06-09T15:00:00Z',9.50,'Concrete cube test review + mix design sign-off'),
];
for (const [id,wid,pid,ci,co,hrs,status,loc,notes] of attendance) {
  await conn.query(
    `INSERT IGNORE INTO Attendances (id,workerId,projectId,checkIn,checkOut,hoursWorked,status,location,notes,createdAt,updatedAt)
     VALUES (?,?,?,?,?,?,?,?,?,NOW(),NOW())`,
    [id,wid,pid,ci,co,hrs,status,loc,notes]
  );
}
console.log('  8 assignments seeded.');
console.log('  25 attendance records seeded.');

await conn.end();
console.log('\n✅ Demo Homes seed complete!');
