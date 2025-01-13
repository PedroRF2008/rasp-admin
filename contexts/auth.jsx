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
import { toast } from 'react-hot-toast';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase/firebase';

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
  const [showLinkGoogleModal, setShowLinkGoogleModal] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      
      if (user) {
        // Check user role
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            setUserRole(userDoc.data().role);
          } else {
            setUserRole(null);
          }
        } catch (error) {
          console.error('Error fetching user role:', error);
          setUserRole(null);
        }

        // Check Google provider
        const providers = user.providerData.map(provider => provider.providerId);
        if (!providers.includes('google.com')) {
          setShowLinkGoogleModal(true);
        }
      } else {
        setUserRole(null);
      }
      
      setLoading(false);
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

  // Add this function to handle Google account linking
  const handleLinkGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await linkWithPopup(auth.currentUser, provider);
      setShowLinkGoogleModal(false);
      toast.success('Conta Google vinculada com sucesso!');
    } catch (error) {
      if (error.code === 'auth/credential-already-in-use') {
        toast.error('Esta conta Google já está vinculada a outro usuário.');
      } else {
        toast.error('Erro ao vincular conta Google. Tente novamente.');
      }
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      signIn, 
      signInWithGoogle, 
      signOut,
      showLinkGoogleModal,
      handleLinkGoogle,
      dismissLinkGoogleModal: () => setShowLinkGoogleModal(false),
      userRole
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext); 