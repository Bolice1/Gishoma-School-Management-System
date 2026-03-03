const { v4: uuidv4 } = require("uuid");
const { query } = require("../config/database");

function getSchoolId(req) { return req.schoolId; }

async function list(req, res, next) {
  try {
    const schoolId = getSchoolId(req);
    const rows = await query(
      "SELECT m.*, u.first_name, u.last_name, s.is_prefect FROM chat_messages m JOIN users u ON m.user_id = u.id LEFT JOIN students s ON s.user_id = u.id WHERE m.school_id = ? AND m.is_deleted = 0 ORDER BY m.created_at ASC LIMIT 200",
      [schoolId]
    );
    res.json(rows);
  } catch(err) { next(err); }
}

async function create(req, res, next) {
  try {
    const schoolId = getSchoolId(req);
    const { content } = req.body;
    if (!content || !content.trim()) return res.status(400).json({ error: "Message cannot be empty" });
    
    // Check message length
    if (content.trim().length > 1000) {
      return res.status(400).json({ error: "Message cannot exceed 1000 characters" });
    }
    
    // Strip HTML tags from content
    const sanitizedContent = content.trim().replace(/<[^>]*>/g, '');
    
    const id = uuidv4();
    await query(
      "INSERT INTO chat_messages (id, school_id, user_id, content) VALUES (?, ?, ?, ?)",
      [id, schoolId, req.userId, sanitizedContent]
    );
    const created = await query(
      "SELECT m.*, u.first_name, u.last_name, s.is_prefect FROM chat_messages m JOIN users u ON m.user_id = u.id LEFT JOIN students s ON s.user_id = u.id WHERE m.id = ?",
      [id]
    );
    const io = req.app.get("io");
    if (io) io.to(schoolId).emit("chat_message", created[0]);
    res.status(201).json(created[0]);
  } catch(err) { next(err); }
}

async function deleteMessage(req, res, next) {
  try {
    const { id } = req.params;
    await query("UPDATE chat_messages SET is_deleted = 1 WHERE id = ? AND user_id = ?", [id, req.userId]);
    res.json({ message: "Deleted" });
  } catch(err) { next(err); }
}

module.exports = { list, create, deleteMessage };
