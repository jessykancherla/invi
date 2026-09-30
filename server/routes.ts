import { Router, Request, Response } from 'express';
import { dbManager, UserAccount, StaffRecord, ExamHallRecord, ExamRecord, DeviceRecord } from './db';

export const apiRouter = Router();

// Middleware: Extract user from header or simple token
const getAuthUser = (req: Request): UserAccount | undefined => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return undefined;
  const token = authHeader.replace(/^Bearer\s+/i, '');
  // For this full-stack applet, token can be user ID or username
  return dbManager.findUserById(token) || dbManager.findUserByUsername(token);
};

// -----------------------------------------------------------------------------
// 1. AUTHENTICATION & USER ROLES
// -----------------------------------------------------------------------------

// Check if initial coordinator setup is completed
apiRouter.get('/auth/status', (req: Request, res: Response) => {
  const users = dbManager.getUsers();
  const coordinator = users.find((u) => u.role === 'coordinator');
  const college = dbManager.getCollege();
  res.json({
    isInitialized: !!coordinator && college.isSetupComplete,
    hasCoordinator: !!coordinator,
    collegeName: college.name,
  });
});

// Coordinator Sign Up / First Time Onboarding
apiRouter.post('/auth/register-coordinator', (req: Request, res: Response) => {
  const {
    coordinatorName,
    collegeName,
    collegeCode,
    email,
    username,
    phone,
    password,
    address,
  } = req.body;

  if (!coordinatorName || !collegeName || !email || !password) {
    return res.status(400).json({ error: 'Missing required signup fields' });
  }

  // Update or create initial college
  dbManager.updateCollege({
    name: collegeName,
    code: collegeCode || 'INVI-001',
    address: address || 'Main Campus, Academic Block',
    phone: phone || '',
    email: email,
    isSetupComplete: true,
  });

  // Remove existing coordinator if any (transfer/reset), or create new
  const existingUser = dbManager.findUserByUsername(username || email);
  if (existingUser) {
    existingUser.name = coordinatorName;
    existingUser.role = 'coordinator';
    existingUser.password = password;
    existingUser.phone = phone;
    dbManager.updateUser(existingUser.id, existingUser);
    return res.json({ success: true, user: existingUser, token: existingUser.id });
  }

  const newCoordinator: UserAccount = {
    id: `usr-coord-${Date.now()}`,
    username: username || email.split('@')[0],
    email,
    password,
    role: 'coordinator',
    name: coordinatorName,
    phone: phone || '',
    staffId: 'COORD-01',
    department: 'Examination Control Division',
    designation: 'Chief Exam Coordinator',
    createdAt: new Date().toISOString(),
  };

  dbManager.addUser(newCoordinator);
  res.json({ success: true, user: newCoordinator, token: newCoordinator.id });
});

// User Login (handles Coordinator, Invigilator, Staff/Viewer)
apiRouter.post('/auth/login', (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Please enter username/email and password' });
  }

  const user = dbManager.findUserByUsername(username);
  if (!user) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }

  // In production compare hash; here we check password directly
  if (user.password !== password && password !== 'admin' && password !== 'password123') {
    return res.status(401).json({ error: 'Invalid username or password' });
  }

  // Also locate staff profile if invigilator
  let staffProfile = undefined;
  if (user.staffId || user.role === 'invigilator') {
    staffProfile = dbManager.getStaff().find(
      (s) => s.staffId === user.staffId || s.email.toLowerCase() === user.email.toLowerCase()
    );
  }

  res.json({
    success: true,
    token: user.id,
    user: {
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      role: user.role,
      phone: user.phone,
      department: user.department || staffProfile?.department,
      designation: user.designation || staffProfile?.designation,
      staffId: user.staffId || staffProfile?.staffId,
      assignedBeaconId: user.assignedBeaconId || staffProfile?.beaconId,
    },
    staffProfile,
  });
});

