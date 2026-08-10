import React, { useState, useEffect } from 'react';

const emptyForm = {
  firstName: '', lastName: '', email: '', course: '',
  dateOfBirth: '', phoneNumber: '', gpa: ''
};

function StudentForm({ onSubmit, editingStudent, onCancel }) {
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (editingStudent) {
      setForm({
        firstName: editingStudent.firstName || '',
        lastName: editingStudent.lastName || '',
        email: editingStudent.email || '',
        course: editingStudent.course || '',
        dateOfBirth: editingStudent.dateOfBirth || '',
        phoneNumber: editingStudent.phoneNumber || '',
        gpa: editingStudent.gpa ?? ''
      });
    } else {
      setForm(emptyForm);
    }
  }, [editingStudent]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ ...form, gpa: parseFloat(form.gpa) });
    setForm(emptyForm);
  };

  return (
    <form className="student-form" onSubmit={handleSubmit}>
      <h3>{editingStudent ? 'Edit Student' : 'Add New Student'}</h3>
      <div className="form-grid">
        <input name="firstName" placeholder="First Name" value={form.firstName} onChange={handleChange} required />
        <input name="lastName" placeholder="Last Name" value={form.lastName} onChange={handleChange} required />
        <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required />
        <input name="course" placeholder="Course" value={form.course} onChange={handleChange} required />
        <input name="dateOfBirth" type="date" value={form.dateOfBirth} onChange={handleChange} />
        <input name="phoneNumber" placeholder="Phone Number" value={form.phoneNumber} onChange={handleChange} />
        <input name="gpa" type="number" step="0.01" min="0" max="10" placeholder="GPA" value={form.gpa} onChange={handleChange} required />
      </div>
      <div className="form-actions">
        <button type="submit">{editingStudent ? 'Update' : 'Add'} Student</button>
        {editingStudent && <button type="button" onClick={onCancel}>Cancel</button>}
      </div>
    </form>
  );
}

export default StudentForm;
