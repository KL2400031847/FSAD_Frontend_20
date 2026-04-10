import React, { useState } from "react";
import {
  Routes,
  Route,
  Link,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";

function App() {
  // Global app state (dummy in-memory data)
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [records, setRecords] = useState([
    {
      id: 1,
      patientName: "Rohit",
      doctorName: "Dr. Mehta",
      summary: "Follow-up for fever. Stable.",
      labReport: "CBC normal. CRP slightly elevated.",
      date: "2025-11-10",
    },
  ]);

  const [user, setUser] = useState({
    role: "",
    name: "",
  });

  const navigate = useNavigate();

  const handleLogin = (role, name) => {
    setUser({ role, name });
    if (role === "admin") navigate("/admin");
    if (role === "doctor") navigate("/doctor");
    if (role === "patient") navigate("/patient");
    if (role === "pharmacist") navigate("/pharmacist");
  };

  const handleLogout = () => {
    setUser({ role: "", name: "" });
    navigate("/");
  };

  // Patient books appointment
  const bookAppointment = (data) => {
    const newAppointment = {
      id: Date.now(),
      ...data,
      status: "Pending",
    };
    setAppointments((prev) => [...prev, newAppointment]);
  };

  // Admin updates appointment status (e.g., approved/cancelled)
  const updateAppointmentStatus = (appointmentId, status) => {
    setAppointments((prev) =>
      prev.map((a) =>
        a.id === appointmentId
          ? {
              ...a,
              status,
            }
          : a
      )
    );
  };

  // Doctor creates e-prescription
  const createPrescription = (data) => {
    const newPrescription = {
      id: Date.now(),
      ...data,
      status: "Pending",
    };
    setPrescriptions((prev) => [...prev, newPrescription]);

    // Optional: also add/update a record
    const newRecord = {
      id: Date.now(),
      patientName: data.patientName,
      doctorName: data.doctorName,
      summary: data.diagnosis || "Prescription generated",
      labReport: data.labReport || "N/A",
      date: new Date().toISOString().slice(0, 10),
    };
    setRecords((prev) => [...prev, newRecord]);
  };

  // Pharmacist updates prescription status
  const updatePrescriptionStatus = (prescriptionId, status) => {
    setPrescriptions((prev) =>
      prev.map((p) =>
        p.id === prescriptionId
          ? {
              ...p,
              status,
            }
          : p
      )
    );
  };

  return (
    <div className="app-container">
      <Header user={user} onLogout={handleLogout} />
      <NavBar />

      <main className="main-content">
        <Routes>
          <Route
            path="/"
            element={<Home onLogin={handleLogin} currentUser={user} />}
          />
          <Route
            path="/admin"
            element={
              <RequireRole role="admin" user={user}>
                <AdminDashboard
                  appointments={appointments}
                  prescriptions={prescriptions}
                  usersSummary={user}
                  onUpdateAppointmentStatus={updateAppointmentStatus}
                />
              </RequireRole>
            }
          />
          <Route
            path="/doctor"
            element={
              <RequireRole role="doctor" user={user}>
                <DoctorDashboard
                  user={user}
                  appointments={appointments}
                  onCreatePrescription={createPrescription}
                />
              </RequireRole>
            }
          />
          <Route
            path="/patient"
            element={
              <RequireRole role="patient" user={user}>
                <PatientDashboard
                  user={user}
                  appointments={appointments}
                  prescriptions={prescriptions}
                  records={records}
                  onBookAppointment={bookAppointment}
                />
              </RequireRole>
            }
          />
          <Route
            path="/pharmacist"
            element={
              <RequireRole role="pharmacist" user={user}>
                <PharmacistDashboard
                  prescriptions={prescriptions}
                  onUpdatePrescriptionStatus={updatePrescriptionStatus}
                />
              </RequireRole>
            }
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>

      <footer className="footer">
        FEDF-PS20 • Online Medical System • Vite + React demo
      </footer>
    </div>
  );
}

/* --------- Shared Components ---------- */

function Header({ user, onLogout }) {
  const location = useLocation();

  return (
    <header className="header">
      <div className="logo">Online Medical System</div>
      <div className="header-right">
        {user.role ? (
          <>
            <span className="user-chip">
              Logged in as <strong>{user.name || user.role}</strong> (
              {user.role})
            </span>
            <button onClick={onLogout} className="btn-secondary">
              Logout
            </button>
          </>
        ) : location.pathname !== "/" ? (
          <Link to="/" className="btn-secondary">
            Go to Login
          </Link>
        ) : null}
      </div>
    </header>
  );
}

function NavBar() {
  return (
    <nav className="nav-bar">
      <Link to="/">Home / Login</Link>
      <Link to="/admin">Admin</Link>
      <Link to="/doctor">Doctor</Link>
      <Link to="/patient">Patient</Link>
      <Link to="/pharmacist">Pharmacist</Link>
    </nav>
  );
}

// Simple role guard
function RequireRole({ role, user, children }) {
  if (!user.role) {
    return <Navigate to="/" replace />;
  }
  if (user.role !== role) {
    return <h2 className="error-text">Access denied for this role.</h2>;
  }
  return children;
}

/* --------- Home / Login ---------- */

function Home({ onLogin, currentUser }) {
  const [role, setRole] = useState(currentUser.role || "patient");
  const [name, setName] = useState(currentUser.name || "");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!role) return;
    onLogin(role, name || role.toUpperCase());
  };

  return (
    <section className="card">
      <h2>Welcome to Online Medical System</h2>
      <p>Select a role to continue:</p>

      <form onSubmit={handleSubmit} className="form">
        <label>
          Your Name (optional for demo)
          <input
            type="text"
            placeholder="Enter your name..."
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>

        <label>
          Role
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="admin">Admin</option>
            <option value="doctor">Doctor</option>
            <option value="patient">Patient</option>
            <option value="pharmacist">Pharmacist</option>
          </select>
        </label>

        <button type="submit" className="btn-primary">
          Continue as {role.toUpperCase()}
        </button>
      </form>

      <div className="info-grid">
        <div className="info-box">
          <h3>Admin</h3>
          <p>Manage user accounts, platform settings, and data security.</p>
        </div>
        <div className="info-box">
          <h3>Doctor</h3>
          <p>View appointments, conduct virtual consultations, create e-Rx.</p>
        </div>
        <div className="info-box">
          <h3>Patient</h3>
          <p>Book virtual appointments, view records and lab reports.</p>
        </div>
        <div className="info-box">
          <h3>Pharmacist</h3>
          <p>View and dispense e-prescriptions and track orders.</p>
        </div>
      </div>
    </section>
  );
}

