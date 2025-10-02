import express from 'express';
import Review from '../models/Review.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Get my reviews
router.get('/mine', auth, async (req, res) => {
  try {
    const reviews = await Review.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add review
router.post('/', auth, async (req, res) => {
  try {
    const { bookId, rating, reviewText } = req.body;

    const review = await Review.create({
      bookId,
      userId: req.user.id,
      rating,
      reviewText
    });

    const populatedReview = await Review.findById(review._id).populate('userId', 'name');
    res.status(201).json(populatedReview);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'You have already reviewed this book' });
    }
    res.status(500).json({ message: error.message });
  }
});

// Update review
router.put('/:id', auth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    
    if (review.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this review' });
    }

    const updatedReview = await Review.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('userId', 'name');

    res.json(updatedReview);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete review
router.delete('/:id', auth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    
    if (review.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this review' });
    }

    await Review.findByIdAndDelete(req.params.id);
    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;