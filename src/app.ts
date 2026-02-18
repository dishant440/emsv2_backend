import express from 'express';
import cors from 'cors';

import { errorHandler } from './middleware/errorHandler';

// Route imports
import authRoutes from './modules/auth/auth.routes';
import adminRoutes from './modules/admin/admin.routes';
import employeeRoutes from './modules/employee/employee.routes';
import leaveRoutes from './modules/leave/leave.routes';
import holidayRoutes from './modules/holiday/holiday.routes';
import attendanceRoutes from './modules/attendance/attendance.routes';
import notificationRoutes from './modules/notification/notification.routes';

const app = express();

// ── Global Middleware ──
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// ── Health Check ──
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── API Routes ──
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/employee', employeeRoutes);
app.use('/api/leave', leaveRoutes);
app.use('/api/holidays', holidayRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/notifications', notificationRoutes);

// ── Global Error Handler ──
app.use(errorHandler);

export default app;