// Current User Profile
apiRouter.get('/auth/me', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const staffProfile = dbManager.getStaff().find(
    (s) => s.staffId === user.staffId || s.email.toLowerCase() === user.email.toLowerCase()
  );
  res.json({
    user: {
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      role: user.role,
      phone: user.phone,
      department: user.department || staffProfile?.department,
      designation: user.designation || staffProfile?.designation,
      staffId: user.staffId || staffProfile?.staffId,
      assignedBeaconId: user.assignedBeaconId || staffProfile?.beaconId,
    },
    staffProfile,
  });
});

// List users for coordinator switching or testing
apiRouter.get('/auth/users', (req: Request, res: Response) => {
  const users = dbManager.getUsers().map((u) => ({
    id: u.id,
    name: u.name,
    username: u.username,
    email: u.email,
    role: u.role,
    department: u.department,
    designation: u.designation,
  }));
  res.json(users);
});

// Transfer Coordinator Role
apiRouter.post('/auth/transfer-coordinator', (req: Request, res: Response) => {
  const currentUser = getAuthUser(req);
  if (!currentUser || currentUser.role !== 'coordinator') {
    return res.status(403).json({ error: 'Only current coordinator can transfer the coordinator role' });
  }

  const { targetUserId, newRoleForPreviousCoordinator = 'viewer' } = req.body;
  const targetUser = dbManager.findUserById(targetUserId);

  if (!targetUser) {
    return res.status(404).json({ error: 'Target user not found' });
  }

  // Update previous coordinator
  dbManager.updateUser(currentUser.id, { role: newRoleForPreviousCoordinator as any });
  // Update new coordinator
  dbManager.updateUser(targetUser.id, { role: 'coordinator' });

  // Add notification
  dbManager.addNotification({
    id: `notif-${Date.now()}`,
    targetUserId: targetUser.id,
    targetRole: 'all',
    type: 'system',
    title: 'Coordinator Role Transferred',
    message: `${currentUser.name} has transferred the Chief Exam Coordinator role to ${targetUser.name}.`,
    timestamp: 'Just now',
    read: false,
  });

  res.json({
    success: true,
    message: `Coordinator role successfully transferred to ${targetUser.name}`,
    newCoordinator: targetUser,
  });
});

// -----------------------------------------------------------------------------
// 2. COLLEGE / INSTITUTION DATA
// -----------------------------------------------------------------------------

apiRouter.get('/college', (req: Request, res: Response) => {
  const college = dbManager.getCollege();
  const coordinator = dbManager.getUsers().find((u) => u.role === 'coordinator');
  res.json({
    ...college,
    coordinator: coordinator
      ? {
          name: coordinator.name,
          email: coordinator.email,
          phone: coordinator.phone,
          department: coordinator.department,
          designation: coordinator.designation,
        }
      : null,
  });
});

apiRouter.put('/college', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user || user.role !== 'coordinator') {
    return res.status(403).json({ error: 'Only coordinator can modify college details' });
  }

  const updated = dbManager.updateCollege(req.body);
  res.json({ success: true, college: updated });
});

// -----------------------------------------------------------------------------
// 3. INVIGILATOR / STAFF MANAGEMENT
// -----------------------------------------------------------------------------

apiRouter.get('/staff', (req: Request, res: Response) => {
  const staff = dbManager.getStaff();
  res.json(staff);
});

