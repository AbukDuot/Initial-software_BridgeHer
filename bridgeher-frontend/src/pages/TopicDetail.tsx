import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useLanguage } from "../hooks/useLanguage";
import { API_BASE_URL } from "../config/api";
import { timeAgo } from "../utils/timeAgo";
import RichTextEditor from "../components/RichTextEditor";
import { showToast } from "../utils/toast";
import "../styles/topicDetail.css";
import "../styles/toggleComments.css";

interface Topic {
  id: number;
  title: string;
  category: string;
  description: string;
  content: string;
  author_name: string;
  user_id: number;
  views: number;
  likes: number;
  user_liked: boolean;
  status: string;
  locked: boolean;
  created_at: string;
  image_url?: string;
  video_url?: string;
  media_type?: string;
}

interface Reply {
  id: number;
  content: string;
  author_name: string;
  likes: number;
  user_liked: boolean;
  created_at: string;
  parent_reply_id?: number;
  best_answer?: boolean;
  user_id: number;
}

const TopicDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const isArabic = language === "Arabic";

  const [topic, setTopic] = useState<Topic | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [replyText, setReplyText] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [editingTopic, setEditingTopic] = useState(false);
  const [editingReply, setEditingReply] = useState<number | null>(null);
  const [editTopicData, setEditTopicData] = useState({ title: "", description: "", content: "" });
  const [editReplyText, setEditReplyText] = useState("");
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportData, setReportData] = useState({ type: "", id: 0, reason: "" });
  const [reactions, setReactions] = useState<any[]>([]);
  const [replyReactions, setReplyReactions] = useState<{[key: number]: any[]}>({});
  const [showEmojiPicker, setShowEmojiPicker] = useState<{type: string, id: number} | null>(null);
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [nestedReplyText, setNestedReplyText] = useState("");
  const [attachments, setAttachments] = useState<any[]>([]);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [expandedReplies, setExpandedReplies] = useState<{[key: number]: boolean}>({});
  const [activeTab, setActiveTab] = useState<'replies' | 'questions'>('replies');
  const [questions, setQuestions] = useState<any[]>([]);
  const [questionText, setQuestionText] = useState("");
  const [answers, setAnswers] = useState<{[key: number]: any[]}>({});
  const [mentionSuggestions, setMentionSuggestions] = useState<any[]>([]);
  const [showMentions, setShowMentions] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<number | null>(null);
  const [editingAnswer, setEditingAnswer] = useState<number | null>(null);
  const [editQuestionText, setEditQuestionText] = useState("");
  const [editAnswerText, setEditAnswerText] = useState("");
  const [deletingTopic, setDeletingTopic] = useState(false);
  const [deletingReply, setDeletingReply] = useState<number | null>(null);
  const [deletingQuestion, setDeletingQuestion] = useState<number | null>(null);
  const [deletingAnswer, setDeletingAnswer] = useState<number | null>(null);

  useEffect(() => {
    fetchTopic();
    fetchCurrentUser();
    fetchReactions();
    fetchAttachments();
    fetchQuestions();
    
    const token = localStorage.getItem("token");
    if (token) {
      checkBookmark();
      checkSubscription();
    }
  }, [id]);
  
  const checkBookmark = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      
      const res = await fetch(`${API_BASE_URL}/api/community/bookmarks/check/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.ok) {
        const data = await res.json();
        setIsBookmarked(data.bookmarked);
      }
    } catch (err) {
      // Silently fail
    }
  };
  
  const checkSubscription = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    
    try {
      const res = await fetch(`${API_BASE_URL}/api/community/topics/${id}/subscription`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.ok) {
        const data = await res.json();
        setIsSubscribed(data.subscribed);
      }
    } catch (err) {
      // Silently fail
    }
  };

  const handleSubscribe = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        showToast(isArabic ? "الرجاء تسجيل الدخول" : "Please login", "error");
        return;
      }
      
      const res = await fetch(`${API_BASE_URL}/api/community/topics/${id}/subscribe`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.ok) {
        const data = await res.json();
        setIsSubscribed(data.subscribed);
        showToast(data.subscribed 
          ? (isArabic ? "تم الاشتراك في الموضوع" : "Subscribed to topic")
          : (isArabic ? "تم إلغاء الاشتراك" : "Unsubscribed from topic"), "success"
        );
      } else {
        const error = await res.json();
        showToast(isArabic ? `فشل: ${error.error}` : `Failed: ${error.error}`, "error");
      }
    } catch (err) {
      console.error("Failed to subscribe", err);
      showToast(isArabic ? "حدث خطأ" : "An error occurred", "error");
    }
  };

  const handleBookmark = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        showToast(isArabic ? "الرجاء تسجيل الدخول" : "Please login", "error");
        return;
      }
      
      const res = await fetch(`${API_BASE_URL}/api/community/topics/${id}/bookmark`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.ok) {
        const data = await res.json();
        setIsBookmarked(data.bookmarked);
        showToast(data.bookmarked 
          ? (isArabic ? "تمت إضافة الإشارة المرجعية" : "Bookmark added")
          : (isArabic ? "تمت إزالة الإشارة المرجعية" : "Bookmark removed"), "success"
        );
      } else {
        const error = await res.json();
        showToast(isArabic ? `فشل: ${error.error}` : `Failed: ${error.error}`, "error");
      }
    } catch (err) {
      console.error("Failed to bookmark", err);
      showToast(isArabic ? "حدث خطأ" : "An error occurred", "error");
    }
  };

  const fetchReactions = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/community/topics/${id}/reactions`);
      if (res.ok) {
        const data = await res.json();
        setReactions(data);
      }
    } catch (err) {
      console.error("Failed to fetch reactions", err);
    }
  };

  const fetchAttachments = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/community/attachments/topic/${id}`);
      if (res.ok) {
        const data = await res.json();
        setAttachments(data);
      }
    } catch (err) {
      console.error("Failed to fetch attachments", err);
    }
  };

  const fetchCurrentUser = () => {
    const user = localStorage.getItem("user");
    if (user) {
      const parsedUser = JSON.parse(user);
      setCurrentUser(parsedUser);
    }
  };

  const fetchTopic = async () => {
    try {
      const token = localStorage.getItem("token");
      const viewedTopics = JSON.parse(localStorage.getItem("viewedTopics") || "[]");
      const alreadyViewed = viewedTopics.includes(Number(id));
      
      const res = await fetch(`${API_BASE_URL}/api/community/topics/${id}?skipView=${alreadyViewed}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      
      if (res.ok) {
        const data = await res.json();
        setTopic(data.topic);
        setReplies(data.replies);
        
        if (!alreadyViewed) {
          viewedTopics.push(Number(id));
          localStorage.setItem("viewedTopics", JSON.stringify(viewedTopics));
        }
      }
    } catch (err) {
      console.error("Failed to fetch topic", err);
    } finally {
      setLoading(false);
    }
  };



  const fetchMentionSuggestions = async (query: string) => {
    if (query.length < 2) {
      setMentionSuggestions([]);
      setShowMentions(false);
      return;
    }
    
    try {
      const res = await fetch(`${API_BASE_URL}/api/community/users/search?q=${encodeURIComponent(query)}`);
      if (res.ok) {
        const users = await res.json();
        setMentionSuggestions(users.slice(0, 5));
        setShowMentions(true);
      }
    } catch (err) {
      console.error("Failed to fetch mention suggestions", err);
    }
  };

  const handleMentionSelect = (user: any) => {
    const mentionText = `@${user.name} `;
    setReplyText(prev => {
      const lastAtIndex = prev.lastIndexOf('@');
      return prev.substring(0, lastAtIndex) + mentionText;
    });
    setShowMentions(false);
    setMentionSuggestions([]);
  };

  const handleReplyTextChange = (text: string) => {
    setReplyText(text);
    
    // Check for @ mentions
    const lastAtIndex = text.lastIndexOf('@');
    if (lastAtIndex !== -1) {
      const afterAt = text.substring(lastAtIndex + 1);
      const spaceIndex = afterAt.indexOf(' ');
      if (spaceIndex === -1) {
        fetchMentionSuggestions(afterAt);
      } else {
        setShowMentions(false);
      }
    } else {
      setShowMentions(false);
    }
  };

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!replyText.trim()) {
      showToast(isArabic ? "الرجاء كتابة رد" : "Please write a reply", "error");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        showToast(isArabic ? "الرجاء تسجيل الدخول" : "Please login", "error");
        navigate("/login");
        return;
      }

      const res = await fetch(`${API_BASE_URL}/api/community/topics/${id}/replies`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ content: replyText })
      });

      if (res.ok) {
        setReplyText("");
        await fetchTopic();
        showToast(isArabic ? "تم إضافة الرد بنجاح!" : "Reply added successfully!", "success");
      }
    } catch (err) {
      console.error("Failed to submit reply", err);
      showToast(isArabic ? "فشل في إضافة الرد" : "Failed to add reply", "error");
    }
  };

  const handleDeleteTopic = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        showToast(isArabic ? "الرجاء تسجيل الدخول" : "Please login", "error");
        return;
      }
      
      const res = await fetch(`${API_BASE_URL}/api/community/topics/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        setDeletingTopic(false);
        showToast(isArabic ? "تم حذف الموضوع" : "Topic deleted", "success");
        navigate("/community");
      } else {
        const error = await res.json();
        showToast(isArabic ? `فشل: ${error.error}` : `Failed: ${error.error}`, "error");
      }
    } catch (err) {
      console.error("Failed to delete topic", err);
      showToast(isArabic ? "حدث خطأ" : "An error occurred", "error");
    }
  };

  const handleDeleteReply = async (replyId: number) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/community/replies/${replyId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        setDeletingReply(null);
        showToast(isArabic ? "تم حذف الرد" : "Reply deleted", "success");
        await fetchTopic();
      }
    } catch (err) {
      console.error("Failed to delete reply", err);
    }
  };

  const handleEditTopic = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        showToast(isArabic ? "الرجاء تسجيل الدخول" : "Please login", "error");
        return;
      }
      
      const res = await fetch(`${API_BASE_URL}/api/community/topics/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title: editTopicData.title,
          description: editTopicData.description,
          category: topic?.category
        })
      });

      if (res.ok) {
        showToast(isArabic ? "تم تحديث الموضوع" : "Topic updated", "success");
        setEditingTopic(false);
        await fetchTopic();
      } else {
        const error = await res.json();
        showToast(isArabic ? `فشل: ${error.error}` : `Failed: ${error.error}`, "error");
      }
    } catch (err) {
      console.error("Failed to edit topic", err);
      showToast(isArabic ? "حدث خطأ" : "An error occurred", "error");
    }
  };

  const handleEditReply = async (replyId: number) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/community/replies/${replyId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ content: editReplyText })
      });

      if (res.ok) {
        showToast(isArabic ? "تم تحديث الرد" : "Reply updated", "success");
        setEditingReply(null);
        await fetchTopic();
      }
    } catch (err) {
      console.error("Failed to edit reply", err);
    }
  };

  const handlePinTopic = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/community/topics/${id}/pin`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        showToast(isArabic ? "تم تحديث التثبيت" : "Pin status updated", "success");
        await fetchTopic();
      }
    } catch (err) {
      console.error("Failed to pin topic", err);
    }
  };



  const handleReport = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        showToast(isArabic ? "الرجاء تسجيل الدخول" : "Please login", "error");
        return;
      }

      const res = await fetch(`${API_BASE_URL}/api/community/reports`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          content_type: reportData.type,
          content_id: reportData.id,
          reason: reportData.reason
        })
      });

      if (res.ok) {
        showToast(isArabic ? "تم إرسال البلاغ" : "Report submitted", "success");
        setShowReportModal(false);
        setReportData({ type: "", id: 0, reason: "" });
      }
    } catch (err) {
      console.error("Failed to report", err);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/community/topics/${id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        showToast(isArabic ? "تم تحديث الحالة" : "Status updated", "success");
        await fetchTopic();
      }
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  const handleLockToggle = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/community/topics/${id}/lock`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        showToast(isArabic ? "تم تحديث القفل" : "Lock status updated", "success");
        await fetchTopic();
      }
    } catch (err) {
      console.error("Failed to toggle lock", err);
    }
  };



  const handleReact = async (emoji: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        showToast(isArabic ? "الرجاء تسجيل الدخول" : "Please login", "error");
        return;
      }

      const res = await fetch(`${API_BASE_URL}/api/community/topics/${id}/react`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ emoji })
      });

      if (res.ok) {
        await fetchReactions();
        setShowEmojiPicker(null);
      } else {
        const error = await res.json();
        showToast(isArabic ? `فشل: ${error.error}` : `Failed: ${error.error}`, "error");
      }
    } catch (err) {
      console.error("Failed to react", err);
      showToast(isArabic ? "حدث خطأ" : "An error occurred", "error");
    }
  };

  const handleReplyReact = async (replyId: number, emoji: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        showToast(isArabic ? "الرجاء تسجيل الدخول" : "Please login", "error");
        return;
      }

      const res = await fetch(`${API_BASE_URL}/api/community/replies/${replyId}/react`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ emoji })
      });

      if (res.ok) {
        const reactRes = await fetch(`${API_BASE_URL}/api/community/replies/${replyId}/reactions`);
        if (reactRes.ok) {
          const data = await reactRes.json();
          setReplyReactions(prev => ({ ...prev, [replyId]: data }));
        }
        setShowEmojiPicker(null);
      }
    } catch (err) {
      console.error("Failed to react", err);
    }
  };

  const handleMarkBestAnswer = async (replyId: number) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/community/replies/${replyId}/mark-best`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        showToast(isArabic ? "تم تحديد أفضل إجابة" : "Best answer marked", "success");
        await fetchTopic();
      }
    } catch (err) {
      console.error("Failed to mark best answer", err);
    }
  };

  const handleVoteReply = async (replyId: number, voteType: 'up' | 'down') => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        showToast(isArabic ? "الرجاء تسجيل الدخول" : "Please login", "error");
        return;
      }

      const res = await fetch(`${API_BASE_URL}/api/community/replies/${replyId}/vote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ vote_type: voteType })
      });

      if (res.ok) {
        await fetchTopic(); 
      } else {
        const error = await res.json();
        showToast(isArabic ? `فشل: ${error.error}` : `Failed: ${error.error}`, "error");
      }
    } catch (err) {
      console.error("Failed to vote", err);
      showToast(isArabic ? "حدث خطأ" : "An error occurred", "error");
    }
  };

  const fetchQuestions = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/community/topics/${id}/questions`);
      if (res.ok) {
        const data = await res.json();
        setQuestions(data.questions || []);
        setAnswers(data.answers || {});
      }
    } catch (err) {
      console.error("Failed to fetch questions", err);
    }
  };

  const handleSubmitQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionText.trim()) {
      showToast(isArabic ? "الرجاء كتابة سؤال" : "Please write a question", "error");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        showToast(isArabic ? "الرجاء تسجيل الدخول" : "Please login", "error");
        return;
      }

      const res = await fetch(`${API_BASE_URL}/api/community/topics/${id}/questions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ question: questionText })
      });

      if (res.ok) {
        setQuestionText("");
        await fetchQuestions();
        showToast(isArabic ? "تم إضافة السؤال بنجاح!" : "Question added successfully!", "success");
      } else {
        const error = await res.json();
        showToast(isArabic ? `فشل: ${error.error}` : `Failed: ${error.error}`, "error");
      }
    } catch (err) {
      console.error("Failed to submit question", err);
      showToast(isArabic ? "فشل في إضافة السؤال" : "Failed to add question", "error");
    }
  };

  const handleAnswerQuestion = async (questionId: number, answerText: string) => {
    if (!answerText.trim()) {
      showToast(isArabic ? "الرجاء كتابة إجابة" : "Please write an answer", "error");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        showToast(isArabic ? "الرجاء تسجيل الدخول" : "Please login", "error");
        return;
      }

      const res = await fetch(`${API_BASE_URL}/api/community/questions/${questionId}/answers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ answer: answerText })
      });

      if (res.ok) {
        await fetchQuestions();
        showToast(isArabic ? "تم إضافة الإجابة بنجاح!" : "Answer added successfully!", "success");
      } else {
        const error = await res.json();
        showToast(isArabic ? `فشل: ${error.error}` : `Failed: ${error.error}`, "error");
      }
    } catch (err) {
      console.error("Failed to submit answer", err);
      showToast(isArabic ? "فشل في إضافة الإجابة" : "Failed to add answer", "error");
    }
  };

  const handleNestedReply = async (parentId: number) => {
    if (!nestedReplyText.trim()) {
      showToast(isArabic ? "الرجاء كتابة تعليق" : "Please write a comment", "error");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        showToast(isArabic ? "الرجاء تسجيل الدخول" : "Please login", "error");
        return;
      }

      const res = await fetch(`${API_BASE_URL}/api/community/replies/${parentId}/reply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ content: nestedReplyText })
      });

      if (res.ok) {
        setNestedReplyText("");
        setReplyingTo(null);
        await fetchTopic();
        showToast(isArabic ? "تم إضافة التعليق!" : "Comment added!", "success");
      } else {
        const error = await res.json();
        showToast(isArabic ? `فشل: ${error.error}` : `Failed: ${error.error}`, "error");
      }
    } catch (err) {
      console.error("Failed to add nested reply", err);
      showToast(isArabic ? "حدث خطأ" : "An error occurred", "error");
    }
  };

  const handleEditQuestion = async (questionId: number) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        showToast(isArabic ? "الرجاء تسجيل الدخول" : "Please login", "error");
        return;
      }
      
      const res = await fetch(`${API_BASE_URL}/api/community/questions/${questionId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ question: editQuestionText })
      });

      if (res.ok) {
        setEditingQuestion(null);
        await fetchQuestions();
        showToast(isArabic ? "تم تحديث السؤال" : "Question updated", "success");
      } else {
        const error = await res.json();
        showToast(isArabic ? `فشل: ${error.error}` : `Failed: ${error.error}`, "error");
      }
    } catch (err) {
      console.error("Failed to edit question", err);
      showToast(isArabic ? "حدث خطأ" : "An error occurred", "error");
    }
  };

  const handleDeleteQuestion = async (questionId: number) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        showToast(isArabic ? "الرجاء تسجيل الدخول" : "Please login", "error");
        return;
      }
      
      const res = await fetch(`${API_BASE_URL}/api/community/questions/${questionId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        setDeletingQuestion(null);
        await fetchQuestions();
        showToast(isArabic ? "تم حذف السؤال" : "Question deleted", "success");
      } else {
        const error = await res.json();
        showToast(isArabic ? `فشل: ${error.error}` : `Failed: ${error.error}`, "error");
      }
    } catch (err) {
      console.error("Failed to delete question", err);
      showToast(isArabic ? "حدث خطأ" : "An error occurred", "error");
    }
  };

  const handleEditAnswer = async (answerId: number) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        showToast(isArabic ? "الرجاء تسجيل الدخول" : "Please login", "error");
        return;
      }
      
      const res = await fetch(`${API_BASE_URL}/api/community/answers/${answerId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ answer: editAnswerText })
      });

      if (res.ok) {
        setEditingAnswer(null);
        await fetchQuestions();
        showToast(isArabic ? "تم تحديث الإجابة" : "Answer updated", "success");
      } else {
        const error = await res.json();
        showToast(isArabic ? `فشل: ${error.error}` : `Failed: ${error.error}`, "error");
      }
    } catch (err) {
      console.error("Failed to edit answer", err);
      showToast(isArabic ? "حدث خطأ" : "An error occurred", "error");
    }
  };

  const handleDeleteAnswer = async (answerId: number) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        showToast(isArabic ? "الرجاء تسجيل الدخول" : "Please login", "error");
        return;
      }
      
      const res = await fetch(`${API_BASE_URL}/api/community/answers/${answerId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        setDeletingAnswer(null);
        await fetchQuestions();
        showToast(isArabic ? "تم حذف الإجابة" : "Answer deleted", "success");
      } else {
        const error = await res.json();
        showToast(isArabic ? `فشل: ${error.error}` : `Failed: ${error.error}`, "error");
      }
    } catch (err) {
      console.error("Failed to delete answer", err);
      showToast(isArabic ? "حدث خطأ" : "An error occurred", "error");
    }
  };



  if (loading) return <div className="loading">{isArabic ? "جاري التحميل..." : "Loading..."}</div>;
  if (!topic) return <div className="error">{isArabic ? "الموضوع غير موجود" : "Topic not found"}</div>;

  return (
    <div className={`topic-detail ${isArabic ? "rtl" : ""}`} dir={isArabic ? "rtl" : "ltr"}>
      <div className="topic-container">
        {/* Back Button */}
        <button className="back-btn" onClick={() => navigate("/community")}>
          ← {isArabic ? "العودة للمنتدى" : "Back to Forum"}
        </button>

        {/* Topic Header */}
        <div className="topic-header">
          {editingTopic ? (
            <div className="edit-form">
              <input
                value={editTopicData.title}
                onChange={(e) => setEditTopicData({ ...editTopicData, title: e.target.value })}
                placeholder={isArabic ? "العنوان" : "Title"}
              />
              <textarea
                value={editTopicData.description}
                onChange={(e) => setEditTopicData({ ...editTopicData, description: e.target.value })}
                placeholder={isArabic ? "الوصف" : "Description"}
                rows={2}
              />
              <RichTextEditor
                value={editTopicData.content}
                onChange={(content) => setEditTopicData({ ...editTopicData, content })}
                placeholder={isArabic ? "المحتوى" : "Content"}
              />
              <div className="edit-actions">
                <button onClick={handleEditTopic} className="btn-save">{isArabic ? "حفظ" : "Save"}</button>
                <button onClick={() => setEditingTopic(false)} className="btn-cancel">{isArabic ? "إلغاء" : "Cancel"}</button>
              </div>
            </div>
          ) : (
            <>
              <h1>{topic.title}</h1>
              <div className="topic-meta">
                <span className="category-badge">{topic.category}</span>
                <span>
                  {isArabic ? "بواسطة" : "by"}{" "}
                  <strong 
                    className="author-link" 
                    onClick={(e) => { e.stopPropagation(); navigate(`/user/${topic.user_id}`); }}
                  >
                    {topic.author_name}
                  </strong>
                </span>
                <span>{timeAgo(topic.created_at, isArabic)}</span>
              </div>
            </>
          )}
        </div>

        {/* Topic Content */}
        <div className="topic-body">
          {topic.description && (
            <div className="topic-description" dangerouslySetInnerHTML={{ __html: topic.description }} />
          )}
          {topic.content && <div className="topic-content" dangerouslySetInnerHTML={{ __html: topic.content }} />}
          
          {/* Media Display */}
          {topic.media_type === 'image' && topic.image_url && (
            <div className="topic-media">
              <img 
                src={topic.image_url.startsWith('http') ? topic.image_url : `${API_BASE_URL}${topic.image_url}`} 
                alt={topic.title} 
                style={{maxWidth: '100%', borderRadius: '8px', marginTop: '15px'}} 
              />
            </div>
          )}
          {topic.media_type === 'video' && topic.video_url && (
            <div className="topic-media">
              <video 
                src={topic.video_url.startsWith('http') ? topic.video_url : `${API_BASE_URL}${topic.video_url}`} 
                controls 
                style={{maxWidth: '100%', borderRadius: '8px', marginTop: '15px'}} 
              />
            </div>
          )}
        </div>

        {/* Reactions */}
        <div className="reactions-section">
          {reactions.map((r: any) => (
            <span key={r.emoji} className="reaction-badge" title={r.users.join(', ')}>
              {r.emoji} {r.count}
            </span>
          ))}
          {currentUser && (
            <button className="add-reaction-btn" onClick={() => setShowEmojiPicker({type: 'topic', id: topic.id})}>
              {isArabic ? "تفاعل" : "React"}
            </button>
          )}
          {showEmojiPicker?.type === 'topic' && showEmojiPicker?.id === topic.id && (
            <div className="emoji-picker">
              {['👍', '❤️', '😂', '😮', '😢', '🎉', '🔥', '💯'].map((emoji) => (
                <button key={emoji} onClick={() => handleReact(emoji)}>
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Attachments */}
        {attachments.length > 0 && (
          <div className="attachments-section">
            <h4>{isArabic ? "المرفقات" : "Attachments"}</h4>
            {attachments.map((att: any) => (
              <a key={att.id} href={att.file_url} target="_blank" rel="noopener noreferrer" className="attachment-link">
                📎 {att.file_name} ({Math.round(att.file_size / 1024)}KB)
              </a>
            ))}
          </div>
        )}

        {/* Topic Actions */}
        <div className="topic-actions">
          {topic.status && (
            <span className={`status-badge status-${topic.status}`}>
              {topic.status === 'solved' ? (isArabic ? '✓ محلول' : '✓ Solved') : 
               topic.status === 'closed' ? (isArabic ? '🔒 مغلق' : '🔒 Closed') : 
               (isArabic ? 'مفتوح' : 'Open')}
            </span>
          )}
          {topic.locked && <span className="locked-badge">🔒 {isArabic ? "مقفل" : "Locked"}</span>}
          
          
          {/* Edit and Delete buttons - visible to any logged-in user for now */}
          {currentUser && !editingTopic && (
            <button className="edit-btn" onClick={() => {
              console.log('Edit button clicked');
              setEditTopicData({ title: topic.title, description: topic.description, content: topic.content });
              setEditingTopic(true);
            }}>
{isArabic ? "تعديل" : "Edit Topic"}
            </button>
          )}
          {currentUser && (
            <button className="delete-btn" onClick={() => setDeletingTopic(true)}>
{isArabic ? "حذف" : "Delete Topic"}
            </button>
          )}
          {currentUser && currentUser.role === 'Admin' && (
            <>
              <button className="pin-btn" onClick={handlePinTopic}>
                 {isArabic ? "تثبيت" : "Pin"}
              </button>
              <button className="lock-btn" onClick={handleLockToggle}>
                {topic.locked ? '' : ''} {topic.locked ? (isArabic ? "فتح" : "Unlock") : (isArabic ? "قفل" : "Lock")}
              </button>
            </>
          )}
          {currentUser && (currentUser.id === topic.user_id || currentUser.role === 'Admin') && (
            <select 
              className="status-select"
              value={topic.status || 'open'}
              onChange={(e) => handleStatusChange(e.target.value)}
            >
              <option value="open">{isArabic ? "مفتوح" : "Open"}</option>
              <option value="solved">{isArabic ? "محلول" : "Solved"}</option>
              <option value="closed">{isArabic ? "مغلق" : "Closed"}</option>
            </select>
          )}
          {currentUser && (
            <>
              <button 
                className={`bookmark-btn ${isBookmarked ? 'bookmarked' : ''}`}
                onClick={handleBookmark}
              >
                {isBookmarked ? 'Saved' : 'Bookmark'}
              </button>
              <button 
                className={`subscribe-btn ${isSubscribed ? 'subscribed' : ''}`}
                onClick={handleSubscribe}
              >
                {isSubscribed ? (isArabic ? "مشترك" : "Following") : (isArabic ? "متابعة" : "Follow")}
              </button>
              <button className="report-btn" onClick={() => {
                setReportData({ type: "topic", id: topic.id, reason: "" });
                setShowReportModal(true);
              }}>
                {isArabic ? "بلاغ" : "Report"}
              </button>
            </>
          )}
        </div>

        {/* Tabs for Replies and Questions */}
        <div className="content-tabs">
          <button 
            className={`tab-btn ${activeTab === 'replies' ? 'active' : ''}`}
            onClick={() => setActiveTab('replies')}
          >
            {isArabic ? 'الردود' : 'Replies'} ({replies.length})
          </button>
          <button 
            className={`tab-btn ${activeTab === 'questions' ? 'active' : ''}`}
            onClick={() => setActiveTab('questions')}
          >
            {isArabic ? 'الأسئلة' : 'Questions'} ({questions.length})
          </button>
        </div>

        {/* Replies Section */}
        {activeTab === 'replies' && (
          <div className="replies-section">
            <h2>{isArabic ? "الردود" : "Replies"} ({replies.length})</h2>

            {replies.length === 0 ? (
              <p className="no-replies">{isArabic ? "لا توجد ردود بعد. كن أول من يرد!" : "No replies yet. Be the first to reply!"}</p>
            ) : (
            <div className="replies-list">
              {replies.filter(r => !r.parent_reply_id).map((reply) => (
                <div key={reply.id} className={`reply-card ${reply.best_answer ? 'best-answer' : ''}`}>
                  <div className="reply-header">
                    <strong>{reply.author_name}</strong>
                    <span>{timeAgo(reply.created_at, isArabic)}</span>
                    {reply.best_answer && <span className="best-badge">✓ {isArabic ? "أفضل إجابة" : "Best Answer"}</span>}
                    {currentUser && (currentUser.id === topic.user_id || currentUser.role === 'Admin') && !reply.best_answer && (
                      <button className="best-answer-btn" onClick={() => handleMarkBestAnswer(reply.id)}>
                        ✓ {isArabic ? "أفضل إجابة" : "Mark Best"}
                      </button>
                    )}
                  </div>
                  <div className="reply-content">{reply.content.replace(/<[^>]*>/g, '')}</div>
                  
                  {/* Reply Reactions */}
                  <div className="reply-reactions">
                    {(replyReactions[reply.id] || []).map((r: any) => (
                      <span key={r.emoji} className="reaction-badge-small" title={r.users.join(', ')}>
                        {r.emoji} {r.count}
                      </span>
                    ))}
                    {currentUser && (
                      <button className="add-reaction-btn-small" onClick={() => setShowEmojiPicker({type: 'reply', id: reply.id})}>
                        ➕
                      </button>
                    )}
                    {showEmojiPicker?.type === 'reply' && showEmojiPicker?.id === reply.id && (
                      <div className="emoji-picker-small">
                        {['👍', '❤️', '😂', '😮', '😢', '🎉'].map((emoji) => (
                          <button key={emoji} onClick={() => handleReplyReact(reply.id, emoji)}>
                            {emoji}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  {editingReply === reply.id ? (
                    <div className="edit-reply-form">
                      <RichTextEditor
                        value={editReplyText}
                        onChange={setEditReplyText}
                        placeholder={isArabic ? "تعديل الرد" : "Edit reply"}
                      />
                      <div className="edit-actions">
                        <button onClick={() => handleEditReply(reply.id)} className="btn-save">{isArabic ? "حفظ" : "Save"}</button>
                        <button onClick={() => setEditingReply(null)} className="btn-cancel">{isArabic ? "إلغاء" : "Cancel"}</button>
                      </div>
                    </div>
                  ) : (
                    <div className="reply-actions">
                      <div className="vote-buttons">
                        {currentUser && (
                          <>
                            <button className="vote-btn upvote" onClick={() => handleVoteReply(reply.id, 'up')}>
                              ▲ {isArabic ? 'مفيد' : 'Helpful'}
                            </button>
                            <span className="vote-count">{reply.upvotes || 0}</span>
                            <button className="vote-btn downvote" onClick={() => handleVoteReply(reply.id, 'down')}>
                              ▼ {isArabic ? 'غير مفيد' : 'Not Helpful'}
                            </button>
                            <span className="vote-count downvote-count">{reply.downvotes || 0}</span>
                          </>
                        )}
                      </div>
                      <div className="action-buttons">
                        {currentUser && (
                          <>
                            <button className="edit-btn-small" onClick={() => {
                              setEditReplyText(reply.content);
                              setEditingReply(reply.id);
                            }}>
                              {isArabic ? "تعديل" : "Edit"}
                            </button>
                            <button className="delete-btn-small" onClick={() => setDeletingReply(reply.id)}>
                              {isArabic ? "حذف" : "Delete"}
                            </button>
                            <button className="reply-btn-small" onClick={() => setReplyingTo(reply.id)}>
                              {isArabic ? "تعليق" : "Comment"}
                            </button>
                          </>
                        )}
                        {currentUser && (
                          <button className="report-btn-small" onClick={() => {
                            setReportData({ type: "reply", id: reply.id, reason: "" });
                            setShowReportModal(true);
                          }}>
                            {isArabic ? "بلاغ" : "Report"}
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Nested Replies */}
                  {replies.filter(r => r.parent_reply_id === reply.id).length > 0 && (
                    <>
                      <button 
                        className="toggle-comments-btn"
                        onClick={() => setExpandedReplies(prev => ({ ...prev, [reply.id]: !prev[reply.id] }))}
                      >
                        {expandedReplies[reply.id] ? '▼' : '▶'} 
                        {expandedReplies[reply.id] 
                          ? (isArabic ? 'إخفاء' : 'Hide') 
                          : (isArabic ? 'عرض' : 'Show')
                        } {replies.filter(r => r.parent_reply_id === reply.id).length} 
                        {isArabic ? 'تعليق' : 'comment(s)'}
                      </button>
                      {expandedReplies[reply.id] && (
                        <div className="nested-replies">
                          {replies.filter(r => r.parent_reply_id === reply.id).map(nestedReply => (
                            <div key={nestedReply.id} className="nested-reply-card">
                              <div className="reply-header">
                                <strong>{nestedReply.author_name}</strong>
                                <span>{timeAgo(nestedReply.created_at, isArabic)}</span>
                                {currentUser && (currentUser.id === nestedReply.user_id || currentUser.role === 'Admin') && (
                                  <div className="nested-reply-actions">
                                    <button className="edit-btn-tiny" onClick={() => {
                                      setEditReplyText(nestedReply.content);
                                      setEditingReply(nestedReply.id);
                                    }}>
                                      {isArabic ? "تعديل" : "Edit"}
                                    </button>
                                    <button className="delete-btn-tiny" onClick={() => setDeletingReply(nestedReply.id)}>
                                      {isArabic ? "حذف" : "Delete"}
                                    </button>
                                  </div>
                                )}
                              </div>
                              {editingReply === nestedReply.id ? (
                                <div className="edit-nested-reply-form">
                                  <RichTextEditor
                                    value={editReplyText}
                                    onChange={setEditReplyText}
                                    placeholder={isArabic ? "تعديل التعليق" : "Edit comment"}
                                  />
                                  <div className="edit-actions">
                                    <button onClick={() => handleEditReply(nestedReply.id)} className="btn-save">{isArabic ? "حفظ" : "Save"}</button>
                                    <button onClick={() => setEditingReply(null)} className="btn-cancel">{isArabic ? "إلغاء" : "Cancel"}</button>
                                  </div>
                                </div>
                              ) : (
                                <div className="reply-content">{nestedReply.content.replace(/<[^>]*>/g, '')}</div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                  
                  {/* Nested Comment Form */}
                  {replyingTo === reply.id && (
                    <div className="nested-reply-form">
                      <RichTextEditor
                        value={nestedReplyText}
                        onChange={setNestedReplyText}
                        placeholder={isArabic ? "اكتب تعليقك..." : "Write your comment..."}
                      />
                      <div className="nested-reply-actions">
                        <button onClick={() => handleNestedReply(reply.id)} className="btn-primary">
                          {isArabic ? "إرسال التعليق" : "Post Comment"}
                        </button>
                        <button onClick={() => setReplyingTo(null)} className="btn-cancel">
                          {isArabic ? "إلغاء" : "Cancel"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Reply Form */}
          {!topic.locked ? (
            <div className="reply-form">
              <h3>{isArabic ? "أضف رداً" : "Add a Reply"}</h3>
              <form onSubmit={handleSubmitReply}>
                <div className="reply-input-container">
                  <RichTextEditor
                    value={replyText}
                    onChange={handleReplyTextChange}
                    placeholder={isArabic ? "اكتب ردك على الموضوع... (استخدم @اسم_المستخدم للإشارة)" : "Write your reply to the topic... (Use @username to mention)"}
                  />
                  {showMentions && mentionSuggestions.length > 0 && (
                    <div className="mention-suggestions">
                      {mentionSuggestions.map((user) => (
                        <div 
                          key={user.id} 
                          className="mention-item"
                          onClick={() => handleMentionSelect(user)}
                        >
                          <strong>@{user.name}</strong>
                          <span>{user.role}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <button type="submit" className="btn-primary" style={{ marginTop: '10px' }}>
                  {isArabic ? "إرسال الرد" : "Post Reply"}
                </button>
              </form>
            </div>
          ) : (
            <div className="locked-message">
              <p> {isArabic ? "هذا الموضوع مقفل. لا يمكن إضافة ردود جديدة." : "This topic is locked. No new replies can be added."}</p>
            </div>
          )}
          </div>
        )}

        {/* Questions Section */}
        {activeTab === 'questions' && (
          <div className="questions-section">
            <h2>{isArabic ? 'الأسئلة حول هذا الموضوع' : 'Questions About This Topic'} ({questions.length})</h2>

            {questions.length === 0 ? (
              <p className="no-questions">{isArabic ? 'لا توجد أسئلة بعد. كن أول من يسأل!' : 'No questions yet. Be the first to ask!'}</p>
            ) : (
              <div className="questions-list">
                {questions.map((question: any) => (
                  <div key={question.id} className="question-card">
                    <div className="question-header">
                      <strong>{question.author_name}</strong>
                      <span>{timeAgo(question.created_at, isArabic)}</span>
                      {currentUser && (currentUser.id === question.user_id || currentUser.role === 'Admin') && (
                        <div className="question-actions">
                          <button className="edit-btn-small" onClick={() => {
                            setEditQuestionText(question.question);
                            setEditingQuestion(question.id);
                          }}>
                            {isArabic ? "تعديل" : "Edit"}
                          </button>
                          <button className="delete-btn-small" onClick={() => setDeletingQuestion(question.id)}>
                            {isArabic ? "حذف" : "Delete"}
                          </button>
                        </div>
                      )}
                    </div>
                    {editingQuestion === question.id ? (
                      <div className="edit-question-form">
                        <RichTextEditor
                          value={editQuestionText}
                          onChange={setEditQuestionText}
                          placeholder={isArabic ? "تعديل السؤال" : "Edit question"}
                        />
                        <div className="edit-actions">
                          <button onClick={() => handleEditQuestion(question.id)} className="btn-save">{isArabic ? "حفظ" : "Save"}</button>
                          <button onClick={() => setEditingQuestion(null)} className="btn-cancel">{isArabic ? "إلغاء" : "Cancel"}</button>
                        </div>
                      </div>
                    ) : (
                      <div className="question-content" dangerouslySetInnerHTML={{ __html: question.question }} />
                    )}
                    <div className="answers-section">
                      <h4>{isArabic ? 'الإجابات' : 'Answers'} ({(answers[question.id] || []).length})</h4>
                      {(answers[question.id] || []).map((answer: any) => (
                        <div key={answer.id} className="answer-card">
                          <div className="answer-header">
                            <strong>{answer.author_name}</strong>
                            <span>{timeAgo(answer.created_at, isArabic)}</span>
                            {currentUser && (currentUser.id === answer.user_id || currentUser.role === 'Admin') && (
                              <div className="answer-actions">
                                <button className="edit-btn-small" onClick={() => {
                                  setEditAnswerText(answer.answer);
                                  setEditingAnswer(answer.id);
                                }}>
                                  {isArabic ? "تعديل" : "Edit"}
                                </button>
                                <button className="delete-btn-small" onClick={() => setDeletingAnswer(answer.id)}>
                                  {isArabic ? "حذف" : "Delete"}
                                </button>
                              </div>
                            )}
                          </div>
                          {editingAnswer === answer.id ? (
                            <div className="edit-answer-form">
                              <RichTextEditor
                                value={editAnswerText}
                                onChange={setEditAnswerText}
                                placeholder={isArabic ? "تعديل الإجابة" : "Edit answer"}
                              />
                              <div className="edit-actions">
                                <button onClick={() => handleEditAnswer(answer.id)} className="btn-save">{isArabic ? "حفظ" : "Save"}</button>
                                <button onClick={() => setEditingAnswer(null)} className="btn-cancel">{isArabic ? "إلغاء" : "Cancel"}</button>
                              </div>
                            </div>
                          ) : (
                            <div className="answer-content" dangerouslySetInnerHTML={{ __html: answer.answer }} />
                          )}
                        </div>
                      ))}
                      {currentUser && (
                        <AnswerForm 
                          questionId={question.id} 
                          onSubmit={handleAnswerQuestion} 
                          isArabic={isArabic} 
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Question Form */}
            {!topic.locked ? (
              <div className="question-form">
                <h3>{isArabic ? 'اطرح سؤالاً' : 'Ask a Question'}</h3>
                <form onSubmit={handleSubmitQuestion}>
                  <RichTextEditor
                    value={questionText}
                    onChange={setQuestionText}
                    placeholder={isArabic ? 'اطرح سؤالك حول هذا الموضوع... (استخدم @ للإشارة)' : 'Ask your question about this topic... (Use @ to mention)'}
                  />
                  <button type="submit" className="btn-primary" style={{ marginTop: '10px' }}>
                    {isArabic ? 'طرح السؤال' : 'Post Question'}
                  </button>
                </form>
              </div>
            ) : (
              <div className="locked-message">
                <p> {isArabic ? 'هذا الموضوع مقفل. لا يمكن إضافة أسئلة جديدة.' : 'This topic is locked. No new questions can be added.'}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Report Modal */}
      {showReportModal && (
        <div className="modal-overlay" onClick={() => setShowReportModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>{isArabic ? "إبلاغ عن محتوى" : "Report Content"}</h3>
            <textarea
              value={reportData.reason}
              onChange={(e) => setReportData({ ...reportData, reason: e.target.value })}
              placeholder={isArabic ? "سبب البلاغ..." : "Reason for report..."}
              rows={4}
            />
            <div className="modal-actions">
              <button onClick={handleReport} className="btn-primary">{isArabic ? "إرسال" : "Submit"}</button>
              <button onClick={() => setShowReportModal(false)} className="btn-cancel">{isArabic ? "إلغاء" : "Cancel"}</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Topic Modal */}
      {deletingTopic && (
        <div className="modal-overlay" onClick={() => setDeletingTopic(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{maxWidth: '400px', textAlign: 'center'}}>
            <div className="modal-header">
              <h2>{isArabic ? "تأكيد الحذف" : "Confirm Delete"}</h2>
              <button className="close-btn" onClick={() => setDeletingTopic(false)}>×</button>
            </div>
            <p style={{margin: '20px 0', fontSize: '16px'}}>
              {isArabic ? "هل تريد حذف هذا الموضوع؟" : "Delete this topic?"}
            </p>
            <div className="modal-actions" style={{justifyContent: 'center', gap: '10px'}}>
              <button onClick={handleDeleteTopic} className="btn-primary" style={{background: '#E53935'}}>
                {isArabic ? "حذف" : "Delete"}
              </button>
              <button onClick={() => setDeletingTopic(false)} className="btn-cancel">
                {isArabic ? "إلغاء" : "Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Reply Modal */}
      {deletingReply && (
        <div className="modal-overlay" onClick={() => setDeletingReply(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{maxWidth: '400px', textAlign: 'center'}}>
            <div className="modal-header">
              <h2>{isArabic ? "تأكيد الحذف" : "Confirm Delete"}</h2>
              <button className="close-btn" onClick={() => setDeletingReply(null)}>×</button>
            </div>
            <p style={{margin: '20px 0', fontSize: '16px'}}>
              {isArabic ? "هل تريد حذف هذا الرد؟" : "Delete this reply?"}
            </p>
            <div className="modal-actions" style={{justifyContent: 'center', gap: '10px'}}>
              <button onClick={() => handleDeleteReply(deletingReply)} className="btn-primary" style={{background: '#E53935'}}>
                {isArabic ? "حذف" : "Delete"}
              </button>
              <button onClick={() => setDeletingReply(null)} className="btn-cancel">
                {isArabic ? "إلغاء" : "Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Question Modal */}
      {deletingQuestion && (
        <div className="modal-overlay" onClick={() => setDeletingQuestion(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{maxWidth: '400px', textAlign: 'center'}}>
            <div className="modal-header">
              <h2>{isArabic ? "تأكيد الحذف" : "Confirm Delete"}</h2>
              <button className="close-btn" onClick={() => setDeletingQuestion(null)}>×</button>
            </div>
            <p style={{margin: '20px 0', fontSize: '16px'}}>
              {isArabic ? "هل تريد حذف هذا السؤال؟" : "Delete this question?"}
            </p>
            <div className="modal-actions" style={{justifyContent: 'center', gap: '10px'}}>
              <button onClick={() => handleDeleteQuestion(deletingQuestion)} className="btn-primary" style={{background: '#E53935'}}>
                {isArabic ? "حذف" : "Delete"}
              </button>
              <button onClick={() => setDeletingQuestion(null)} className="btn-cancel">
                {isArabic ? "إلغاء" : "Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Answer Modal */}
      {deletingAnswer && (
        <div className="modal-overlay" onClick={() => setDeletingAnswer(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{maxWidth: '400px', textAlign: 'center'}}>
            <div className="modal-header">
              <h2>{isArabic ? "تأكيد الحذف" : "Confirm Delete"}</h2>
              <button className="close-btn" onClick={() => setDeletingAnswer(null)}>×</button>
            </div>
            <p style={{margin: '20px 0', fontSize: '16px'}}>
              {isArabic ? "هل تريد حذف هذه الإجابة؟" : "Delete this answer?"}
            </p>
            <div className="modal-actions" style={{justifyContent: 'center', gap: '10px'}}>
              <button onClick={() => handleDeleteAnswer(deletingAnswer)} className="btn-primary" style={{background: '#E53935'}}>
                {isArabic ? "حذف" : "Delete"}
              </button>
              <button onClick={() => setDeletingAnswer(null)} className="btn-cancel">
                {isArabic ? "إلغاء" : "Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Answer Form Component
const AnswerForm: React.FC<{questionId: number, onSubmit: (id: number, text: string) => void, isArabic: boolean}> = ({ questionId, onSubmit, isArabic }) => {
  const [answerText, setAnswerText] = useState("");
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(questionId, answerText);
    setAnswerText("");
  };
  
  return (
    <form onSubmit={handleSubmit} className="answer-form">
      <RichTextEditor
        value={answerText}
        onChange={setAnswerText}
        placeholder={isArabic ? 'اكتب إجابتك...' : 'Write your answer...'}
      />
      <button type="submit" className="btn-answer">
        {isArabic ? 'إرسال الإجابة' : 'Post Answer'}
      </button>
    </form>
  );
};

export default TopicDetail;
