# Script per Impostare il Codice di Invito

Se continui a ricevere l'errore "Missing or insufficient permissions", puoi usare questo script nella console del browser per impostare direttamente il codice "PERONCIOLILLO".

## Istruzioni

1. Apri il sito https://apheron.io/home-assistant/
2. Assicurati di essere loggato
3. Apri la Console del Browser (F12 > Console)
4. Copia e incolla questo script:

```javascript
(async function() {
  console.log('🔧 Setting invite code to PERONCIOLILLO...');
  
  try {
    // Import Firebase functions
    const { getFirestore, doc, updateDoc, collection, query, where, getDocs } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
    const { getAuth } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js');
    
    // Get Firebase app instance from window (if available)
    let db, auth;
    
    if (window.firebase && window.firebase.firestore) {
      db = window.firebase.firestore();
      auth = window.firebase.auth();
    } else {
      // Try to get from React app
      const reactRoot = document.querySelector('[data-reactroot]') || document.getElementById('root');
      if (reactRoot && reactRoot._reactInternalInstance) {
        // This is a fallback - you might need to adjust based on your setup
        console.log('Please use the Firebase Console to update the invite code directly');
        return;
      }
    }
    
    if (!auth || !auth.currentUser) {
      console.error('❌ User not logged in');
      alert('Please log in first');
      return;
    }
    
    console.log('✅ User logged in:', auth.currentUser.uid);
    
    // Find household
    const householdsRef = db.collection('households');
    const snapshot = await householdsRef.where('members', 'array-contains', auth.currentUser.uid).get();
    
    if (snapshot.empty) {
      console.error('❌ No household found for user');
      alert('No household found');
      return;
    }
    
    const householdDoc = snapshot.docs[0];
    const householdId = householdDoc.id;
    const householdData = householdDoc.data();
    
    console.log('✅ Found household:', householdId);
    console.log('   Members:', householdData.members);
    console.log('   Current invite code:', householdData.inviteCode);
    
    // Update invite code
    await householdDoc.ref.update({
      inviteCode: 'PERONCIOLILLO'
    });
    
    console.log('✅ Invite code set to PERONCIOLILLO successfully!');
    alert('✅ Invite code set to PERONCIOLILLO! Reloading page...');
    
    // Reload page
    setTimeout(() => {
      window.location.reload();
    }, 1000);
    
  } catch (error) {
    console.error('❌ Error:', error);
    console.error('   Code:', error.code);
    console.error('   Message:', error.message);
    alert('Error: ' + error.message);
  }
})();
```

## Alternativa: Usa Firebase Console

Se lo script non funziona, puoi anche:

1. Vai su https://console.firebase.google.com/
2. Seleziona il progetto "peronciolillo-home-assistant"
3. Vai su Firestore Database
4. Trova la collection "households"
5. Trova il documento del tuo household
6. Modifica il campo `inviteCode` e imposta il valore a `PERONCIOLILLO`
7. Salva

## Verifica

Dopo aver impostato il codice, ricarica la pagina e verifica che il codice "PERONCIOLILLO" sia visibile nella sezione "Invite Friends".