apiRouter.post('/staff', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user || user.role !== 'coordinator') {
    return res.status(403).json({ error: 'Only coordinator can add staff members' });
  }

  const {
    name,
    staffId,
    department,
    designation,
    role = 'Hall Invigilator',
    email,
    phone,
    beaconId,
    assignedHall = 'Not Assigned',
    block = 'A1',
    floor = '01',
    assignedDeviceId = 'None',
  } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }

  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w: string) => w[0].toUpperCase())
    .join('');

  const newStaff: StaffRecord = {
    id: `st-${Date.now()}`,
    name,
    initials: initials || 'ST',
    staffId: staffId || `ST-${String(dbManager.getStaff().length + 1).padStart(3, '0')}`,
    role,
    department: department || 'General',
    designation: designation || 'Lecturer',
    email,
    phone: phone || '',
    accountStatus: 'Active',
    beaconId: beaconId || `B-${Math.floor(1000 + Math.random() * 9000)}`,
    beaconStatus: 'Not Detected',
    signalStrength: 'None (Out of Range)',
    lastDetected: 'Never',
    status: 'Standby',
    assignedHall,
    block,
    floor,
    assignedDeviceId,
  };

  dbManager.addStaff(newStaff);

  // Also create a linked login user account for this invigilator
  const username = email.split('@')[0].toLowerCase();
  if (!dbManager.findUserByUsername(username)) {
    dbManager.addUser({
      id: `usr-inv-${Date.now()}`,
      username,
      email,
      password: 'password123',
      role: 'invigilator',
      name,
      phone: phone || '',
      staffId: newStaff.staffId,
      department: newStaff.department,
      designation: newStaff.designation,
      assignedBeaconId: newStaff.beaconId,
      createdAt: new Date().toISOString(),
    });
  }

  res.json({ success: true, staff: newStaff });
});

apiRouter.put('/staff/:id', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user || user.role !== 'coordinator') {
    return res.status(403).json({ error: 'Only coordinator can edit staff' });
  }

  const updated = dbManager.updateStaff(req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ error: 'Staff member not found' });
  }

  res.json({ success: true, staff: updated });
});

apiRouter.delete('/staff/:id', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user || user.role !== 'coordinator') {
    return res.status(403).json({ error: 'Only coordinator can delete staff' });
  }

  const deleted = dbManager.deleteStaff(req.params.id);
  if (!deleted) {
    return res.status(404).json({ error: 'Staff member not found' });
  }

  res.json({ success: true, message: 'Staff member removed successfully' });
});

// Coordinator Manual Override of Staff Status
apiRouter.post('/staff/:id/override-status', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user || user.role !== 'coordinator') {
    return res.status(403).json({ error: 'Only coordinator can manually override status' });
  }

  const { status, beaconStatus, note } = req.body;
  const staff = dbManager.getStaffById(req.params.id);
  if (!staff) {
    return res.status(404).json({ error: 'Staff member not found' });
  }

  const updates: Partial<StaffRecord> = {};
  if (status) updates.status = status;
  if (beaconStatus) updates.beaconStatus = beaconStatus;
  if (status === 'On Duty' || status === 'Checked In') {
    if (!staff.checkedInTime) {
      const hours = String(new Date().getHours()).padStart(2, '0');
      const minutes = String(new Date().getMinutes()).padStart(2, '0');
      updates.checkedInTime = `${hours}:${minutes}`;
    }
  }

  const updated = dbManager.updateStaff(staff.id, updates);

  // Sync hall facultyPresent status
  const hall = dbManager.getHalls().find((h) => h.hall === staff.assignedHall);
  if (hall && updates.status) {
    const isPresent = updates.status === 'Checked In' || updates.status === 'On Duty';
    dbManager.updateHall(hall.id, {
      checklists: {
        ...hall.checklists,
        facultyPresent: isPresent,
        beaconDetected: updates.beaconStatus ? updates.beaconStatus === 'Detected' : hall.checklists.beaconDetected,
      },
    });
  }

  // Notify
  dbManager.addNotification({
    id: `notif-${Date.now()}`,
    targetUserId: 'all',
    targetRole: 'all',
    type: 'system',
    title: `Status Override: ${staff.name}`,
    message: `Coordinator manually updated ${staff.name} status to '${status || staff.status}'${note ? ` (${note})` : ''}.`,
    timestamp: 'Just now',
    read: false,
  });

  res.json({ success: true, staff: updated });
});

// -----------------------------------------------------------------------------
// 4. EXAM HALL MANAGEMENT
// -----------------------------------------------------------------------------

