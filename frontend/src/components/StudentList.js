import React from 'react';

function StudentList({ students, onEdit, onDelete }) {
  if (!students.length) {
    return <p className="empty-state">No students found. Add one above.</p>;
  }

  return (
    <table className="student-table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Email</th>
          <th>Course</th>
          <th>GPA</th>
          <th>Phone</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {students.map((s) => (
          <tr key={s.id}>
            <td>{s.firstName} {s.lastName}</td>
            <td>{s.email}</td>
            <td>{s.course}</td>
            <td>{s.gpa}</td>
            <td>{s.phoneNumber}</td>
            <td>
              <button onClick={() => onEdit(s)}>Edit</button>
              <button className="danger" onClick={() => onDelete(s.id)}>Delete</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default StudentList;
