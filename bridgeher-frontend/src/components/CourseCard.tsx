import React from "react";
import { Link } from "react-router-dom";

interface CourseCardProps {
  id: number;
  title: string;
  description: string;
  rating: number;
}

const CourseCard: React.FC<CourseCardProps> = ({ id, title, description, rating }) => (
  <div className="card course-card">
    <h3>{title}</h3>
    <p>{description}</p>
    <p> {rating}</p>
    <Link to={`/course/${id}`} className="btn-primary">View Course</Link>
  </div>
);

export default CourseCard;