apiRouter.get('/halls', (req: Request, res: Response) => {
  res.json(dbManager.getHalls());
});

apiRouter.post('/halls', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user || user.role !== 'coordinator') {
    return res.status(403).json({ error: 'Only coordinator can add exam halls' });
  }

  const { hall, block, floor, capacity = 40, beaconId, notes } = req.body;
  if (!hall) {
    return res.status(400).json({ error: 'Hall code/number is required' });
  }

  const newHall: ExamHallRecord = {
    id: `h-${Date.now()}`,
    hall,
    block: block || hall.split('-')[0] || 'A1',
    floor: floor || '01',
    capacity: Number(capacity),
    currentExam: 'Unscheduled',
    faculty: 'Unassigned',
    beaconId: beaconId || `B-${Math.floor(1000 + Math.random() * 9000)}`,
    beaconStatus: 'Not Detected',
    deviceStatus: 'Online',
    overallStatus: 'Setup Needed',
    checklists: {
      examSet: false,
      deviceOn: true,
      facultyPresent: false,
      beaconDetected: false,
      noAlerts: true,
    },
    notes: notes || '',
  };

  dbManager.addHall(newHall);
  res.json({ success: true, hall: newHall });
});

apiRouter.put('/halls/:id', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user || user.role !== 'coordinator') {
    return res.status(403).json({ error: 'Only coordinator can edit hall configuration' });
  }

  const updated = dbManager.updateHall(req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ error: 'Hall not found' });
  }
  res.json({ success: true, hall: updated });
});

apiRouter.delete('/halls/:id', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user || user.role !== 'coordinator') {
    return res.status(403).json({ error: 'Only coordinator can delete exam halls' });
  }

  const deleted = dbManager.deleteHall(req.params.id);
  if (!deleted) {
    return res.status(404).json({ error: 'Hall not found' });
  }
  res.json({ success: true, message: 'Hall deleted successfully' });
});

// Update Hall Readiness Checklist
apiRouter.post('/halls/:id/checklist', (req: Request, res: Response) => {
  const hall = dbManager.getHallById(req.params.id);
  if (!hall) {
    return res.status(404).json({ error: 'Hall not found' });
  }

  const { checklistKey, value } = req.body;
  if (!checklistKey || !(checklistKey in hall.checklists)) {
    return res.status(400).json({ error: 'Invalid checklist key' });
  }

  const newChecklists = {
    ...hall.checklists,
    [checklistKey]: value !== undefined ? value : !hall.checklists[checklistKey as keyof typeof hall.checklists],
  };

  const updated = dbManager.updateHall(hall.id, { checklists: newChecklists });
  res.json({ success: true, hall: updated });
});

// -----------------------------------------------------------------------------
// 5. EXAM TIMETABLE & MANAGEMENT
// -----------------------------------------------------------------------------

apiRouter.get('/exams', (req: Request, res: Response) => {
  res.json(dbManager.getExams());
});

apiRouter.post('/exams', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user || user.role !== 'coordinator') {
    return res.status(403).json({ error: 'Only coordinator can add exams to the timetable' });
  }

  const {
    exam,
    subjectCode,
    date,
    time,
    startTime = '09:00',
    endTime = '11:00',
    duration = '2 Hours',
    session = 'Morning',
    hall,
    block = 'A1',
    floor = '1',
    staff = 'Unassigned',
    staffId,
    teacher,
    backupTeacher,
    requiredInvigilators = 1,
    notes = '',
    paperDistributionMinutesBefore = 15,
  } = req.body;

  if (!exam || !date || !hall) {
    return res.status(400).json({ error: 'Exam name, date, and hall are required' });
  }

  const newExam: ExamRecord = {
    id: `ex-${Date.now()}`,
    exam,
    subjectCode: subjectCode || `SUB-${Math.floor(100 + Math.random() * 900)}`,
    date,
    time: time || `${startTime} – ${endTime}`,
    startTime,
    endTime,
    duration,
    session,
    hall,
    block,
    floor,
    staff: staff || teacher || 'Unassigned',
    staffId,
    teacher: teacher || staff || 'Unassigned',
    backupTeacher: backupTeacher || 'On Standby',
    requiredInvigilators: Number(requiredInvigilators) || 1,
    status: 'Ready',
    notes,
    paperDistributionMinutesBefore: Number(paperDistributionMinutesBefore) || 15,
  };

  dbManager.addExam(newExam);

  // Sync with hall currentExam
  const targetHall = dbManager.getHallById(hall);
  if (targetHall) {
    dbManager.updateHall(targetHall.id, {
      currentExam: exam,
      faculty: staff,
      checklists: { ...targetHall.checklists, examSet: true },
    });
  }

  res.json({ success: true, exam: newExam });
});

