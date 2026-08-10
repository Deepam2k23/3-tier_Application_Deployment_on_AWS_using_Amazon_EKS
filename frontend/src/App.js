import React, { useState, useEffect, useCallback } from 'react';
import StudentForm from './components/StudentForm';
import StudentList from './components/StudentList';
import * as studentApi from './api/studentApi';
import './App.css';

function App() {
  const [students, setStudents] = useState([]);
  const [editingStudent, setEditingStudent] = useState(null);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const loadStudents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await studentApi.getAllStudents();
      setStudents(res.data);
      setError('');
    } catch (err) {
      setError('Could not reach the backend service. Is it running?');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadStudents(); }, [loadStudents]);

  const handleAddOrUpdate = async (student) => {
    try {
      if (editingStudent) {
        await studentApi.updateStudent(editingStudent.id, student);
        setEditingStudent(null);
      } else {
        await studentApi.createStudent(student);
      }
      loadStudents();
    } catch (err) {
      setError('Save failed. Check the form fields and try again.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this student?')) return;
    try {
      await studentApi.deleteStudent(id);
      loadStudents();
    } catch (err) {
      setError('Delete failed.');
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!search.trim()) return loadStudents();
    try {
      const res = await studentApi.searchStudents(search.trim());
      setStudents(res.data);
    } catch (err) {
      setError('Search failed.');
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Student Management System</h1>
        <p className="subtitle">3-Tier App &middot; React &middot; Spring Boot &middot; MySQL &middot; AWS EKS</p>
      </header>

      {error && <div className="error-banner">{error}</div>}

      <form className="search-bar" onSubmit={handleSearch}>
        <input
          placeholder="Search by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button type="submit">Search</button>
        <button type="button" onClick={() => { setSearch(''); loadStudents(); }}>Reset</button>
      </form>

      <StudentForm
        onSubmit={handleAddOrUpdate}
        editingStudent={editingStudent}
        onCancel={() => setEditingStudent(null)}
      />

      {loading ? (
        <p>Loading students...</p>
      ) : (
        <StudentList students={students} onEdit={setEditingStudent} onDelete={handleDelete} />
      )}
    </div>
  );
}

export default App;
