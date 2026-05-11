# Security Specification for PointHub

## 1. Data Invariants
- A user can only access their own profile, earnings, withdrawals, and task/quiz attempts.
- Admins (identified by `admins` collection record or hardcoded super admin email) can access and moderate all data.
- Points cannot be arbitrarily incremented by the user without a valid task completion record.
- Withdrawal requests are immutable once they reach a terminal state (approved/rejected).
- Support chats are private between the user and the admin.

## 2. The Dirty Dozen Payloads

1. **Identity Spoofing**: Attempt to create a user profile with a different UID.
2. **Point Injection**: Attempt to directly update `points` field in user profile to a large number.
3. **Admin Escalation**: Attempt to create a record in the `admins` collection as a non-admin.
4. **Settings Poisoning**: Attempt to modify global settings (conversion rate, referral bonus) as a non-admin.
5. **Orphaned Earning**: Attempt to create an `earnings` record without a corresponding task completion.
6. **Withdrawal Hijacking**: Attempt to approve your own withdrawal request.
7. **Task Modification**: Attempt to disable a high-reward task as a user.
8. **PII Leak**: Attempt to read another user's email via a list query.
9. **Chat Eavesdropping**: Attempt to read the support chat transitions of another user.
10. **Quiz Result Manipulation**: Attempt to submit a quiz result with maximum points without answering questions.
11. **Referral Fraud**: Attempt to set your own `referredBy` field multiple times.
12. **System Field Override**: Attempt to modify `joinedAt` or `role` fields in your own profile.

## 3. Red Team Audit Checklist
- [ ] Identity Spoofing blocked?
- [ ] State Shortcutting blocked?
- [ ] Resource Poisoning blocked?
- [ ] Admin fields immutable for users?
- [ ] List queries properly filtered by `resource.data`?