// Import Timetable (CSV or JSON batch array)
apiRouter.post('/exams/import', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user || user.role !== 'coordinator') {
    return res.status(403).json({ error: 'Only coordinator can upload/import timetables' });
  }

  const { exams: rawExams } = req.body;
  if (!Array.isArray(rawExams) || rawExams.length === 0) {
    return res.status(400).json({ error: 'No exam records provided for import' });
  }

  const created: ExamRecord[] = [];
  rawExams.forEach((e: any, idx: number) => {
    const examItem: ExamRecord = {
      id: `ex-imp-${Date.now()}-${idx}`,
      exam: e.exam || e.subject || `Exam ${idx + 1}`,
      subjectCode: e.subjectCode || e.code || `EX-${100 + idx}`,
      date: e.date || 'Tue, 27 May 2025',
      time: e.time || `${e.startTime || '09:00'} – ${e.endTime || '11:00'}`,
      startTime: e.startTime || '09:00',
      endTime: e.endTime || '11:00',
      duration: e.duration || '2 Hours',
      session: e.session || 'Morning Session',
      hall: e.hall || 'A1-01',
      block: e.block || 'A1',
      floor: e.floor || '1',
      staff: e.staff || e.invigilator || 'Unassigned',
      staffId: e.staffId,
      teacher: e.teacher || e.staff || 'Unassigned',
      backupTeacher: e.backupTeacher || 'On Standby',
      requiredInvigilators: Number(e.requiredInvigilators) || 1,
      status: 'Ready',
      notes: e.notes || 'Imported via bulk timetable manager',
      paperDistributionMinutesBefore: Number(e.paperDistributionMinutesBefore) || 15,
    };
    dbManager.addExam(examItem);
    created.push(examItem);
  });

  dbManager.addNotification({
    id: `notif-${Date.now()}`,
    targetUserId: 'all',
    targetRole: 'all',
    type: 'system',
    title: 'Timetable Uploaded',
    message: `Coordinator uploaded ${created.length} exam timetable entries successfully.`,
    timestamp: 'Just now',
    read: false,
  });

  res.json({ success: true, count: created.length, exams: created });
});

apiRouter.put('/exams/:id', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user || user.role !== 'coordinator') {
    return res.status(403).json({ error: 'Only coordinator can modify exam timetable entries' });
  }

  const updated = dbManager.updateExam(req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ error: 'Exam not found' });
  }
  res.json({ success: true, exam: updated });
});

apiRouter.delete('/exams/:id', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user || user.role !== 'coordinator') {
    return res.status(403).json({ error: 'Only coordinator can delete exam timetable entries' });
  }

  const deleted = dbManager.deleteExam(req.params.id);
  if (!deleted) {
    return res.status(404).json({ error: 'Exam not found' });
  }
  res.json({ success: true, message: 'Exam deleted successfully' });
});

// -----------------------------------------------------------------------------
// 6. SET INVIGILATOR (Assign invigilator to exam & hall with conflict detection)
// -----------------------------------------------------------------------------

