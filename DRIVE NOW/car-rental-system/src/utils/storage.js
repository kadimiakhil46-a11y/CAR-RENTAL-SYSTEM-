const KEYS = {
  users: 'easydrive_users',
  cars: 'easydrive_cars',
  bookings: 'easydrive_bookings',
  session: 'easydrive_session'
};

export function read(key, fallback = []) {
  try {
    const value = localStorage.getItem(KEYS[key]);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

export function write(key, value) {
  localStorage.setItem(KEYS[key], JSON.stringify(value));
}

export function seedData() {
  if (!localStorage.getItem(KEYS.cars)) {
    write('cars', [
      { id: 'c1', name: 'Hyundai Creta', type: 'SUV', price: 2500, seats: 5, fuel: 'Petrol', image: 'https://images.unsplash.com/photo-1605559906002-0c1e4b7f6a5b?auto=format&fit=crop&w=1000&q=80', available: true },
      { id: 'c2', name: 'Honda City', type: 'Sedan', price: 1800, seats: 5, fuel: 'Petrol', image: 'https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&w=1000&q=80', available: true },
      { id: 'c3', name: 'Kia Seltos', type: 'SUV', price: 2300, seats: 5, fuel: 'Diesel', image: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=1000&q=80', available: true },
      { id: 'c4', name: 'Maruti Swift', type: 'Hatchback', price: 1200, seats: 5, fuel: 'Petrol', image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1000&q=80', available: true }
    ]);
  }
  if (!localStorage.getItem(KEYS.users)) write('users', []);
  if (!localStorage.getItem(KEYS.bookings)) write('bookings', []);
}