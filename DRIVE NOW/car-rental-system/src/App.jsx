import React, { useEffect, useMemo, useState } from 'react';
import { CarFront, Menu, X, ShieldCheck, UserRound, LogOut, LayoutDashboard, Users, CalendarDays, Plus, Pencil, Trash2, Search, CheckCircle2, Fuel, UsersRound, Gauge, ArrowRight, KeyRound, Mail, Lock, Phone, MapPin } from 'lucide-react';
import { read, write, seedData } from './utils/storage';

const ADMIN = { email: 'admin@easydrive.com', password: 'admin123' };
const money = n => `₹${Number(n).toLocaleString('en-IN')}`;
const id = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;
const defaultImage = 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1000&q=80';

export default function App() {
  const [page, setPage] = useState('home');
  const [session, setSession] = useState(() => read('session', null));
  const [users, setUsers] = useState(() => read('users'));
  const [cars, setCars] = useState(() => read('cars'));
  const [bookings, setBookings] = useState(() => read('bookings'));
  const [notice, setNotice] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => { seedData(); setCars(read('cars')); }, []);
  useEffect(() => { write('users', users); }, [users]);
  useEffect(() => { write('cars', cars); }, [cars]);
  useEffect(() => { write('bookings', bookings); }, [bookings]);
  useEffect(() => { write('session', session); }, [session]);

  const flash = msg => { setNotice(msg); window.setTimeout(() => setNotice(''), 3000); };
  const go = target => { setPage(target); setMobileOpen(false); window.scrollTo(0, 0); };
  const logout = () => { setSession(null); go('home'); flash('You have been logged out.'); };

  const login = (email, password, role) => {
    if (role === 'admin') {
      if (email.toLowerCase() !== ADMIN.email || password !== ADMIN.password) return { error: 'Incorrect admin email or password.' };
      const s = { role: 'admin', name: 'Administrator', email: ADMIN.email };
      setSession(s); go('admin'); flash('Welcome, administrator!'); return { ok: true };
    }
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (!user) return { error: 'Invalid email or password. Please check your details.' };
    setSession({ role: 'user', name: user.name, email: user.email });
    go('user'); flash(`Welcome back, ${user.name}!`); return { ok: true };
  };

  const signup = (name, email, password, phone) => {
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) return 'An account with this email already exists.';
    const next = [...users, { id: id(), name, email, password, phone }];
    setUsers(next);
    setSession({ role: 'user', name, email });
    go('user'); flash('Account created successfully!'); return '';
  };

  const createBooking = car => {
    if (!session || session.role !== 'user') { go('login'); flash('Please log in as a user to book a car.'); return; }
    const booking = { id: id(), carId: car.id, carName: car.name, userEmail: session.email, userName: session.name, price: car.price, date: new Date().toLocaleDateString('en-IN'), status: 'Confirmed' };
    setBookings(old => [booking, ...old]); flash(`${car.name} booked successfully!`); go('user');
  };

  const updateCar = car => {
    setCars(old => old.some(c => c.id === car.id) ? old.map(c => c.id === car.id ? car : c) : [car, ...old]);
    flash('Car details saved successfully.');
  };
  const removeCar = carId => {
    if (!window.confirm('Delete this car?')) return;
    setCars(old => old.filter(c => c.id !== carId)); flash('Car deleted.');
  };

  return <div className="app-shell">
    <header className="topbar">
      <div className="nav-wrap">
        <button className="brand" onClick={() => go('home')}><span className="brand-icon"><CarFront size={24}/></span><span>easy<span className="brand-accent">drive</span><small>CAR RENTALS</small></span></button>
        <button className="mobile-toggle" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu">{mobileOpen ? <X/> : <Menu/>}</button>
        <nav className={mobileOpen ? 'nav-links open' : 'nav-links'}>
          <button className={page === 'home' ? 'nav-active' : ''} onClick={() => go('home')}>Home</button>
          <button onClick={() => go('cars')}>Explore cars</button>
          {session?.role === 'admin' ? <button onClick={() => go('admin')}>Admin panel</button> : session?.role === 'user' ? <button onClick={() => go('user')}>My dashboard</button> : null}
          {!session ? <><button onClick={() => go('login')}>Log in</button><button className="nav-cta" onClick={() => go('signup')}>Sign up <ArrowRight size={15}/></button></> :
            <button className="nav-cta" onClick={logout}><LogOut size={15}/> Logout</button>}
        </nav>
      </div>
    </header>

    {notice && <div className="toast"><CheckCircle2 size={17}/>{notice}</div>}

    {page === 'home' && <Home cars={cars} go={go} book={createBooking}/>}
    {page === 'cars' && <CarsPage cars={cars} book={createBooking}/>}
    {page === 'login' && <AuthPage mode="login" login={login} go={go}/>}
    {page === 'signup' && <AuthPage mode="signup" signup={signup} go={go}/>}
    {page === 'admin' && (session?.role === 'admin' ? <AdminPage cars={cars} users={users} bookings={bookings} updateCar={updateCar} removeCar={removeCar}/> : <AccessDenied go={go}/>)}
    {page === 'user' && (session?.role === 'user' ? <UserPage session={session} cars={cars} bookings={bookings} cancel={bookingId => { setBookings(old => old.map(b => b.id === bookingId ? {...b, status: 'Cancelled'} : b)); flash('Booking cancelled.'); }} go={go}/> : <AccessDenied go={go}/>)}

    <footer className="footer"><div className="footer-inner"><div className="brand footer-brand"><span className="brand-icon"><CarFront size={22}/></span><span>easy<span className="brand-accent">drive</span><small>CAR RENTALS</small></span></div><p>Making every journey simple, comfortable and affordable.</p><span>© {new Date().getFullYear()} EasyDrive Rentals · Student project</span></div></footer>
  </div>;
}

