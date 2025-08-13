// Vercel serverless function for health check
export default function handler(req, res) {
  res.status(200).json({ ok: true, message: 'Adonai Farm API is running' });
}