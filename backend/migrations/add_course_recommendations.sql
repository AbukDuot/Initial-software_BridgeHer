-- Add sample course recommendations
INSERT INTO course_recommendations (course_id, recommended_course_id, similarity_score) VALUES
(1, 2, 0.85),
(1, 5, 0.75),
(2, 1, 0.85),
(2, 5, 0.80),
(3, 6, 0.90),
(3, 8, 0.70),
(4, 5, 0.75),
(4, 2, 0.65)
ON CONFLICT DO NOTHING;

COMMIT;
