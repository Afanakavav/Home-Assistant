// Script to set invite code directly in Firestore
// Copy and paste this entire script into the browser console while on the app page

(async function() {
  console.log('🔧 Setting invite code to PERONCIOLILLO...');
  
  try {
    // Get Firebase modules from the app
    const { getFirestore, doc, updateDoc, getDoc, collection, query, where, getDocs } = await import('firebase/firestore');
    const { getAuth } = await import('firebase/auth');
    const { db } = await import('/home-assistant/src/services/firebase.ts');
    const auth = getAuth();
    
    if (!auth.currentUser) {
      console.error('❌ User not logged in');
      return;
    }
    
    console.log('✅ User logged in:', auth.currentUser.uid);
    
    // Find household
    const householdsRef = collection(db, 'households');
    const q = query(householdsRef, where('members', 'array-contains', auth.currentUser.uid));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      console.error('❌ No household found for user');
      return;
    }
    
    const householdDoc = snapshot.docs[0];
    const householdId = householdDoc.id;
    const householdData = householdDoc.data();
    
    console.log('✅ Found household:', householdId);
    console.log('   Members:', householdData.members);
    console.log('   Current invite code:', householdData.inviteCode);
    
    // Update invite code
    const householdRef = doc(db, 'households', householdId);
    await updateDoc(householdRef, {
      inviteCode: 'PERONCIOLILLO'
    });
    
    console.log('✅ Invite code set to PERONCIOLILLO successfully!');
    console.log('🔄 Reloading page...');
    
    // Reload page to see changes
    setTimeout(() => {
      window.location.reload();
    }, 1000);
    
  } catch (error) {
    console.error('❌ Error:', error);
    console.error('   Code:', error.code);
    console.error('   Message:', error.message);
  }
})();