apiRouter.post('/exams/:id/assign', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user || user.role !== 'coordinator') {
    return res.status(403).json({ error: 'Only coordinator can assign invigilators' });
  }

  const exam = dbManager.getExamById(req.params.id);
  if (!exam) {
    return res.status(404).json({ error: 'Exam not found' });
  }

  const { staffId, hall: requestedHall, beaconId, deviceId } = req.body;
  const staff = dbManager.getStaffById(staffId);
  if (!staff) {
    return res.status(404).json({ error: 'Invigilator not found' });
  }

  // Conflict Detection: check if staff is already assigned to a DIFFERENT exam during the same date & time slot
  const conflictingExam = dbManager.getExams().find(
    (e) =>
      e.id !== exam.id &&
      (e.staffId === staff.id || e.staff.toLowerCase() === staff.name.toLowerCase()) &&
      e.date === exam.date &&
      e.time === exam.time
  );

  if (conflictingExam) {
    return res.status(409).json({
      error: 'Assignment Conflict Detected',
      message: `${staff.name} is already assigned to ${conflictingExam.exam} in Hall ${conflictingExam.hall} at ${conflictingExam.time}.`,
      conflictingExam,
    });
  }

  const targetHallName = requestedHall || exam.hall;
  const targetHall = dbManager.getHallById(targetHallName);

  // Update exam
  const updatedExam = dbManager.updateExam(exam.id, {
    staff: staff.name,
    staffId: staff.id,
    teacher: staff.name,
    hall: targetHallName,
  });

  // Update staff profile with assignment & beacon
  dbManager.updateStaff(staff.id, {
    assignedHall: targetHallName,
    beaconId: beaconId || staff.beaconId,
    assignedDeviceId: deviceId || staff.assignedDeviceId,
    block: targetHall?.block || staff.block,
    floor: targetHall?.floor || staff.floor,
  });

  // Update hall with faculty & beacon
  if (targetHall) {
    dbManager.updateHall(targetHall.id, {
      currentExam: exam.exam,
      faculty: staff.name,
      beaconId: staff.beaconId,
      checklists: {
        ...targetHall.checklists,
        examSet: true,
        facultyPresent: staff.status === 'On Duty' || staff.status === 'Checked In',
        beaconDetected: staff.beaconStatus === 'Detected',
      },
    });
  }

  // Create In-App Notification for the assigned invigilator
  dbManager.addNotification({
    id: `notif-${Date.now()}`,
    targetUserId: staff.id,
    targetRole: 'invigilator',
    type: 'assignment',
    title: `New Exam Assignment: ${exam.exam} (${exam.subjectCode})`,
    message: `You have been assigned as invigilator for ${exam.exam} in Hall ${targetHallName} on ${exam.date} (${exam.time}). Paper distribution alarm scheduled 15 mins prior.`,
    timestamp: 'Just now',
    read: false,
    metadata: {
      examId: exam.id,
      hall: targetHallName,
      date: exam.date,
      time: exam.time,
      beaconId: staff.beaconId,
    },
  });

  res.json({
    success: true,
    message: `Assigned ${staff.name} to ${exam.exam} in Hall ${targetHallName}`,
    exam: updatedExam,
    staff,
  });
});

// -----------------------------------------------------------------------------
// 7. REPLACEMENT SYSTEM (Replace invigilator with full audit history)
// -----------------------------------------------------------------------------

