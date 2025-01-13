export const changePassword = async (newPassword) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('Usuário não autenticado');

    // Change password
    await updatePassword(user, newPassword);

    // Update firstAccess in Firestore
    const userRef = doc(db, 'users', user.uid);
    await updateDoc(userRef, {
      firstAccess: false,
      updatedAt: serverTimestamp()
    });

  } catch (error) {
    console.error('Error changing password:', error);
    throw new Error('Erro ao alterar senha: ' + error.message);
  }
}; 