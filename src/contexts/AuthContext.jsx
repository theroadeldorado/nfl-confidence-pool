import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, database } from '../firebase';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { ref, get } from 'firebase/database';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        // Check if user is admin
        const adminRef = ref(database, `admins/${firebaseUser.uid}`);
        const snapshot = await get(adminRef);
        setIsAdmin(snapshot.exists());
      } else {
        setUser(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    const result = await signInWithEmailAndPassword(auth, email, password);
    // Check admin status
    const adminRef = ref(database, `admins/${result.user.uid}`);
    const snapshot = await get(adminRef);
    if (!snapshot.exists()) {
      await signOut(auth);
      throw new Error('Not authorized as admin');
    }
    return result;
  };

  const logout = async () => {
    await signOut(auth);
  };

  const value = {
    user,
    isAdmin,
    loading,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