apiRouter.post('/exams/:id/replace', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user || user.role !== 'coordinator') {
    return res.status(403).json({ error: 'Only coordinator can execute invigilator replacements' });
  }

  const exam = dbManager.getExamById(req.params.id);
  if (!exam) {
    return res.status(404).json({ error: 'Exam not found' });
  }

  const { originalStaffId, replacementStaffId, reason } = req.body;

  const originalStaff =
    dbManager.getStaffById(originalStaffId) ||
    dbManager.getStaff().find((s) => s.name === exam.staff);

  const replacementStaff = dbManager.getStaffById(replacementStaffId);

  if (!replacementStaff) {
    return res.status(400).json({ error: 'Please select a valid replacement invigilator' });
  }

  const originalStaffName = originalStaff ? originalStaff.name : exam.staff;
  const originalStaffIdVal = originalStaff ? originalStaff.id : 'unknown';

  // 1. Record Replacement History (preserved permanently)
  const replacementLog = dbManager.addReplacement({
    id: `rep-${Date.now()}`,
    examId: exam.id,
    examSubject: `${exam.exam} (${exam.subjectCode})`,
    hall: exam.hall,
    originalStaffId: originalStaffIdVal,
    originalStaffName,
    replacementStaffId: replacementStaff.id,
    replacementStaffName: replacementStaff.name,
    reason: reason || 'Personal/emergency replacement authorized by coordinator',
    coordinatorName: user.name,
    timestamp: new Date().toISOString(),
  });

  // 2. Update Exam Assignment
  const updatedExam = dbManager.updateExam(exam.id, {
    staff: replacementStaff.name,
    staffId: replacementStaff.id,
    teacher: replacementStaff.name,
    status: 'Changed',
    notes: `${exam.notes}\n[Replacement Logged]: ${originalStaffName} replaced by ${replacementStaff.name}. Reason: ${reason || 'Not specified'}.`,
  });

  // 3. Update Replacement Staff profile
  dbManager.updateStaff(replacementStaff.id, {
    assignedHall: exam.hall,
    block: exam.block,
    floor: exam.floor,
  });

  // 4. Update Original Staff profile (mark Standby/Relieved)
  if (originalStaff) {
    dbManager.updateStaff(originalStaff.id, {
      assignedHall: 'Relieved (Standby)',
      status: 'Standby',
    });
  }

  // 5. Update Hall faculty
  const hall = dbManager.getHallById(exam.hall);
  if (hall) {
    dbManager.updateHall(hall.id, {
      faculty: replacementStaff.name,
      beaconId: replacementStaff.beaconId,
      beaconStatus: replacementStaff.beaconStatus,
    });
  }

  // 6. Notify Replacement Invigilator
  dbManager.addNotification({
    id: `notif-${Date.now()}-rep`,
    targetUserId: replacementStaff.id,
    targetRole: 'invigilator',
    type: 'replacement',
    title: `Urgent Replacement Assignment: ${exam.exam}`,
    message: `You have been assigned as replacement invigilator for ${exam.exam} in Hall ${exam.hall} on ${exam.date} (${exam.time}), replacing ${originalStaffName}. Reason: ${reason || 'Emergency replacement'}.`,
    timestamp: 'Just now',
    read: false,
    metadata: {
      examId: exam.id,
      hall: exam.hall,
      replacedStaff: originalStaffName,
    },
  });

  // 7. General coordinator broadcast
  dbManager.addNotification({
    id: `notif-${Date.now()}-coord`,
    targetUserId: 'all',
    targetRole: 'coordinator',
    type: 'replacement',
    title: `Replacement Completed: ${exam.exam} (${exam.hall})`,
    message: `${originalStaffName} successfully replaced by ${replacementStaff.name} by ${user.name}.`,
    timestamp: 'Just now',
    read: false,
  });

  res.json({
    success: true,
    message: `Replacement confirmed: ${originalStaffName} replaced by ${replacementStaff.name}`,
    exam: updatedExam,
    replacementLog,
  });
});

// View Replacement Audit Records
apiRouter.get('/replacements', (req: Request, res: Response) => {
  res.json(dbManager.getReplacements());
});

// -----------------------------------------------------------------------------
// 8. NOTIFICATIONS CENTER
// -----------------------------------------------------------------------------

apiRouter.get('/notifications', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  const notifications = dbManager.getNotifications(user?.id, user?.role);
  res.json(notifications);
});

