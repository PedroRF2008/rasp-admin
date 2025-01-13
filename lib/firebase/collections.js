import { db, storage } from '@/lib/firebase/firebase';
import { 
  collection, 
  doc, 
  setDoc,
  addDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp,
  getDoc,
  Timestamp,
  query,
  where,
  getDocs,
  writeBatch
} from 'firebase/firestore';
import {
  ref,
  deleteObject,
  listAll,
  uploadBytes,
  getDownloadURL,
} from 'firebase/storage';

// Collection references
const groupsRef = collection(db, 'groups');
const devicesRef = collection(db, 'devices');

// Subscribe to all groups
export const subscribeToGroups = (callback) => {
  return onSnapshot(groupsRef, (snapshot) => {
    const groups = [];
    snapshot.forEach((doc) => {
      groups.push({ 
        id: doc.id,
        name: doc.data().name,
        ...doc.data(),
        media: doc.data().media || []
      });
    });
    callback(groups);
  });
};

// Subscribe to all devices with their group info
export const subscribeToDevices = (callback) => {
  return onSnapshot(devicesRef, async (snapshot) => {
    const devices = [];
    const groupsCache = new Map();

    for (const docSnap of snapshot.docs) {
      const deviceData = docSnap.data();
      let groupData = null;

      if (deviceData.groupId) {
        // Check cache first
        if (groupsCache.has(deviceData.groupId)) {
          groupData = groupsCache.get(deviceData.groupId);
        } else {
          // Get group data and cache it
          const groupDocRef = doc(db, 'groups', deviceData.groupId);
          const groupDoc = await getDoc(groupDocRef);
          if (groupDoc.exists()) {
            groupData = { id: groupDoc.id, ...groupDoc.data() };
            groupsCache.set(deviceData.groupId, groupData);
          }
        }
      }

      devices.push({
        id: docSnap.id,
        ...deviceData,
        groupName: groupData?.name || 'Sem grupo'
      });
    }

    callback(devices);
  });
};

