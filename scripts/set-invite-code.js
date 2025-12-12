// Script to set invite code directly in Firestore
// Run this in the browser console while logged in

// Replace with your actual household ID
const householdId = prompt('Enter your household ID (or leave empty to find it automatically):');

async function setInviteCode() {
  const { getAuth } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js');
  const { getFirestore, doc, updateDoc, getDoc, collection, query, where, getDocs } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
  
  // You'll need to initialize Firebase first
  // This is a helper script - adjust based on your Firebase config
  
  console.log('Setting invite code to PERONCIOLILLO...');
  
  // If householdId not provided, find it
  let targetHouseholdId = householdId;
  if (!targetHouseholdId) {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) {
      console.error('User not logged in');
      return;
    }
    
    const db = getFirestore();
    const householdsRef = collection(db, 'households');
    const q = query(householdsRef, where('members', 'array-contains', user.uid));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      console.error('No household found for user');
      return;
    }
    
    targetHouseholdId = snapshot.docs[0].id;
    console.log('Found household ID:', targetHouseholdId);
  }
  
  const db = getFirestore();
  const householdRef = doc(db, 'households', targetHouseholdId);
  
  try {
    await updateDoc(householdRef, {
      inviteCode: 'PERONCIOLILLO'
    });
    console.log('✅ Invite code set to PERONCIOLILLO successfully!');
  } catch (error) {
    console.error('❌ Error setting invite code:', error);
  }
}

// Alternative: Use the app's existing functions
// Run this in the browser console on the app page
window.setInviteCodeDirect = async function() {
  const { currentHousehold } = window.__REACT_DEVTOOLS_GLOBAL_HOOK__?.renderers?.get(1)?.findFiberByHostInstance?.(document.querySelector('[data-reactroot]'))?.return?.memoizedState?.currentHousehold;
  
  if (!currentHousehold) {
    console.error('Could not find current household');
    return;
  }
  
  console.log('Setting invite code for household:', currentHousehold.id);
  
  // Use the app's Firebase instance
  const { getFirestore, doc, updateDoc } = await import('firebase/firestore');
  const { db } = await import('./services/firebase');
  
  try {
    const householdRef = doc(db, 'households', currentHousehold.id);
    await updateDoc(householdRef, {
      inviteCode: 'PERONCIOLILLO'
    });
    console.log('✅ Invite code set to PERONCIOLILLO successfully!');
    window.location.reload();
  } catch (error) {
    console.error('❌ Error setting invite code:', error);
  }
};

console.log('Script loaded. Run: setInviteCodeDirect()');