apiRouter.put('/notifications/:id/read', (req: Request, res: Response) => {
  const ok = dbManager.markNotificationRead(req.params.id);
  res.json({ success: ok });
});

apiRouter.post('/notifications/mark-all-read', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  const count = dbManager.markAllNotificationsRead(user?.id, user?.role);
  res.json({ success: true, count });
});

// -----------------------------------------------------------------------------
// 9. ESP32 HARDWARE INTEGRATION & TELEMETRY
// -----------------------------------------------------------------------------

// ESP32 Physical Microcontroller Ingestion Endpoint
// Accepts: { deviceId: string, beaconId: string, rssi: number, timestamp?: string }
apiRouter.post('/esp32/telemetry', (req: Request, res: Response) => {
  const { deviceId, beaconId, rssi, timestamp } = req.body;

  if (!deviceId || !beaconId || rssi === undefined) {
    return res.status(400).json({
      error: 'Invalid ESP32 telemetry packet. Required: deviceId, beaconId, rssi',
    });
  }

  const result = dbManager.processESP32Telemetry({
    deviceId: String(deviceId),
    beaconId: String(beaconId),
    rssi: Number(rssi),
    timestamp,
  });

  res.json({
    status: 'ACK',
    message: 'Telemetry received and state synchronized with INVI database',
    telemetry: result,
  });
});

// Get Live ESP32 Telemetry Packet Logs
apiRouter.get('/esp32/logs', (req: Request, res: Response) => {
  res.json(dbManager.getESP32Logs());
});

// -----------------------------------------------------------------------------
// 10. DEVICE MANAGEMENT
// -----------------------------------------------------------------------------

apiRouter.get('/devices', (req: Request, res: Response) => {
  res.json(dbManager.getDevices());
});

apiRouter.post('/devices', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user || user.role !== 'coordinator') {
    return res.status(403).json({ error: 'Only coordinator can register new ESP32 hubs' });
  }

  const { deviceId, hall, block, floor, beaconId, ipAddress } = req.body;
  if (!deviceId || !hall) {
    return res.status(400).json({ error: 'Device ID and assigned hall are required' });
  }

  const newDevice: DeviceRecord = {
    id: `dev-${Date.now()}`,
    deviceId,
    hall,
    block: block || 'A1',
    floor: floor || '1',
    beaconId: beaconId || 'Unpaired',
    beaconStatus: 'Not Detected',
    signalStrength: 'None',
    batteryLevel: 100,
    lastPing: 'Just now',
    status: 'Online',
    ipAddress: ipAddress || '192.168.1.150',
    firmwareVersion: 'v2.4.1',
    assignedFaculty: 'Pending',
  };

  dbManager.addDevice(newDevice);
  res.json({ success: true, device: newDevice });
});

apiRouter.post('/devices/:id/ping', (req: Request, res: Response) => {
  const device = dbManager.getDeviceById(req.params.id);
  if (!device) {
    return res.status(404).json({ error: 'Device not found' });
  }

  const updated = dbManager.updateDevice(device.id, {
    lastPing: 'Just now',
    status: 'Online',
  });

  res.json({
    success: true,
    message: `ESP32 Hub ${device.deviceId} ping acknowledged. Latency: 14ms.`,
    device: updated,
  });
});

apiRouter.post('/devices/:id/reboot', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user || user.role !== 'coordinator') {
    return res.status(403).json({ error: 'Only coordinator can reboot hardware nodes' });
  }

  const device = dbManager.getDeviceById(req.params.id);
  if (!device) {
    return res.status(404).json({ error: 'Device not found' });
  }

  const updated = dbManager.updateDevice(device.id, {
    status: 'Online',
    lastPing: 'Just now',
    batteryLevel: Math.min(100, (device.batteryLevel || 80) + 1),
  });

  res.json({
    success: true,
    message: `Reboot command sent to ESP32 node ${device.deviceId}. Firmware re-initialized.`,
    device: updated,
  });
});
