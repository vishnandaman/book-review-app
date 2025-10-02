import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Profile = () => {
  const [myBooks, setMyBooks] = useState([]);
  const [myReviews, setMyReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [booksRes, reviewsRes] = await Promise.all([
          axios.get('/api/books/mine'),
          axios.get('/api/reviews/mine')
        ]);
        setMyBooks(booksRes.data || []);
        setMyReviews(reviewsRes.data || []);
      } catch (e) {
        setError(e.response?.data?.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <div className="container">Loading...</div>;

  return (
    <div className="container">
      <h1 className="page-title">My Profile</h1>
      {error && <p className="error">{error}</p>}

      <h2 className="section-title">My Books</h2>
      <div className="stack mb-6">
        {myBooks.length === 0 && <p>No books added yet.</p>}
        {myBooks.map(b => (
          <div key={b._id} className="card">
            <div className="card-title">{b.title}</div>
            <div className="muted">{b.author} • {b.genre} • {b.year}</div>
          </div>
        ))}
      </div>

      <h2 className="section-title">My Reviews</h2>
      <div className="stack">
        {myReviews.length === 0 && <p>No reviews yet.</p>}
        {myReviews.map(r => (
          <div key={r._id} className="card">
            <div className="muted">Rating: {r.rating}★</div>
            <div className="mt-2">{r.reviewText}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Profile;


