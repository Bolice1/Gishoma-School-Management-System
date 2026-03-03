# Backend Implementation Guide

## Input Validation System

### Overview
All POST/PUT endpoints now validate input using `express-validator`. Validation rules are defined in `/backend/src/validators/entityValidators.js` and applied via middleware.

### How It Works

1. **Validation Rules** are defined for each endpoint:
   ```javascript
   const createStudentRules = [
     body('firstName').trim().notEmpty().withMessage('First name is required'),
     body('email').isEmail().withMessage('Valid email is required'),
     // ... more rules
   ];
   ```

2. **Applied to Routes** via middleware chain:
   ```javascript
   router.post(
     '/',
     authorize('school_admin'),
     createStudentRules,        // ← Validation rules
     handleValidation,          // ← Error handler
     studentController.create
   );
   ```

3. **Errors Returned** in standard format:
   ```json
   {
     "error": "Validation failed",
     "details": [
       { "field": "email", "message": "Valid email required" },
       { "field": "firstName", "message": "First name is required" }
     ]
   }
   ```

### Integrated Routes

✅ **Students** - POST, PUT
✅ **Marks** - POST, BULK, DELETE
✅ **Attendance** - POST (bulk records)
✅ **Announcements** - POST
🟡 **Ready** - Fees, Payments, Disciplines, Teachers

### Available Validators

See `/backend/src/validators/entityValidators.js` for all available rules:

```javascript
// Common patterns:
body('field').notEmpty().withMessage('...')        // Required
body('field').isEmail()                            // Email format
body('field').isUUID()                             // UUID format
body('field').isISO8601()                          // Date format
body('field').isNumeric()                          // Number
body('field').isIn(['a', 'b'])                     // Enum
body('field').isLength({ min: 5, max: 100 })      // Length
body('field').trim()                               // Trim whitespace
body('field').optional()                           // Make optional
```

### Adding Validation to a New Endpoint

1. **Define rules** in `entityValidators.js`:
   ```javascript
   const createTeacherRules = [
     body('firstName').trim().notEmpty().withMessage('First name required'),
     body('email').isEmail().withMessage('Valid email required'),
     body('specialization').optional().trim(),
   ];
   ```

2. **Import and apply** in route:
   ```javascript
   const { createTeacherRules } = require('../validators/entityValidators');
   
   router.post(
     '/',
     authorize('school_admin'),
     createTeacherRules,
     handleValidation,
     teacherController.create
   );
   ```

3. **Update error handling** in controller (already done via middleware):
   ```javascript
   // Middleware catches validation errors before controller
   // Controller only receives valid data
   ```

---

## Activity Logging

### Overview
The `activityLogService` is available for logging important events. It records:
- User performing action
- School context
- Action type
- Resource affected
- Detailed information
- IP address and user agent

### Usage

```javascript
const activityLog = require('../services/activityLogService');

// In your controller:
await activityLog.log({
  userId: req.userId,
  schoolId: req.schoolId,
  action: 'student_created',
  resource: 'students',
  resourceId: studentId,
  details: { firstName, lastName, email },
  ipAddress: req.ip,
  userAgent: req.get('user-agent'),
});
```

### Recommended Integration Points

1. **Student Registration** - In `studentController.create()`:
   ```javascript
   await activityLog.log({
     userId: req.userId,
     schoolId: schoolId,
     action: 'student_registered',
     resource: 'students',
     resourceId: id,
     details: { firstName, lastName, studentId },
   });
   ```

2. **Mark Add/Remove** - In `markController.create()` and `remove()`:
   ```javascript
   // On create:
   await activityLog.log({
     userId: req.userId,
     schoolId: schoolId,
     action: 'mark_added',
     resource: 'marks',
     resourceId: id,
     details: { studentId, courseId, score },
   });
   
   // On remove:
   await activityLog.log({
     userId: req.userId,
     schoolId: schoolId,
     action: 'mark_removed',
     resource: 'marks',
     resourceId: id,
     details: { removalReason: reason },
   });
   ```

3. **Payment Recording** - In `feeController.recordPayment()`:
   ```javascript
   await activityLog.log({
     userId: req.userId,
     schoolId: schoolId,
     action: 'payment_recorded',
     resource: 'payments',
     resourceId: paymentId,
     details: { studentId, feeId, amount, method: paymentMethod },
   });
   ```

4. **Discipline Case** - In `disciplineController.create()`:
   ```javascript
   await activityLog.log({
     userId: req.userId,
     schoolId: schoolId,
     action: 'discipline_case_created',
     resource: 'disciplines',
     resourceId: id,
     details: { studentId, type, description },
   });
   ```

5. **Announcement Posted** - In `announcementController.create()`:
   ```javascript
   await activityLog.log({
     userId: req.userId,
     schoolId: schoolId,
     action: 'announcement_posted',
     resource: 'announcements',
     resourceId: id,
     details: { title, priority, targetRole },
   });
   ```