/* --------- Admin Dashboard ---------- */

function AdminDashboard({
  appointments,
  prescriptions,
  usersSummary,
  onUpdateAppointmentStatus,
}) {
  return (
    <section className="card">
      <h2>Admin Dashboard</h2>
      <p>Manage platform, monitor activity and data overview.</p>

      <div className="stats-grid">
        <div className="stat-box">
          <h3>Total Appointments</h3>
          <p>{appointments.length}</p>
        </div>
        <div className="stat-box">
          <h3>Total Prescriptions</h3>
          <p>{prescriptions.length}</p>
        </div>
        <div className="stat-box">
          <h3>Current Logged-in Role</h3>
          <p>{usersSummary.role || "None"}</p>
        </div>
      </div>

      <h3>All Appointments</h3>
      {appointments.length === 0 ? (
        <p>No appointments yet.</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Patient</th>
              <th>Doctor</th>
              <th>Date</th>
              <th>Time</th>
              <th>Reason</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((a) => (
              <tr key={a.id}>
                <td>{a.patientName}</td>
                <td>{a.doctorName}</td>
                <td>{a.date}</td>
                <td>{a.time}</td>
                <td>{a.reason}</td>
                <td>{a.status}</td>
                <td>
                  <select
                    value={a.status}
                    onChange={(e) =>
                      onUpdateAppointmentStatus(a.id, e.target.value)
                    }
                  >
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}

/* --------- Doctor Dashboard ---------- */

function DoctorDashboard({ user, appointments, onCreatePrescription }) {
  const myAppointments = appointments.filter(
    (a) =>
      a.doctorName.toLowerCase() === (user.name || "").toLowerCase() ||
      a.doctorName.toLowerCase() === "dr. mehta" // demo
  );

  const [form, setForm] = useState({
    appointmentId: "",
    patientName: "",
    doctorName: user.name || "Doctor",
    medication: "",
    dosage: "",
    instructions: "",
    diagnosis: "",
    labReport: "",
  });

  const handleSelectAppointment = (appointment) => {
    setForm((prev) => ({
      ...prev,
      appointmentId: appointment.id,
      patientName: appointment.patientName,
      doctorName: appointment.doctorName,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.patientName || !form.medication) return;
    onCreatePrescription(form);
    setForm((prev) => ({
      ...prev,
      appointmentId: "",
      patientName: "",
      medication: "",
      dosage: "",
      instructions: "",
      diagnosis: "",
      labReport: "",
    }));
  };

  return (
    <section className="card">
      <h2>Doctor Dashboard</h2>
      <p>
        Welcome, <strong>{user.name || "Doctor"}</strong>. Manage your
        appointments and e-prescriptions.
      </p>

      <h3>My Appointments</h3>
      {myAppointments.length === 0 ? (
        <p>No appointments assigned.</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Patient</th>
              <th>Date</th>
              <th>Time</th>
              <th>Reason</th>
              <th>Status</th>
              <th>Select</th>
            </tr>
          </thead>
          <tbody>
            {myAppointments.map((a) => (
              <tr key={a.id}>
                <td>{a.patientName}</td>
                <td>{a.date}</td>
                <td>{a.time}</td>
                <td>{a.reason}</td>
                <td>{a.status}</td>
                <td>
                  <button
                    className="btn-small"
                    type="button"
                    onClick={() => handleSelectAppointment(a)}
                  >
                    Use for Rx
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <h3>Create e-Prescription</h3>
      <form onSubmit={handleSubmit} className="form">
        <div className="form-row-2">
          <label>
            Patient Name
            <input
              type="text"
              value={form.patientName}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, patientName: e.target.value }))
              }
              required
            />
          </label>
          <label>
            Doctor Name
            <input
              type="text"
              value={form.doctorName}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, doctorName: e.target.value }))
              }
              required
            />
          </label>
        </div>

        <label>
          Diagnosis / Notes
          <textarea
            value={form.diagnosis}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, diagnosis: e.target.value }))
            }
            placeholder="Diagnosis summary..."
          />
        </label>

        <label>
          Lab Report Summary (optional)
          <textarea
            value={form.labReport}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, labReport: e.target.value }))
            }
            placeholder="Key lab findings..."
          />
        </label>

        <div className="form-row-2">
          <label>
            Medication
            <input
              type="text"
              value={form.medication}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, medication: e.target.value }))
              }
              required
            />
          </label>
          <label>
            Dosage
            <input
              type="text"
              value={form.dosage}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, dosage: e.target.value }))
              }
              placeholder="e.g., 1-0-1 for 5 days"
            />
          </label>
        </div>

        <label>
          Instructions
          <textarea
            value={form.instructions}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, instructions: e.target.value }))
            }
            placeholder="When to take, with food, etc."
          />
        </label>

        <button type="submit" className="btn-primary">
          Save e-Prescription
        </button>
      </form>
    </section>
  );
}

