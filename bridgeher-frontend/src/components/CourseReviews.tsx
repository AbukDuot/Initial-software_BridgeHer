import { useState, useEffect } from 'react';
import '../styles/courseReviews.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

interface Review {
  id: number;
  user_name: string;
  rating: number;
  review_text: string;
  created_at: string;
}

interface CourseReviewsProps {
  courseId: number;
  isEnrolled: boolean;
}

export default function CourseReviews({ courseId, isEnrolled }: CourseReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, [courseId]);

  const fetchReviews = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/course-reviews/${courseId}`);
      const data = await res.json();
      setReviews(data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_BASE_URL}/api/course-reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ course_id: courseId, rating, review_text: reviewText })
      });
      if (res.ok) {
        setReviewText('');
        setShowForm(false);
        fetchReviews();
      }
    } catch (error) {
      console.error('Error submitting review:', error);
    }
  };

  return (
    <div className="course-reviews">
      <h3>Reviews</h3>
      {isEnrolled && !showForm && (
        <button onClick={() => setShowForm(true)} className="add-review-btn">Write a Review</button>
      )}
      {showForm && (
        <form onSubmit={handleSubmit} className="review-form">
          <label>Rating: {rating}/5</label>
          <input type="range" min="1" max="5" value={rating} onChange={(e) => setRating(Number(e.target.value))} />
          <textarea value={reviewText} onChange={(e) => setReviewText(e.target.value)} placeholder="Write your review..." required />
          <div className="form-actions">
            <button type="submit">Submit</button>
            <button type="button" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </form>
      )}
      <div className="reviews-list">
        {reviews.map((review) => (
          <div key={review.id} className="review-item">
            <div className="review-header">
              <strong>{review.user_name}</strong>
              <span className="rating">{'⭐'.repeat(review.rating)}</span>
            </div>
            <p>{review.review_text}</p>
            <small>{new Date(review.created_at).toLocaleDateString()}</small>
          </div>
        ))}
      </div>
    </div>
  );
}
