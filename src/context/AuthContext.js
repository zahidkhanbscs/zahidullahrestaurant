import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { mockUsers } from '../data/users';

const AuthContext = createContext(null);
const waitOneSecond = () => new Promise((resolve) => setTimeout(resolve, 1000));
const publicUser = ({ id, name, email, role }) => ({ id, name, email, role });

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [registeredUsers, setRegisteredUsers] = useState(mockUsers);

  const login = useCallback(async ({ email, password, role }) => {
    await waitOneSecond();
    const normalizedEmail = email.trim().toLowerCase();
    const matched = registeredUsers.find((entry) =>
      entry.email.toLowerCase() === normalizedEmail &&
      entry.password === password &&
      entry.role === role
    );
    if (!matched) throw new Error('Email, password, or selected role is incorrect.');
    const safeUser = publicUser(matched);
    setUser(safeUser);
    return safeUser;
  }, [registeredUsers]);

  const signup = useCallback(async ({ name, email, password, role }) => {
    await waitOneSecond();
    const normalizedEmail = email.trim().toLowerCase();
    if (registeredUsers.some((entry) => entry.email.toLowerCase() === normalizedEmail)) {
      throw new Error('An account with this email already exists.');
    }
    const account = {
      id: `${role.toLowerCase()}-${Date.now()}`,
      name: name.trim(),
      email: normalizedEmail,
      password,
      role,
    };
    setRegisteredUsers((current) => [...current, account]);
    const safeUser = publicUser(account);
    setUser(safeUser);
    return safeUser;
  }, [registeredUsers]);

  const logout = useCallback(() => setUser(null), []);
  const value = useMemo(() => ({ user, login, signup, logout }), [login, logout, signup, user]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider.');
  return context;
}
