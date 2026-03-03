# UI Modernization Integration Guide

This guide shows how to integrate the new UI components into existing pages.

## Quick Reference: Component Usage

### 1. Toast Notifications (Replace all alerts)

**Import:**
```javascript
import { useToast } from '../components/Toast';
```

**Inside component:**
```javascript
const { toast } = useToast();

// Usage:
toast.success('Student registered successfully');
toast.error('Failed to save student');
toast.info('Loading data...');
toast.warning('This action cannot be undone');
```

**Replace all these:**
```javascript
// ❌ OLD
alert('Success!');
alert('Error: ' + err.message);

// ✅ NEW
toast.success('Success!');
toast.error('Error: ' + err.message);
```

---

### 2. Loading States (While fetching data)

**Import:**
```javascript
import SkeletonTable from '../components/SkeletonTable';
```

**Usage:**
```javascript
const [loading, setLoading] = useState(false);

useEffect(() => {
  setLoading(true);
  api.get('/endpoint').then(r => {
    setData(r.data);
    setLoading(false);
  });
}, []);

return (
  <>
    {loading ? (
      <SkeletonTable rows={10} columns={5} />
    ) : (
      // Your table content
    )}
  </>
);
```

---

### 3. Empty States (When no data exists)

**Import:**
```javascript
import EmptyState from '../components/EmptyState';
```

**Usage:**
```javascript
{data.length === 0 && !loading ? (
  <EmptyState
    icon="📚"
    title="No courses yet"
    message="Enroll in a course or wait for your teacher to add you"
    action={canCreate ? () => setShowModal(true) : null}
    actionLabel="Create Course"
  />
) : (
  // Your list content
)}
```

---

### 4. Confirmation Dialogs (Before delete/dangerous actions)

**Import:**
```javascript
import ConfirmDialog from '../components/ConfirmDialog';
```

**Usage:**
```javascript
const [deleteItem, setDeleteItem] = useState(null);

return (
  <>
    <button onClick={() => setDeleteItem(student)}>Delete</button>

    <ConfirmDialog
      isOpen={!!deleteItem}
      title="Delete Student?"
      message={`Are you sure you want to delete ${deleteItem?.first_name}? This cannot be undone.`}
      onConfirm={async () => {
        await api.delete(`/students/${deleteItem.id}`);
        toast.success('Student deleted');
        setDeleteItem(null);
        reload();
      }}
      onCancel={() => setDeleteItem(null)}
      confirmLabel="Delete"
      cancelLabel="Cancel"
      isDangerous={true}
    />
  </>
);
```

---

### 5. Responsive Tables

**Wrap your table in a div with overflow:**
```javascript
<div style={{ overflowX: 'auto' }}>
  <table style={{ width: '100%' }}>
    {/* Your table content */}
  </table>
</div>
```

---

### 6. Form Validation (Inline error messages)

**Pattern for handling validation errors from backend:**
```javascript
const [formErrors, setFormErrors] = useState({});

const save = async () => {
  setFormErrors({});
  try {
    await api.post('/students', form);
    toast.success('Student registered');
  } catch (err) {
    if (err.response?.status === 400 && err.response?.data?.details) {
      // Backend returned field errors
      const errors = {};
      err.response.data.details.forEach(e => {
        errors[e.field] = e.message;
      });
      setFormErrors(errors);
    } else {
      toast.error(err.response?.data?.error || 'Failed to save');
    }
  }
};

// In your form field:
<input value={form.firstName} onChange={e => setForm(prev => ({ ...prev, firstName: e.target.value }))} />
{formErrors.firstName && (
  <div style={{ color: 'var(--color-danger)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
    {formErrors.firstName}
  </div>
)}
```

---

## Step-by-Step: Modernizing a Page

### Example: Students.jsx (Before → After)

#### Step 1: Add Imports
```javascript
// Add these to top of file
import { useToast } from '../components/Toast';
import SkeletonTable from '../components/SkeletonTable';
import EmptyState from '../components/EmptyState';
import ConfirmDialog from '../components/ConfirmDialog';
```

#### Step 2: Initialize State & Toast
```javascript
const { toast } = useToast();
const [loading, setLoading] = useState(false);
const [deleteStudent, setDeleteStudent] = useState(null);
const [formErrors, setFormErrors] = useState({});
```

#### Step 3: Update Load Function
```javascript
const load = (p = page, cls = classFilter) => {
  setLoading(true);
  const params = new URLSearchParams({ page: p, limit });
  if (cls) params.append('class_level', cls);
  api.get(`/students?${params}`)
    .then(r => {
      const d = r.data;
      setStudents(Array.isArray(d) ? d : d?.students || []);
      setTotal(d?.total || 0);
    })
    .catch(err => {
      toast.error('Failed to load students');
      setStudents([]);
      setTotal(0);
    })
    .finally(() => setLoading(false));
};
```

