// index.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import { MongoClient } from 'mongodb';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

// MongoDB connection
const client = new MongoClient(process.env.MONGODB_URI);
let db;

client.connect().then(() => {
  db = client.db('reservas');
  console.log('✅ Conectado a MongoDB');
});

// Actualizar una reserva desde Outlook
app.put('/api/reservas/outlook/:eventId', async (req, res) => {
  const { eventId } = req.params;
  const updated = req.body;
  try {
    const result = await db.collection('reservas').findOneAndUpdate(
      { outlookEventId: eventId },
      { $set: updated },
      { returnDocument: 'after' }
    );
    if (!result.value) return res.status(404).json({ message: 'Reserva no encontrada' });
    res.json(result.value);
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar reserva' });
  }
});

// Eliminar una reserva desde Outlook
app.delete('/api/reservas/outlook/:eventId', async (req, res) => {
  const { eventId } = req.params;
  try {
    const result = await db.collection('reservas').deleteOne({ outlookEventId: eventId });
    if (result.deletedCount === 0) return res.status(404).json({ message: 'Reserva no encontrada' });
    res.json({ message: 'Reserva eliminada correctamente' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar reserva' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Backend escuchando en el puerto ${PORT}`);
});