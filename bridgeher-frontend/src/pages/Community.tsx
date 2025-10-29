import React, { useState, useEffect } from "react";
import { Button, Container, Row, Col, Card, ListGroup, Modal, Form, Table } from "react-bootstrap";
import "../styles/community.css";
import communityTranslations from "../i18n/communityTranslations";
import { useLanguage } from "../hooks/useLanguage";

const Community: React.FC = () => {
  const { language } = useLanguage();
  const t = communityTranslations[language];

  const [showModal, setShowModal] = useState(false);
  type Topic = {
    title: string;
    category: string;
    description: string;
    replies: number;
    views: number;
    activity: string;
  };

  const [newTopic, setNewTopic] = useState<Omit<Topic, "replies" | "views" | "activity">>({
    title: "",
    category: "",
    description: "",
  });

  const [topics, setTopics] = useState<Topic[]>([]);

  useEffect(() => {
    document.documentElement.setAttribute("dir", language === "Arabic" ? "rtl" : "ltr");
    fetchTopics();
  }, [language]);

  const fetchTopics = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/community/topics");
      if (res.ok) {
        const data = await res.json();
        setTopics(data.map((t: any) => ({
          title: t.title,
          category: t.category,
          description: t.description,
          replies: t.replies || 0,
          views: t.views || 0,
          activity: new Date(t.created_at).toLocaleDateString()
        })));
      }
    } catch (err) {
      console.error("Failed to fetch topics", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopic.title) return;
    
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Please login first");
        return;
      }
      
      const res = await fetch("http://localhost:5000/api/community/topics", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(newTopic)
      });
      
      if (res.ok) {
        await fetchTopics();
        setNewTopic({ title: "", category: "", description: "" });
        setShowModal(false);
        alert("Topic created successfully!");
      } else {
        const error = await res.json();
        alert(`Failed to create topic: ${error.error || 'Unknown error'}`);
      }
    } catch (err) {
      console.error("Failed to create topic", err);
      alert("Connection error. Please check if backend is running.");
    }
  };

  return (
    <Container fluid className="community-page">
      <Row>
        {/*Sidebar */}
        <Col md={3}>
          <div className="sticky-sidebar">
            <Card className="mb-3 shadow-sm border-0">
              <Card.Body>
                <Card.Title className="fw-bold mb-3">{t.popularCategories}</Card.Title>
                <ListGroup variant="flush">
                  {t.categories.map((cat: string, i: number) => (
                    <ListGroup.Item key={i} className="border-0 ps-2 py-2 sidebar-item">
                      {cat}
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </Card.Body>
            </Card>

            <Card className="mb-3 shadow-sm border-0">
              <Card.Body>
                <Card.Title className="fw-bold mb-3">{t.topTags}</Card.Title>
                <div className="d-flex flex-wrap gap-2">
                  {t.tags.map((tag: string, i: number) => (
                    <span key={i} className="badge bg-secondary">{tag}</span>
                  ))}
                </div>
              </Card.Body>
            </Card>
          </div>
        </Col>
        <Col md={9}>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="fw-bold text-purple">{t.communityForum}</h2>
            <Button variant="primary" onClick={() => setShowModal(true)}>
              + {t.newTopic}
            </Button>
          </div>
          <Card className="shadow-sm border-0">
            <Card.Body>
              <Table responsive hover>
                <thead>
                  <tr>
                    <th>{t.topics}</th>
                    <th>{t.replies}</th>
                    <th>{t.views}</th>
                    <th>{t.activity}</th>
                  </tr>
                </thead>
                <tbody>
                  {topics.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center text-muted py-4">
                        {t.noTopics}
                      </td>
                    </tr>
                  ) : (
                    topics.map((topic, index) => (
                      <tr key={index}>
                        <td>
                          <strong>{topic.title}</strong>
                          <p className="text-muted small">{topic.category}</p>
                        </td>
                        <td>{topic.replies}</td>
                        <td>{topic.views}</td>
                        <td>{topic.activity}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{t.createTopic}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>{t.topicTitle}</Form.Label>
              <Form.Control
                type="text"
                value={newTopic.title}
                onChange={(e) => setNewTopic({ ...newTopic, title: e.target.value })}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>{t.category}</Form.Label>
              <Form.Select
                value={newTopic.category}
                onChange={(e) => setNewTopic({ ...newTopic, category: e.target.value })}
              >
                {t.categories.map((cat: string, i: number) => (
                  <option key={i} value={cat}>{cat}</option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>{t.description}</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={newTopic.description}
                onChange={(e) => setNewTopic({ ...newTopic, description: e.target.value })}
              />
            </Form.Group>

            <Button type="submit" className="w-100 btn-primary">
              {t.postTopic}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default Community;