#### Step 4: Update Save Function
```javascript
const save = async () => {
  setFormErrors({});
  
  // Client-side validation
  if (!editStudent && (!form.firstName || !form.lastName || !form.email)) {
    setFormErrors({
      firstName: !form.firstName ? 'First name required' : '',
      lastName: !form.lastName ? 'Last name required' : '',
      email: !form.email ? 'Email required' : '',
    });
    return;
  }

  setSaving(true);
  try {
    if (editStudent) {
      await api.put(`/students/${editStudent.id}`, {
        class_level: form.class_level,
        section: form.section,
        // ... other fields
      });
    } else {
      await api.post('/students', {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        password: form.password || 'password123',
        // ... other fields
      });
    }
    toast.success(editStudent ? 'Student updated' : 'Student registered successfully');
    setShowModal(false);
    load(page, classFilter);
  } catch (err) {
    if (err.response?.status === 400 && err.response?.data?.details) {
      // Convert field errors to map
      const errors = {};
      err.response.data.details.forEach(e => {
        errors[e.field] = e.message;
      });
      setFormErrors(errors);
    } else {
      toast.error(err.response?.data?.error || 'Failed to save student');
    }
  } finally {
    setSaving(false);
  }
};
```

#### Step 5: Update Delete Handler
```javascript
const confirmDelete = async () => {
  setDeleting(true);
  try {
    await api.delete(`/students/${deleteStudent.id}`);
    toast.success('Student deleted');
    setDeleteStudent(null);
    load(1, classFilter);
    setPage(1);
  } catch (err) {
    toast.error(err.response?.data?.error || 'Failed to delete');
  } finally {
    setDeleting(false);
  }
};
```

#### Step 6: Update Render - Add Loading
```javascript
// After the header, before filters:
{loading && <SkeletonTable rows={8} columns={5} />}
{!loading && students.length === 0 && (
  <EmptyState
    icon="👥"
    title="No students yet"
    message="Register students to get started"
    action={canManage ? openCreate : null}
    actionLabel="Register Student"
  />
)}
{!loading && students.length > 0 && (
  // Your existing table code
)}
```

#### Step 7: Update Render - Add Confirmation Dialog
```javascript
// At bottom of JSX return:
<ConfirmDialog
  isOpen={!!deleteStudent}
  title="Delete Student?"
  message={`Remove ${deleteStudent?.first_name} ${deleteStudent?.last_name}? This cannot be undone.`}
  onConfirm={confirmDelete}
  onCancel={() => setDeleteStudent(null)}
  confirmLabel="Delete"
  isDangerous={true}
/>
```

#### Step 8: Update Render - Add Form Errors
```javascript
// In your form modal, for each input:
<input
  style={{
    ...s.input,
    borderColor: formErrors.firstName ? 'var(--color-danger)' : 'var(--color-border)',
  }}
  value={form.firstName}
  onChange={e => setForm(prev => ({ ...prev, firstName: e.target.value }))}
/>
{formErrors.firstName && (
  <div style={{ color: 'var(--color-danger)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
    {formErrors.firstName}
  </div>
)}
```

#### Step 9: Wrap Table in Responsive Div
```javascript
<div style={{ overflowX: 'auto' }}>
  <table style={s.table}>
    {/* existing table code */}
  </table>
</div>
```

---

## Apply to All Pages - Quick Checklist

For each page (/frontend/src/pages/):

- [ ] Import Toast, SkeletonTable, EmptyState, ConfirmDialog
- [ ] Replace all alert() with toast notifications
- [ ] Add loading skeleton while fetching
- [ ] Show empty state when list is empty
- [ ] Add confirm dialog for delete/remove actions
- [ ] Add form validation errors display
- [ ] Wrap tables with overflow-x: auto div

---

## Backend Validation Integration

All routes now validate input using express-validator. Errors returned in format:
```json
{
  "error": "Validation failed",
  "details": [
    { "field": "email", "message": "Valid email required" },
    { "field": "firstName", "message": "First name required" }
  ]
}
```

Frontend interceptor should handle 400 errors and extract field-level errors from `details` array.

---

## Common Toast Usage Patterns

```javascript
// On success
toast.success('Action completed successfully');

// On error with API response
toast.error(err.response?.data?.error || 'Operation failed');

// Info message
toast.info('Processing... please wait');

// Warning
toast.warning('This will delete all associated records');

// With custom duration (milliseconds, 0 = no auto-close)
toast.success('Saved!', 2000);
toast.error('Error!', 5000);
```

---

## Testing Your Changes

1. **Toast**: Click buttons, verify notifications appear in top-right with correct color
2. **Skeleton**: Click to open a list, verify loading animation shows while fetching
3. **Empty State**: Create a new page/section with no data, verify message and button appear
4. **Confirm Dialog**: Try to delete, verify dialog appears, only confirms on "Delete" button
5. **Form Errors**: Submit empty form, verify field errors appear below inputs
6. **Responsive**: On mobile, verify table scrolls horizontally without breaking layout

