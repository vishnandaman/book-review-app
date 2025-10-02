import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const EditBook = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [description, setDescription] = useState('');
  const [genre, setGenre] = useState('');
  const [year, setYear] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await axios.get(`/api/books/${id}`);
        const b = res.data.book;
        setTitle(b.title);
        setAuthor(b.author);
        setDescription(b.description);
        setGenre(b.genre);
        setYear(String(b.year));
      } catch (e) {
        setError(e.response?.data?.message || 'Failed to load book');
      }
    };
    load();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await axios.put(`/api/books/${id}`, { title, author, description, genre, year: Number(year) });
      navigate(`/book/${id}`);
    } catch (e) {
      setError(e.response?.data?.message || 'Update failed');
    }
  };

  return (
    <div className="container">
      <h2 className="page-title">Edit Book</h2>
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
        <button type="submit" className="btn btn-primary">Save</button>
      </form>
    </div>
  );
};

export default EditBook;


