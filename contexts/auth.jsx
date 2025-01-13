'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  fetchSignInMethodsForEmail,
  linkWithPopup,
  updatePassword
} from 'firebase/auth';
import { auth, db } from '@/lib/firebase/firebase';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { getDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { ChangePasswordModal } from '@/components/modals/change-password-modal';
import { LinkGoogleModal } from '@/components/modals/link-google-modal';

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
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const router = useRouter();

  useEffect(() => {
    console.log("Setting up auth state listener");
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log("Auth state changed:", user ? "User logged in" : "No user");
      setUser(user);
      
      if (user) {
        try {
          console.log("Fetching user document for:", user.uid);
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            console.log("User data:", {
              role: userData.role,
              firstAccess: userData.firstAccess,
              email: userData.email
            });
            
            setUserRole(userData.role);
            
            if (userData.firstAccess) {
              console.log("First access detected, showing password modal");
              setShowPasswordModal(true);
            } else {
              console.log("Checking Google provider");
              const providers = user.providerData.map(provider => provider.providerId);
              console.log("User providers:", providers);
              
              if (!providers.includes('google.com')) {
                console.log("No Google provider found, showing link modal");
                setShowLinkGoogleModal(true);
              }
            }
          } else {
            console.warn("No user document found!");
            setUserRole(null);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          setUserRole(null);
        }
      } else {
        console.log("Resetting user state");
        setUserRole(null);
        setShowPasswordModal(false);
        setShowLinkGoogleModal(false);
      }
      
      setLoading(false);
    });

    return () => {
      console.log("Cleaning up auth state listener");
      unsubscribe();
    };
  }, []);

  const signIn = async (email, password) => {
    try {
      console.log("Attempting sign in for:", email);
      const result = await signInWithEmailAndPassword(auth, email, password);
      console.log("Sign in successful");
      
      // Force fetch user data after sign in
      const userDoc = await getDoc(doc(db, 'users', result.user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        console.log("Post-login user data:", userData);
        
        if (userData.firstAccess) {
          console.log("Setting showPasswordModal to true");
          setShowPasswordModal(true);
        }
      }
      
      router.replace('/dashboard');
    } catch (error) {
      console.error("Sign in error:", error);
      throw error;
    }
  };

  const handlePasswordChange = async (newPassword) => {
    try {
      console.log("Starting password change process");
      if (!user) throw new Error('Usuário não autenticado');

      // Change password in Firebase Auth
      await updatePassword(user, newPassword);
      console.log("Password updated in Firebase Auth");

      // Update firstAccess in Firestore
      await updateDoc(doc(db, 'users', user.uid), {
        firstAccess: false,
        updatedAt: serverTimestamp()
      });
      console.log("FirstAccess updated in Firestore");

      setShowPasswordModal(false);

      // After password change, check if we need to show Google modal
      const providers = user.providerData.map(provider => provider.providerId);
      console.log("Current providers:", providers);
      
      if (!providers.includes('google.com')) {
        console.log("Showing Google link modal");
        setShowLinkGoogleModal(true);
      }

      toast.success('Senha alterada com sucesso!');
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error('Erro ao alterar senha: ' + error.message);
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
      showPasswordModal,
      handleLinkGoogle,
      handlePasswordChange,
      dismissLinkGoogleModal: () => setShowLinkGoogleModal(false),
      dismissPasswordModal: () => setShowPasswordModal(false),
      userRole
    }}>
      {children}
      <ChangePasswordModal 
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        onSubmit={handlePasswordChange}
      />
      <LinkGoogleModal 
        isOpen={showLinkGoogleModal}
        onClose={() => setShowLinkGoogleModal(false)}
        onConfirm={handleLinkGoogle}
      />
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 