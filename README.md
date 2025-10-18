# 🛩️ UTM Simulation & Path Planning

A full-stack *UAV (Drone) simulation system* that models UAV movement on a real or grid-based map, plans optimal paths, and streams real-time flight steps to a frontend dashboard. Built with *Python, Node.js, Express, MongoDB, and React*, this project replicates key features of UAV path planning including *simulation, real-time updates, and visualization*.

---

## 📸 Demo

<img width="1919" height="1079" alt="Image" src="https://github.com/user-attachments/assets/94360900-d9d0-4c0c-aa6f-df6104e6b12d" />

<img src="https://github.com/user-attachments/assets/2b859f49-e100-49c8-9bd1-f796dee57d90" width="1919" height="1079">

---

## ⚡ Tech Stack

**Backend**

* Node.js – JavaScript runtime
* Express.js – Web framework
* Mongoose – MongoDB object modeling

**Frontend**

* React – UI library
* BootStrap – Styling framework
* leafletJs - for real time map visualization

**Simulation**

* Python 3 – Simulation scripts
* NumPy – Numerical computations
* Matplotlib – Visualization
* NetworkX – Graph & path planning

**Database & Cloud Services**

* MongoDB Atlas – Cloud database

---

## ✨ Features

* 🛰️ UAV Path Simulation – Step-by-step UAV movement in a grid or map
* 🗺️ Path Planning Algorithm – Computes optimal paths avoiding no-fly zones
* 🌐 Real-time Updates – Server-Sent Events (SSE) streaming to frontend
* 🔄 Backend API – `POST /step`, `GET /latest`, `GET /steps`, `GET /stream`
* 🖥️ Frontend Visualization – Interactive map displaying UAV paths
* 📦 Sample Data Support – Can run frontend without backend for testing
* 💻 Responsive UI – Works on desktop and mobile

---

## 📂 Project Structure

```
UAV_Simulation/
├── backend/
│   ├── src/
│   │   ├── controllers/    # API controllers for flight steps
│   │   ├── db/             # Database connection (MongoDB)
│   │   ├── models/         # MongoDB schemas (FlightStep)
│   │   ├── routes/         # Express routes
│   │   ├── utils/          # Utility functions
│   │   ├── app.js          # Express app setup
│   │   └── index.js        # Entry point
│   ├── package.json
│   └── package-lock.json
├── frontend/
│   ├── src/
│   │   ├── assets/         # Images, icons
│   │   ├── components/     # UI components (controls, map, simulation view)
│   │   ├── App.jsx         # Main app component
│   │   ├── main.jsx        # React entry point
│   │   ├── index.css
│   │   └── app.css
│   ├── package.json
│   └── public/
├── UAV_Traffic/
│   ├── scripts/            # Python simulation scripts (path planning logic)
│   └── results/            # Simulation outputs
├── requirements.txt        # Python dependencies
├── venv/                   # Python virtual environment (optional)
└── README.md
```

---

## ⚙️ Installation & Setup

**1. Clone the repository**

```bash
git clone https://github.com/your-username/uav-simulation.git
cd uav-simulation
```

**2. Setup Backend**

```bash
cd backend
npm install
```

**3. Create a `.env` file** in `backend/` (use `.env.example` as template)

```env
# MongoDB Atlas
MONGO_URI=your_mongodb_connection_string

# Express server port
PORT=5000
```

**4. Run the backend server**

```bash
npm run dev
```

**5. Setup Python Simulation**

```bash
python3 -m venv venv      # optional if not already created
source venv/bin/activate
pip install -r ../requirements.txt
cd UAV_Traffic
python scripts/demo.py
```

**6. Run Frontend**

```bash
cd frontend
npm install
npm run dev
```

Open your browser at: `http://localhost:5173`

---

## 🛠️ Future Enhancements

* ✅ 3D visualization of UAV flight
* ✅ Real GPS coordinates integration
* ✅ Historical mission storage and replay

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!
Feel free to fork this repo and submit a pull request.

---

## 📜 License

This project is licensed under the *MIT License* – free to use, modify, and distribute.