function Home({cars, go, book}) {
  return <><section className="hero"><div className="hero-content"><div className="eyebrow"><span/> YOUR JOURNEY, YOUR WAY</div><h1>Find your drive.<br/><em>Feel the freedom.</em></h1><p>Choose from our collection of reliable cars and make every trip memorable. Easy booking, transparent prices, zero hassle.</p><div className="hero-actions"><button className="btn btn-primary" onClick={() => go('cars')}>Explore cars <ArrowRight size={17}/></button><button className="btn btn-outline-light" onClick={() => go('signup')}>Create an account</button></div><div className="hero-stats"><div><strong>{cars.length}+</strong><span>Cars available</span></div><div><strong>24/7</strong><span>Booking access</span></div><div><strong>100%</strong><span>Easy experience</span></div></div></div><div className="hero-visual"><div className="hero-glow"/><img src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1400&q=85" alt="Luxury sports car"/><div className="floating-card"><span className="float-icon"><CheckCircle2 size={18}/></span><span><b>Ready when you are</b><small>Simple & quick booking</small></span></div><div className="hero-label">DRIVE YOUR NEXT STORY</div></div></section>
    <section className="section container"><div className="section-heading"><div><div className="eyebrow dark">A CAR FOR EVERY PLAN</div><h2>Popular <em>rides</em></h2><p>Pick the perfect companion for your next adventure.</p></div><button className="text-link" onClick={() => go('cars')}>View all cars <ArrowRight size={16}/></button></div><div className="car-grid">{cars.slice(0,3).map(car => <CarCard key={car.id} car={car} book={book}/>)}</div></section>
    <section className="why-section"><div className="container why-grid"><div><div className="eyebrow dark">WHY EASYDRIVE</div><h2>Good trips start<br/>with <em>great choices.</em></h2><p className="muted">We keep renting straightforward, so you can spend less time planning and more time enjoying the road.</p></div><div className="why-item"><span><Gauge/></span><b>Simple booking</b><p>Book your preferred car in just a few clicks.</p></div><div className="why-item"><span><ShieldCheck/></span><b>Reliable rides</b><p>Choose from a curated collection of vehicles.</p></div><div className="why-item"><span><MapPin/></span><b>Go anywhere</b><p>Find a car that fits your plans and budget.</p></div></div></section></>;
}

