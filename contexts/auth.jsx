'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  fetchSignInMethodsForEmail,
  linkWithPopup
} from 'firebase/auth';
import { auth } from '@/lib/firebase/firebase';
import { useRouter } from 'next/navigation';
import { useDisclosure } from "@nextui-org/react";
import { NetworkModal } from "@/components/modals/network-modal";

const AuthContext = createContext({});

// Initialize with persisted state if available
const getInitialState = () => {
  if (typeof window !== 'undefined') {
    const persistedUser = localStorage.getItem('auth_user');
    return persistedUser ? JSON.parse(persistedUser) : null;
  }
  return null;
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Network Modal
  const {
    isOpen: isNetworkModalOpen,
    onOpen: openNetworkModal,
    onClose: closeNetworkModal
  } = useDisclosure();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);

      if (user) {
        openNetworkModal(); // Show network modal after successful login
      }
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email, password) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.replace('/dashboard');
    } catch (error) {
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      
      if (auth.currentUser) {
        return await linkWithPopup(auth.currentUser, provider);
      }

      const googleResult = await signInWithPopup(auth, provider);
      const email = googleResult.user.email;
      const signInMethods = await fetchSignInMethodsForEmail(auth, email);

      if (signInMethods.includes('password') && !signInMethods.includes('google.com')) {
        throw {
          code: 'auth/account-exists-with-different-credential',
          email: email,
          message: 'Uma conta com este e-mail já existe usando outro método de login.'
        };
      }

      return googleResult;
    } catch (error) {
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      localStorage.removeItem('auth_user');
      router.replace('/login');
    } catch (error) {
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signInWithGoogle, signOut }}>
      {children}
      <NetworkModal isOpen={isNetworkModalOpen} onClose={closeNetworkModal} />
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext); 