# Security Spec - AnatomyZ Firestore

## 1. Data Invariants
- `users`: A user document at `/users/{userId}` can only be created or modified by `request.auth.uid == userId`.
- `exams`: An exam can only be created by an authenticated user where `authorId == request.auth.uid`. Only the author can update or delete their exam. Published exams can be read by authenticated users.
- `exam_results`: An exam result at `/exam_results/{resultId}` can only be created by the student completing the exam (`studentId == request.auth.uid`). Once submitted, it cannot be modified by students to preserve exam integrity. Authors of the exam can read the results.
- `history`: A history entry at `/history/{historyId}` belongs strictly to `userId == request.auth.uid`.

## 2. Dirty Dozen Payloads (Target Rejections)
1. Unauthenticated write to `/users/user123`
2. Authenticated user A attempting to write `/users/userB`
3. Student creating an exam with `authorId` pointing to another professor
4. User attempting to create a user with an invalid role `admin_super`
5. User injecting a 2MB payload into `displayName`
6. Student modifying an existing `exam_results` record to change their score from 50% to 100%
7. User reading another user's private history records
8. User creating an exam result for another student (`studentId != request.auth.uid`)
9. Non-author deleting an exam
10. Unauthenticated read of private user records
11. Query scraping results of all students across the entire institution without ownership filter
12. Malicious document ID injection with non-alphanumeric characters like `../../etc`
