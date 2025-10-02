import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AddBook = () => {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [description, setDescription] = useState('');
  const [genre, setGenre] = useState('');
  const [year, setYear] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await axios.post('/api/books', { title, author, description, genre, year: Number(year) });
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add book');
    }
  };

  return (
    <div className="container">
      <h2 className="page-title">Add New Book</h2>
      <form onSubmit={handleSubmit} className="form">
        <div className="form-group">
          <label>Title</label>
          <input type="text" value={title} onChange={e => setTitle(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Author</label>
          <input type="text" value={author} onChange={e => setAuthor(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Description</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Genre</label>
          <input type="text" value={genre} onChange={e => setGenre(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Published Year</label>
          <input type="number" value={year} onChange={e => setYear(e.target.value)} required />
        </div>
        {error && <p className="error">{error}</p>}
        <button type="submit" className="btn btn-primary">Add Book</button>
      </form>
    </div>
  );
};

export default AddBook;