---

## Chat Message Security & Rate Limiting

### Location
`/backend/src/controllers/chatController.js`

### Requirements
1. **Message Sanitization** - Strip HTML tags to prevent XSS
2. **Rate Limiting** - Max 1 message per 2 seconds per user
3. **Length Limit** - Max 1000 characters

### Implementation

```javascript
const chatController = {
  async sendMessage(req, res, next) {
    try {
      const { message, roomId } = req.body;
      const userId = req.userId;
      
      // 1. LENGTH VALIDATION
      if (!message || message.length === 0 || message.length > 1000) {
        return res.status(400).json({ 
          error: 'Message must be 1-1000 characters' 
        });
      }
      
      // 2. RATE LIMITING
      // Check last message time for this user
      const lastMessage = await query(
        'SELECT created_at FROM chat_messages WHERE user_id = ? ORDER BY created_at DESC LIMIT 1',
        [userId]
      );
      
      if (lastMessage.length > 0) {
        const timeSinceLastMsg = (Date.now() - new Date(lastMessage[0].created_at)) / 1000;
        if (timeSinceLastMsg < 2) {
          return res.status(429).json({ 
            error: 'Please wait before sending another message' 
          });
        }
      }
      
      // 3. SANITIZATION - Strip HTML tags
      const sanitized = message.replace(/<[^>]*>/g, '');
      
      // Rest of logic...
      const id = uuidv4();
      await query(
        `INSERT INTO chat_messages (id, user_id, room_id, content, created_at) 
         VALUES (?, ?, ?, ?, NOW())`,
        [id, userId, roomId, sanitized]
      );
      
      // Emit via socket.io...
      res.status(201).json({ id, message: sanitized, createdAt: new Date() });
    } catch (err) {
      next(err);
    }
  }
};
```

---

## Cascade Deletes - Status

### Verified ✅
When a **student** is deleted:
```
1. Delete from students table ✓
2. Delete from users table (foreign key delete) ✓
```

When a **teacher** is deleted:
- Check `teacherController.remove()` - needs same cascade pattern

### Implementation Pattern
```javascript
async function remove(req, res, next) {
  try {
    const { id } = req.params;
    
    // Get the user_id first
    const record = await query('SELECT user_id FROM [table] WHERE id = ?', [id]);
    if (!record[0]) return res.status(404).json({ error: 'Not found' });
    
    // Delete main record
    await query('DELETE FROM [table] WHERE id = ?', [id]);
    
    // Cascade delete user
    await query('DELETE FROM users WHERE id = ?', [record[0].user_id]);
    
    res.json({ message: 'Deleted' });
  } catch (err) {
    next(err);
  }
}
```

---

## Permissions & Access Control

### School Admin Can:
- Manage students, teachers, courses (in their school)
- Record attendance, marks
- Post announcements
- View all reports for their school

### Head Boy/Girl Can:
- Post announcements
- View their own grades/reports

### Teacher Can:
- Record marks, homework, exercises
- Post announcements
- View students in their courses

### Bursar Can:
- Manage fees and payments
- View payment reports

### Dean Can:
- Manage attendance, discipline
- View all marks
- Post announcements

---

## Common Patterns

### Check Multi-Tenancy
Always filter by `school_id`:
```javascript
const records = await query(
  'SELECT * FROM marks WHERE school_id = ? AND student_id = ?',
  [req.schoolId, studentId]
);
```

### Handle Validation Errors
Validation middleware catches errors, controller receives valid data:
```javascript
// Input is already validated - no need to check again
async function create(req, res, next) {
  // req.body.email is guaranteed valid email
  // req.body.firstName is guaranteed non-empty
  const { email, firstName } = req.body;
  // ... proceed with logic
}
```

### Log Important Changes
Always log significant operations:
```javascript
// After successful operation
const activityLog = require('../services/activityLogService');
await activityLog.log({
  userId: req.userId,
  schoolId: req.schoolId,
  action: 'action_name',
  resource: 'resource_type',
  resourceId: id,
  details: { /* relevant data */ },
});
```

---

## Testing Validation

Use curl or Postman:

```bash
# Test required field validation
curl -X POST http://localhost:5000/api/students \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
  
# Response:
# {
#   "error": "Validation failed",
#   "details": [
#     { "field": "firstName", "message": "First name is required" },
#     { "field": "lastName", "message": "Last name is required" }
#   ]
# }

# Test email validation
curl -X POST http://localhost:5000/api/students \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"firstName": "John", "lastName": "Doe", "email": "invalid-email"}'
  
# Response:
# {
#   "error": "Validation failed",
#   "details": [
#     { "field": "email", "message": "Valid email is required" }
#   ]
# }
```

