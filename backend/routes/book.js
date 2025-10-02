import express from 'express';
import Book from '../models/Book.js';
import Review from '../models/Review.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Get my books (owned by current user)
router.get('/mine', auth, async (req, res) => {
  try {
    const books = await Book.find({ addedBy: req.user.id }).sort({ createdAt: -1 });
    res.json(books);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all books with pagination
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 5;
    const skip = (page - 1) * limit;

    const books = await Book.find()
      .populate('addedBy', 'name')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Book.countDocuments();
    // attach average ratings
    const bookIds = books.map(b => b._id);
    const ratingAgg = await Review.aggregate([
      { $match: { bookId: { $in: bookIds } } },
      { $group: { _id: '$bookId', avg: { $avg: '$rating' } } }
    ]);
    const idToAvg = new Map(ratingAgg.map(r => [String(r._id), Number(r.avg?.toFixed(1))]));
    const booksWithAvg = books.map(b => ({
      ...b.toObject(),
      avgRating: idToAvg.get(String(b._id)) || 0
    }));
    
    res.json({
      books: booksWithAvg,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalBooks: total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single book with reviews
router.get('/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id).populate('addedBy', 'name');
    const reviews = await Review.find({ bookId: req.params.id })
      .populate('userId', 'name')
      .sort({ createdAt: -1 });

    // Calculate average rating
    const avgRating = reviews.length > 0 
      ? reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length 
      : 0;

    res.json({ book, reviews, avgRating: avgRating.toFixed(1) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add new book
router.post('/', auth, async (req, res) => {
  try {
    const { title, author, description, genre, year } = req.body;
    
    const book = await Book.create({
      title,
      author,
      description,
      genre,
      year,
      addedBy: req.user.id
    });

    const populatedBook = await Book.findById(book._id).populate('addedBy', 'name');
    res.status(201).json(populatedBook);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update book
router.put('/:id', auth, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    
    if (book.addedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this book' });
    }

    const updatedBook = await Book.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('addedBy', 'name');

    res.json(updatedBook);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete book
router.delete('/:id', auth, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    
    if (book.addedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this book' });
    }

    await Book.findByIdAndDelete(req.params.id);
    await Review.deleteMany({ bookId: req.params.id });
    
    res.json({ message: 'Book deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;