import React, { useEffect, useMemo, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const BookDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [editingReviewId, setEditingReviewId] = useState('');
  const [editingText, setEditingText] = useState('');
  const [editingRating, setEditingRating] = useState(5);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/books/${id}`);
      setBook(res.data.book);
      setReviews(res.data.reviews);
      setAvgRating(Number(res.data.avgRating));
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to load book');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const ratingData = useMemo(() => {
    const counts = { 1:0,2:0,3:0,4:0,5:0 };
    reviews.forEach(r => { counts[r.rating] = (counts[r.rating] || 0) + 1; });
    return [1,2,3,4,5].map(n => ({ rating: `${n}★`, count: counts[n] }));
  }, [reviews]);

  const submitReview = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await axios.post('/api/reviews', { bookId: id, rating: Number(rating), reviewText });
      setReviewText('');
      await fetchDetails();
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to add review');
    }
  };

  const deleteReview = async (reviewId) => {
    try {
      await axios.delete(`/api/reviews/${reviewId}`);
      await fetchDetails();
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to delete review');
    }
  };

  const startEdit = (review) => {
    setEditingReviewId(review._id);
    setEditingText(review.reviewText);
    setEditingRating(review.rating);
  };

  const cancelEdit = () => {
    setEditingReviewId('');
    setEditingText('');
    setEditingRating(5);
  };

  const saveEdit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`/api/reviews/${editingReviewId}`, { reviewText: editingText, rating: Number(editingRating) });
      cancelEdit();
      await fetchDetails();
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to update review');
    }
  };

  const deleteBook = async () => {
    if (!window.confirm('Delete this book?')) return;
    try {
      await axios.delete(`/api/books/${id}`);
      navigate('/');
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to delete book');
    }
  };

  if (loading) return <div className="container">Loading...</div>;
  if (!book) return <div>Not found</div>;

  return (
    <div className="container">
      <div className="space-between mb-2">
        <h1 className="page-title">{book.title}</h1>
        {user && user._id === book.addedBy?._id && (
          <div className="stack" style={{ gridAutoFlow: 'column' }}>
            <Link className="nav-link" to={`/edit-book/${book._id}`}>Edit</Link>
            <button className="btn btn-danger" onClick={deleteBook}>Delete</button>
          </div>
        )}
      </div>
      <p className="muted">by {book.author}</p>
      <p className="muted">{book.genre} • {book.year}</p>
      <p className="mt-2">{book.description}</p>
      <p className="mb-6">Average rating: <b>{avgRating}</b></p>

      <h2 className="section-title">Reviews</h2>
      <div className="card mb-6" style={{ height: 240 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={ratingData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <XAxis dataKey="rating" stroke="var(--muted)" />
            <YAxis allowDecimals={false} stroke="var(--muted)" />
            <Tooltip />
            <Bar dataKey="count" fill="var(--primary)" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="stack mb-6">
        {reviews.length === 0 && <p>No reviews yet.</p>}
        {reviews.map((r) => (
          <div key={r._id} className="card">
            <div className="space-between">
              <span><b>{r.userId?.name || 'User'}</b> • {r.rating}★</span>
              {user && user._id === r.userId?._id && (
                <div className="stack" style={{ gridAutoFlow: 'column' }}>
                  <button className="nav-link" onClick={() => startEdit(r)}>Edit</button>
                  <button className="btn btn-secondary" onClick={() => deleteReview(r._id)}>Delete</button>
                </div>
              )}
            </div>
            {editingReviewId === r._id ? (
              <form onSubmit={saveEdit} className="mt-2 stack">
                <div>
                  <label>Rating:</label>
                  <select value={editingRating} onChange={(e) => setEditingRating(Number(e.target.value))}>
                    {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
                <textarea value={editingText} onChange={(e) => setEditingText(e.target.value)} required />
                <div className="stack" style={{ gridAutoFlow: 'column' }}>
                  <button type="submit" className="btn btn-primary">Save</button>
                  <button type="button" className="btn btn-secondary" onClick={cancelEdit}>Cancel</button>
                </div>
              </form>
            ) : (
              <p className="mt-2">{r.reviewText}</p>
            )}
          </div>
        ))}
      </div>

      {user ? (
        <form onSubmit={submitReview} className="stack">
          <div className="form-group">
            <label>Rating</label>
            <select value={rating} onChange={(e) => setRating(e.target.value)}>
              {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Review</label>
            <textarea value={reviewText} onChange={(e) => setReviewText(e.target.value)} required />
          </div>
          {error && <p className="error">{error}</p>}
          <button type="submit" className="btn btn-primary">Submit Review</button>
        </form>
      ) : (
        <p>Please log in to add a review.</p>
      )}
    </div>
  );
};

export default BookDetails;