function CarsPage({cars, book}) {
  const [query, setQuery] = useState('');
  const [type, setType] = useState('All');
  const filtered = cars.filter(c => c.name.toLowerCase().includes(query.toLowerCase()) && (type === 'All' || c.type === type));
  return <main className="container page-section"><div className="page-title"><div className="eyebrow dark">OUR COLLECTION</div><h1>Explore our <em>cars</em></h1><p>Find the right ride for every road and every budget.</p></div><div className="filter-bar"><div className="search-box"><Search size={18}/><input placeholder="Search cars..." value={query} onChange={e => setQuery(e.target.value)}/></div><select value={type} onChange={e => setType(e.target.value)}><option>All</option><option>SUV</option><option>Sedan</option><option>Hatchback</option></select><span className="result-count">{filtered.length} cars found</span></div>{filtered.length ? <div className="car-grid">{filtered.map(car => <CarCard key={car.id} car={car} book={book}/>)}</div> : <div className="empty-state">No cars match your search.</div>}</main>;
}

function CarCard({car, book}) {
  return <article className="car-card"><div className="car-image"><img src={car.image || defaultImage} alt={car.name} onError={e => {e.currentTarget.src = defaultImage;}}/><span className="car-type">{car.type}</span></div><div className="car-info"><div className="car-title-row"><h3>{car.name}</h3><span className="available-dot">Available</span></div><div className="car-specs"><span><UsersRound size={15}/>{car.seats} seats</span><span><Fuel size={15}/>{car.fuel}</span></div><div className="car-bottom"><div><strong>{money(car.price)}</strong><small> / day</small></div><button className="btn btn-small btn-dark" onClick={() => book(car)}>Book now <ArrowRight size={14}/></button></div></div></article>;
}

function AuthPage({mode, login, signup, go}) {
  const isSignup = mode === 'signup';
  const [role, setRole] = useState('user');
  const [form, setForm] = useState({name:'', email:'', password:'', confirm:'', phone:''});
  const [error, setError] = useState('');
  const change = e => setForm({...form, [e.target.name]: e.target.value});
  const submit = e => {
    e.preventDefault(); setError('');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return setError('Please enter a valid email address.');
    if (form.password.length < 6) return setError('Password must contain at least 6 characters.');
    if (isSignup) {
      if (!form.name.trim()) return setError('Please enter your name.');
      if (form.password !== form.confirm) return setError('Passwords do not match.');
      if (role !== 'user') return setError('Admin accounts are created by the project administrator.');
      const result = signup(form.name.trim(), form.email.trim(), form.password, form.phone.trim());
      if (result) setError(result);
    } else {
      const result = login(form.email.trim(), form.password, role);
      if (result.error) setError(result.error);
    }
  };
  return <main className="auth-wrap"><div className="auth-decoration"><div className="eyebrow">WELCOME TO EASYDRIVE</div><h2>{isSignup ? <>Your next journey<br/><em>starts here.</em></> : <>Good to see<br/><em>you again.</em></>}</h2><p>{isSignup ? 'Create your account and discover a simpler way to get moving.' : 'Sign in to manage your bookings and get back on the road.'}</p><div className="auth-car"><CarFront size={100} strokeWidth={1}/></div></div><div className="auth-card"><div className="auth-icon"><KeyRound size={22}/></div><h2>{isSignup ? 'Create account' : 'Welcome back'}</h2><p className="muted">{isSignup ? 'Fill in your details to get started.' : 'Enter your details to access your account.'}</p><div className="role-switch"><button className={role === 'user' ? 'selected' : ''} onClick={() => setRole('user')}><UserRound size={16}/> User</button>{!isSignup && <button className={role === 'admin' ? 'selected' : ''} onClick={() => setRole('admin')}><ShieldCheck size={16}/> Admin</button>}</div><form onSubmit={submit} className="auth-form">{isSignup && <label>Full name<div className="field"><UserRound size={17}/><input name="name" value={form.name} onChange={change} placeholder="Your name" required/></div></label>}<label>Email address<div className="field"><Mail size={17}/><input type="email" name="email" value={form.email} onChange={change} placeholder="you@example.com" required/></div></label>{isSignup && <label>Phone number <span className="optional">(optional)</span><div className="field"><Phone size={17}/><input name="phone" value={form.phone} onChange={change} placeholder="Phone number"/></div></label>}<label>Password<div className="field"><Lock size={17}/><input type="password" name="password" value={form.password} onChange={change} placeholder="At least 6 characters" required/></div></label>{isSignup && <label>Confirm password<div className="field"><Lock size={17}/><input type="password" name="confirm" value={form.confirm} onChange={change} placeholder="Enter password again" required/></div></label>}{error && <div className="form-error">{error}</div>}<button className="btn btn-primary btn-full" type="submit">{isSignup ? 'Create account' : 'Log in'} <ArrowRight size={17}/></button></form><div className="auth-foot">{isSignup ? 'Already have an account?' : "Don't have an account?"} <button onClick={() => go(isSignup ? 'login' : 'signup')}>{isSignup ? 'Log in' : 'Sign up'}</button></div>{!isSignup && role === 'admin' && <div className="demo-hint">Demo admin: <b>admin@easydrive.com</b> · Password: <b>admin123</b></div>}</div></main>;
}

