import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const DB_PATH = path.join(__dirname, 'data', 'db.json');

// Enable CORS and parse JSON with a large limit for base64 vehicle images
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Ensure database folder and file exist
function initializeDB() {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify({ vehicles: [] }, null, 2));
  }
}

initializeDB();

// Read database helper
function readDB() {
  try {
    const data = fs.readFileSync(DB_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading database:', error);
    return { vehicles: [] };
  }
}

// Write database helper
function writeDB(data) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing to database:', error);
    return false;
  }
}

// API Routes
app.get('/api/vehicles', (req, res) => {
  const db = readDB();
  res.json(db.vehicles || []);
});

app.post('/api/vehicles', (req, res) => {
  const db = readDB();
  const vehicles = db.vehicles || [];
  
  // Calculate next ID
  const nextId = vehicles.length > 0 ? Math.max(...vehicles.map(v => v.id)) + 1 : 1;
  
  const newVehicle = {
    id: nextId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...req.body
  };
  
  vehicles.unshift(newVehicle); // Add to the top
  db.vehicles = vehicles;
  
  if (writeDB(db)) {
    res.status(201).json(newVehicle);
  } else {
    res.status(500).json({ error: 'Failed to write to database' });
  }
});

app.put('/api/vehicles/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const db = readDB();
  const vehicles = db.vehicles || [];
  const index = vehicles.findIndex(v => v.id === id);
  
  if (index === -1) {
    return res.status(404).json({ error: 'Vehicle not found' });
  }
  
  const updatedVehicle = {
    ...vehicles[index],
    ...req.body,
    updatedAt: new Date().toISOString()
  };
  
  vehicles[index] = updatedVehicle;
  db.vehicles = vehicles;
  
  if (writeDB(db)) {
    res.json(updatedVehicle);
  } else {
    res.status(500).json({ error: 'Failed to write to database' });
  }
});

app.delete('/api/vehicles/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const db = readDB();
  let vehicles = db.vehicles || [];
  const index = vehicles.findIndex(v => v.id === id);
  
  if (index === -1) {
    return res.status(404).json({ error: 'Vehicle not found' });
  }
  
  vehicles.splice(index, 1);
  db.vehicles = vehicles;
  
  if (writeDB(db)) {
    res.json({ success: true, message: `Vehicle #${id} deleted successfully` });
  } else {
    res.status(500).json({ error: 'Failed to write to database' });
  }
});

// Serve frontend build output
app.use(express.static(path.join(__dirname, 'dist')));

// Fallback to index.html for React routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`======================================================`);
  console.log(`  VORA Vistoria local server running on port ${PORT}`);
  console.log(`  API base: http://localhost:${PORT}/api`);
  console.log(`  Serving web application: http://localhost:${PORT}`);
  console.log(`======================================================`);
});