/* --------- Patient Dashboard ---------- */

function PatientDashboard({
  user,
  appointments,
  prescriptions,
  records,
  onBookAppointment,
}) {
  const [form, setForm] = useState({
    patientName: user.name || "",
    doctorName: "",
    date: "",
    time: "",
    reason: "",
  });

  const myNameLower = (user.name || "").toLowerCase();

  const myAppointments = appointments.filter(
    (a) => a.patientName.toLowerCase() === myNameLower
  );

  const myPrescriptions = prescriptions.filter(
    (p) => p.patientName.toLowerCase() === myNameLower
  );

  const myRecords = records.filter(
    (r) => r.patientName.toLowerCase() === myNameLower
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.patientName || !form.doctorName) return;
    onBookAppointment(form);
    setForm((prev) => ({
      ...prev,
      doctorName: "",
      date: "",
      time: "",
      reason: "",
    }));
  };

  return (
    <section className="card">
      <h2>Patient Dashboard</h2>
      <p>
        Hello, <strong>{user.name || "Patient"}</strong>. Book appointments and
        view your records.
      </p>

      <h3>Book Virtual Appointment</h3>
      <form onSubmit={handleSubmit} className="form">
        <div className="form-row-2">
          <label>
            Your Name
            <input
              type="text"
              value={form.patientName}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, patientName: e.target.value }))
              }
              required
            />
          </label>
          <label>
            Doctor Name
            <input
              type="text"
              value={form.doctorName}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, doctorName: e.target.value }))
              }
              placeholder="e.g., Dr. Mehta"
              required
            />
          </label>
        </div>

        <div className="form-row-2">
          <label>
            Date
            <input
              type="date"
              value={form.date}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, date: e.target.value }))
              }
              required
            />
          </label>
          <label>
            Time
            <input
              type="time"
              value={form.time}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, time: e.target.value }))
              }
              required
            />
          </label>
        </div>

        <label>
          Reason
          <textarea
            value={form.reason}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, reason: e.target.value }))
            }
            placeholder="Short description of your issue"
          />
        </label>

        <button type="submit" className="btn-primary">
          Book Appointment
        </button>
      </form>

      <h3>My Appointments</h3>
      {myAppointments.length === 0 ? (
        <p>No appointments yet.</p>
      ) : (
        <ul className="list">
          {myAppointments.map((a) => (
            <li key={a.id} className="list-item">
              <strong>{a.date}</strong> at {a.time} with {a.doctorName} –{" "}
              {a.reason} <span className="tag">{a.status}</span>
            </li>
          ))}
        </ul>
      )}

      <h3>My e-Prescriptions</h3>
      {myPrescriptions.length === 0 ? (
        <p>No prescriptions yet.</p>
      ) : (
        <ul className="list">
          {myPrescriptions.map((p) => (
            <li key={p.id} className="list-item">
              <strong>{p.medication}</strong> ({p.dosage}) – {p.instructions}{" "}
              <br />
              <small>
                By {p.doctorName} | Status: <span className="tag">{p.status}</span>
              </small>
            </li>
          ))}
        </ul>
      )}

      <h3>My Medical Records & Lab Reports</h3>
      {myRecords.length === 0 ? (
        <p>No records found yet.</p>
      ) : (
        <ul className="list">
          {myRecords.map((r) => (
            <li key={r.id} className="list-item">
              <strong>{r.date}</strong> with {r.doctorName}
              <br />
              <em>Summary:</em> {r.summary}
              <br />
              <em>Lab:</em> {r.labReport}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

/* --------- Pharmacist Dashboard ---------- */

function PharmacistDashboard({ prescriptions, onUpdatePrescriptionStatus }) {
  return (
    <section className="card">
      <h2>Pharmacist Dashboard</h2>
      <p>View e-prescriptions and update their dispensing status.</p>

      {prescriptions.length === 0 ? (
        <p>No prescriptions available.</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Patient</th>
              <th>Doctor</th>
              <th>Medication</th>
              <th>Dosage</th>
              <th>Instructions</th>
              <th>Status</th>
              <th>Update</th>
            </tr>
          </thead>
          <tbody>
            {prescriptions.map((p) => (
              <tr key={p.id}>
                <td>{p.patientName}</td>
                <td>{p.doctorName}</td>
                <td>{p.medication}</td>
                <td>{p.dosage}</td>
                <td>{p.instructions}</td>
                <td>{p.status}</td>
                <td>
                  <select
                    value={p.status}
                    onChange={(e) =>
                      onUpdatePrescriptionStatus(p.id, e.target.value)
                    }
                  >
                    <option value="Pending">Pending</option>
                    <option value="Ready">Ready</option>
                    <option value="Dispensed">Dispensed</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <h3>Note</h3>
      <p className="hint-text">
        In a real system, this screen would be integrated with inventory,
        payment, and SMS/Email notifications.
      </p>
    </section>
  );
}

export default App;