function AdminPage({cars, users, bookings, updateCar, removeCar}) {
  const [tab, setTab] = useState('cars');
  const [editing, setEditing] = useState(null);
  const [draft, setDraft] = useState({name:'',type:'SUV',price:'',seats:5,fuel:'Petrol',image:defaultImage});
  const startAdd = () => { setEditing('new'); setDraft({name:'',type:'SUV',price:'',seats:5,fuel:'Petrol',image:defaultImage}); };
  const startEdit = car => { setEditing(car.id); setDraft({...car}); };
  const save = e => { e.preventDefault(); if (!draft.name.trim() || Number(draft.price) <= 0) return; updateCar({...draft,id:editing === 'new' ? id() : editing,price:Number(draft.price),seats:Number(draft.seats),available:true}); setEditing(null); };
  const tabs = [{key:'cars',label:'Cars',icon:CarFront},{key:'users',label:'Users',icon:Users},{key:'bookings',label:'Bookings',icon:CalendarDays}];
  return <main className="container page-section"><div className="dashboard-heading"><div><div className="eyebrow dark">MANAGEMENT CONSOLE</div><h1>Admin <em>dashboard</em></h1><p>Manage your fleet, customers and reservations.</p></div><span className="admin-pill"><ShieldCheck size={16}/> Administrator</span></div><div className="stat-grid"><Stat label="Total cars" value={cars.length} icon={CarFront}/><Stat label="Registered users" value={users.length} icon={Users}/><Stat label="Total bookings" value={bookings.length} icon={CalendarDays}/><Stat label="Confirmed" value={bookings.filter(b=>b.status==='Confirmed').length} icon={CheckCircle2}/></div><div className="dashboard-panel"><div className="tab-row">{tabs.map(t=><button key={t.key} className={tab===t.key?'tab-active':''} onClick={()=>{setTab(t.key);setEditing(null);}}><t.icon size={17}/>{t.label}</button>)}</div>
    {tab==='cars' && <div className="panel-content"><div className="panel-heading"><div><h2>Car inventory</h2><p>Add, edit or remove vehicles from your collection.</p></div><button className="btn btn-primary" onClick={startAdd}><Plus size={17}/> Add car</button></div>{editing && <form className="car-form" onSubmit={save}><h3>{editing==='new'?'Add a new car':'Edit car details'}</h3><div className="form-grid"><label>Car name<input value={draft.name} onChange={e=>setDraft({...draft,name:e.target.value})} placeholder="e.g. Toyota Innova" required/></label><label>Category<select value={draft.type} onChange={e=>setDraft({...draft,type:e.target.value})}><option>SUV</option><option>Sedan</option><option>Hatchback</option><option>Luxury</option></select></label><label>Price per day (₹)<input type="number" min="1" value={draft.price} onChange={e=>setDraft({...draft,price:e.target.value})} required/></label><label>Seats<input type="number" min="1" max="12" value={draft.seats} onChange={e=>setDraft({...draft,seats:e.target.value})}/></label><label>Fuel type<select value={draft.fuel} onChange={e=>setDraft({...draft,fuel:e.target.value})}><option>Petrol</option><option>Diesel</option><option>Electric</option><option>Hybrid</option></select></label><label>Image URL<input value={draft.image} onChange={e=>setDraft({...draft,image:e.target.value})}/></label></div><div className="form-actions"><button type="button" className="btn btn-ghost" onClick={()=>setEditing(null)}>Cancel</button><button className="btn btn-primary" type="submit">Save car</button></div></form>}<div className="table-wrap"><table><thead><tr><th>Vehicle</th><th>Category</th><th>Price / day</th><th>Seats</th><th>Actions</th></tr></thead><tbody>{cars.map(c=><tr key={c.id}><td><div className="table-car"><img src={c.image||defaultImage} alt=""/><b>{c.name}</b></div></td><td>{c.type}</td><td>{money(c.price)}</td><td>{c.seats}</td><td><div className="action-buttons"><button className="icon-btn" title="Edit" onClick={()=>startEdit(c)}><Pencil size={16}/></button><button className="icon-btn danger" title="Delete" onClick={()=>removeCar(c.id)}><Trash2 size={16}/></button></div></td></tr>)}</tbody></table>{cars.length===0&&<div className="empty-state">No cars added yet.</div>}</div></div>}
    {tab==='users' && <div className="panel-content"><div className="panel-heading"><div><h2>Registered users</h2><p>People who have created an EasyDrive account.</p></div><span className="count-chip">{users.length} users</span></div><div className="table-wrap"><table><thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Account</th></tr></thead><tbody>{users.map(u=><tr key={u.id}><td><b>{u.name}</b></td><td>{u.email}</td><td>{u.phone||'—'}</td><td><span className="status-pill">Active</span></td></tr>)}</tbody></table>{!users.length&&<div className="empty-state">No registered users yet.</div>}</div></div>}
    {tab==='bookings' && <div className="panel-content"><div className="panel-heading"><div><h2>All bookings</h2><p>Review customer reservations and their status.</p></div><span className="count-chip">{bookings.length} bookings</span></div><div className="table-wrap"><table><thead><tr><th>Customer</th><th>Vehicle</th><th>Date</th><th>Amount / day</th><th>Status</th></tr></thead><tbody>{bookings.map(b=><tr key={b.id}><td><b>{b.userName}</b><small className="table-sub">{b.userEmail}</small></td><td>{b.carName}</td><td>{b.date}</td><td>{money(b.price)}</td><td><span className={b.status==='Confirmed'?'status-pill':'status-pill cancelled'}>{b.status}</span></td></tr>)}</tbody></table>{!bookings.length&&<div className="empty-state">No bookings yet.</div>}</div></div>}
  </div></main>;
}