// Create a group
export const createGroup = async (name, groupData = {}) => {
  try {
    const docRef = await addDoc(groupsRef, {
      name,
      media: [],
      ...groupData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // Create the group's media folder in Storage
    const mediaFolderRef = ref(storage, `groupsMedia/${docRef.id}`);
    
    return docRef.id;
  } catch (error) {
    throw new Error('Erro ao criar grupo: ' + error.message);
  }
};

// Delete a group and its media
export const deleteGroup = async (groupId) => {
  try {
    const batch = writeBatch(db);

    // Delete all media files in the group's folder
    const mediaFolderRef = ref(storage, `groupsMedia/${groupId}`);
    const mediaList = await listAll(mediaFolderRef);
    
    await Promise.all(
      mediaList.items.map(item => deleteObject(item))
    );

    // Find all devices in this group
    const devicesSnapshot = await getDocs(
      query(devicesRef, where('groupId', '==', groupId))
    );

    // Delete all devices in the group
    devicesSnapshot.forEach((deviceDoc) => {
      batch.delete(deviceDoc.ref);
    });

    // Delete the group document
    batch.delete(doc(groupsRef, groupId));

    // Commit the batch
    await batch.commit();
  } catch (error) {
    throw new Error('Erro ao excluir grupo: ' + error.message);
  }
};

// Add a device
export const addDevice = async (deviceData) => {
  try {
    const docRef = await addDoc(devicesRef, {
      ...deviceData,
      status: 'offline',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    return docRef.id;
  } catch (error) {
    throw new Error('Erro ao adicionar dispositivo: ' + error.message);
  }
};

// Update a device
export const updateDevice = async (deviceId, deviceData) => {
  try {
    await setDoc(doc(devicesRef, deviceId), {
      ...deviceData,
      updatedAt: serverTimestamp()
    }, { merge: true });
  } catch (error) {
    throw new Error('Erro ao atualizar dispositivo: ' + error.message);
  }
};

// Remove a device
export const removeDevice = async (deviceId) => {
  try {
    await deleteDoc(doc(devicesRef, deviceId));
  } catch (error) {
    throw new Error('Erro ao remover dispositivo: ' + error.message);
  }
};

// Add media to a group
export const addMediaToGroup = async (groupId, mediaData) => {
  try {
    const groupRef = doc(groupsRef, groupId);
    const groupSnap = await getDoc(groupRef);
    const group = groupSnap.data();

    // Create a new document for the media to get a unique ID
    const mediaDocRef = await addDoc(collection(db, 'media_temp'), {
      timestamp: serverTimestamp()
    });

    const newMedia = {
      id: mediaDocRef.id,
      ...mediaData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };

    // Delete the temporary document
    await deleteDoc(mediaDocRef);

    await setDoc(groupRef, {
      ...group,
      media: [...(group.media || []), newMedia],
      updatedAt: serverTimestamp(),
    });

    return newMedia.id;
  } catch (error) {
    throw new Error('Erro ao adicionar mídia: ' + error.message);
  }
};

// Update group's lastSeen timestamp
export const updateGroupLastSeen = async (groupId) => {
  try {
    const groupRef = doc(groupsRef, groupId);
    await setDoc(groupRef, {
      lastSeen: serverTimestamp(),
      updatedAt: serverTimestamp()
    }, { merge: true });
  } catch (error) {
    throw new Error('Erro ao atualizar última sincronização: ' + error.message);
  }
};

// Remove media from a group
export const removeMediaFromGroup = async (groupId, mediaId) => {
  try {
    const groupRef = doc(groupsRef, groupId);
    const groupSnap = await getDoc(groupRef);
    const group = groupSnap.data();

    // Delete the file from Storage using the mediaId
    const mediaRef = ref(storage, `groupsMedia/${groupId}/${mediaId}`);
    await deleteObject(mediaRef);

    // Update the group document
    const updatedMedia = group.media.filter(m => m.id !== mediaId);
    await setDoc(groupRef, {
      ...group,
      media: updatedMedia,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    throw new Error('Erro ao remover mídia: ' + error.message);
  }
};

// Add media to a group
export const uploadGroupMedia = async (groupId, file, mediaData) => {
  try {
    // Create a new document for the media to get a unique ID
    const mediaDocRef = await addDoc(collection(db, 'media_temp'), {
      timestamp: serverTimestamp()
    });
    
    // Upload the file to storage
    const mediaRef = ref(storage, `groupsMedia/${groupId}/${mediaDocRef.id}`);
    await uploadBytes(mediaRef, file);
    const downloadURL = await getDownloadURL(mediaRef);

    // Delete the temporary document
    await deleteDoc(mediaDocRef);

    // Get the group document
    const groupRef = doc(groupsRef, groupId);
    const groupSnap = await getDoc(groupRef);
    const group = groupSnap.data();

    // Create the media object
    const newMedia = {
      id: mediaDocRef.id,
      ...mediaData,
      url: downloadURL,
      type: file.type.startsWith('video/') ? 'video' : 'image',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };

    // Update the group document
    await setDoc(groupRef, {
      ...group,
      media: [...(group.media || []), newMedia],
      updatedAt: serverTimestamp(),
    });

    return newMedia.id;
  } catch (error) {
    throw new Error('Erro ao fazer upload da mídia: ' + error.message);
  }
};

// Update a group
export const updateGroup = async (groupId, groupData) => {
  try {
    const groupRef = doc(groupsRef, groupId);
    await setDoc(groupRef, {
      ...groupData,
      updatedAt: serverTimestamp()
    }, { merge: true });
  } catch (error) {
    throw new Error('Erro ao atualizar grupo: ' + error.message);
  }
};

// Update media duration in a group
export const updateMediaDuration = async (groupId, mediaId, duration) => {
  try {
    const groupRef = doc(groupsRef, groupId);
    const groupSnap = await getDoc(groupRef);
    const group = groupSnap.data();

    // Find and update the media item
    const updatedMedia = group.media.map(m => {
      if (m.id === mediaId) {
        return {
          ...m,
          duration: parseInt(duration),
          updatedAt: Timestamp.now()
        };
      }
      return m;
    });

    // Update the group document
    await setDoc(groupRef, {
      ...group,
      media: updatedMedia,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    throw new Error('Erro ao atualizar duração da mídia: ' + error.message);
  }
};

// Add these new functions
export const triggerDeviceSync = async (deviceId) => {
  try {
    await setDoc(doc(devicesRef, deviceId), {
      needsSync: true,
      updatedAt: serverTimestamp()
    }, { merge: true });
  } catch (error) {
    throw new Error('Erro ao sincronizar dispositivo: ' + error.message);
  }
};

export const triggerDeviceReboot = async (deviceId) => {
  try {
    await setDoc(doc(devicesRef, deviceId), {
      needsReboot: true,
      updatedAt: serverTimestamp()
    }, { merge: true });
  } catch (error) {
    throw new Error('Erro ao reiniciar dispositivo: ' + error.message);
  }
}; 