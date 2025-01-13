const { getAuth } = require('firebase-admin/auth');
const { getFirestore } = require('firebase-admin/firestore');

const userController = {
  createUser: async (req, res) => {
    try {
      const { email, displayName, role } = req.body;

      // Generate random password
      const tempPassword = Math.random().toString(36).slice(-8);

      // Create Firebase Auth user
      const userRecord = await getAuth().createUser({
        email,
        displayName,
        password: tempPassword
      });

      // Create user document
      await getFirestore()
        .collection('users')
        .doc(userRecord.uid)
        .set({
          email,
          displayName,
          role,
          firstAccess: true,
          createdAt: new Date(),
          updatedAt: new Date()
        });

      res.status(200).json({ 
        message: 'User created successfully',
        userId: userRecord.uid,
        tempPassword 
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  updateUser: async (req, res) => {
    try {
      const { id } = req.params;
      const { displayName, role } = req.body;

      // Update Auth display name if provided
      if (displayName) {
        await getAuth().updateUser(id, { displayName });
      }

      // Update user document
      await getFirestore()
        .collection('users')
        .doc(id)
        .update({
          ...(displayName && { displayName }),
          ...(role && { role }),
          updatedAt: new Date()
        });

      res.status(200).json({ message: 'User updated successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  deleteUser: async (req, res) => {
    try {
      const { id } = req.params;

      // Delete from Auth
      await getAuth().deleteUser(id);

      // Delete user document
      await getFirestore()
        .collection('users')
        .doc(id)
        .delete();

      res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = { userController }; 