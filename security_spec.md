# Security Specification for gen-lang-client-0901927659

## Data Invariants
1. A user can only read and write their own profile document.
2. All financial data (pockets, transactions, budgets, targets) MUST belong to a specific user and only that user can access or modify it.
3. All personal data (tasks, activities, archives, notes) MUST belong to a specific user and only that user can access or modify it.
4. Document IDs for all collections must be alphanumeric with dashes or underscores.
5. All sensitive operations (write) require the user's email to be verified.
6. Identity fields (`userId`) are immutable after creation.
7. Timestamps like `createdAt` or `updatedAt` must be set by the server.

## The "Dirty Dozen" Payloads (Attack Vectors)
1. **Identity Spoofing**: Attempt to create a transaction with a `userId` belonging to another user.
2. **PII Leak**: Attempt to read another user's profile info.
3. **Ghost Field Injection**: Attempt to add an `isAdmin: true` field to a user profile.
4. **State Shortcutting**: Attempt to update a task status to 'selesai' without providing a `userId`.
5. **Resource Poisoning**: Attempt to inject a 1MB string into a `title` field.
6. **Orphaned Record**: Attempt to create a transaction without a valid `pocket` reference (logical invariant).
7. **Temporal Fraud**: Attempt to set a `createdAt` date in the past.
8. **Privilege Escalation**: Attempt to update another user's `balance` in their `Pocket`.
9. **Immutable Violation**: Attempt to change the `userId` of an existing `Target`.
10. **Shadow List Query**: Attempt to list all transactions across all users.
11. **ID Poisoning**: Attempt to use an extremely long and complex string as a document ID.
12. **Unverified Write**: Attempt to create a note with an unverified email.

## Test Runner (firestore.rules.test.ts)
```typescript
import { assertSucceeds, assertFails, initializeTestEnvironment, RulesTestEnvironment } from '@firebase/rules-unit-testing';
import { doc, getDoc, setDoc, updateDoc, collection, getDocs, query, where } from 'firebase/firestore';

let testEnv: RulesTestEnvironment;

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: 'gen-lang-client-0901927659',
    firestore: {
      rules: '', // Rules will be loaded before each test
    },
  });
});

afterAll(async () => {
  await testEnv.cleanup();
});

describe('Firestore Security Rules', () => {
  const aliceId = 'alice_123';
  const bobId = 'bob_456';
  const aliceAuth = { uid: aliceId, token: { email_verified: true } };
  const aliceUnverifiedAuth = { uid: aliceId, token: { email_verified: false } };

  test('Identity Spoofing: Alice cannot create data for Bob', async () => {
    const db = testEnv.authenticatedContext(aliceId, aliceAuth.token).firestore();
    await assertFails(setDoc(doc(db, 'transactions', 'tx1'), {
      title: 'Evil Hack',
      amount: 100,
      type: 'expense',
      userId: bobId,
      date: new Date().toISOString()
    }));
  });

  test('PII Leak: Alice cannot read Bob\'s profile', async () => {
    const db = testEnv.authenticatedContext(aliceId, aliceAuth.token).firestore();
    await assertFails(getDoc(doc(db, 'users', bobId)));
  });

  test('Unverified Write: Alice cannot create note if email not verified', async () => {
    const db = testEnv.authenticatedContext(aliceId, aliceUnverifiedAuth.token).firestore();
    await assertFails(setDoc(doc(db, 'notes', 'n1'), {
      title: 'Secret Note',
      userId: aliceId
    }));
  });

  test('Immutable Violation: Alice cannot change userId on Target', async () => {
    const db = testEnv.authenticatedContext(aliceId, aliceAuth.token).firestore();
    const targetRef = doc(db, 'targets', 'tg1');
    
    // Setup
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), 'targets', 'tg1'), {
        name: 'Savings',
        target: 1000,
        userId: aliceId
      });
    });

    await assertFails(updateDoc(targetRef, { userId: bobId }));
  });

  test('Shadow List Query: Alice cannot list all transactions', async () => {
    const db = testEnv.authenticatedContext(aliceId, aliceAuth.token).firestore();
    await assertFails(getDocs(collection(db, 'transactions')));
  });
  
  test('Secure List Query: Alice can list her own transactions', async () => {
    const db = testEnv.authenticatedContext(aliceId, aliceAuth.token).firestore();
    const q = query(collection(db, 'transactions'), where('userId', '==', aliceId));
    await assertSucceeds(getDocs(q));
  });
});
```