function UserPage({session,cars,bookings,cancel,go}) {
  const mine = bookings.filter(b=>b.userEmail===session.email);
  return <main className="container page-section"><div className="dashboard-heading"><div><div className="eyebrow dark">YOUR EASYDRIVE ACCOUNT</div><h1>Hello, <em>{session.name.split(' ')[0]}</em></h1><p>Here is everything you need for your next journey.</p></div><div className="user-avatar"><UserRound size={22}/></div></div><div className="stat-grid user-stats"><Stat label="My bookings" value={mine.length} icon={CalendarDays}/><Stat label="Active bookings" value={mine.filter(b=>b.status==='Confirmed').length} icon={CheckCircle2}/><Stat label="Cars to explore" value={cars.length} icon={CarFront}/></div><div className="dashboard-panel"><div className="panel-content"><div className="panel-heading"><div><h2>My bookings</h2><p>Track and manage your car reservations.</p></div><button className="btn btn-primary" onClick={()=>go('cars')}>Browse cars <ArrowRight size={16}/></button></div>{mine.length ? <div className="booking-list">{mine.map(b=><div className="booking-item" key={b.id}><div className="booking-car-icon"><CarFront size={24}/></div><div className="booking-main"><b>{b.carName}</b><span>Booked on {b.date} · {money(b.price)} / day</span></div><span className={b.status==='Confirmed'?'status-pill':'status-pill cancelled'}>{b.status}</span>{b.status==='Confirmed'&&<button className="btn btn-cancel" onClick={()=>cancel(b.id)}>Cancel</button>}</div>)}</div>:<div className="empty-state"><CalendarDays size={34}/><b>No bookings yet</b><span>When you book a car, it will appear here.</span><button className="text-link" onClick={()=>go('cars')}>Explore cars <ArrowRight size={15}/></button></div>}</div></div></main>;
}

function Stat({label,value,icon:Icon}) { return <div className="stat-card"><span className="stat-icon"><Icon size={20}/></span><div><strong>{value}</strong><small>{label}</small></div></div>; }
function AccessDenied({go}) { return <main className="page-section container"><div className="empty-state"><ShieldCheck size={38}/><h2>Login required</h2><p>Please sign in with the correct account to view this page.</p><button className="btn btn-primary" onClick={()=>go('login')}>Go to login</button></div></main>; }