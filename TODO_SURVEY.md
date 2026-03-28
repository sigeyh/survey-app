# Survey Variety Implementation

## Information Gathered
- dashboard has 30+ unique MOCK_JOBS with different topics
- survey/[id]/page.tsx has fixed 4 questions for all surveys
- Need job-specific questions based on survey ID

## Plan
1. Create src/data/surveyQuestions.ts with unique questions per job ID
2. Update survey/[id]/page.tsx to load questions by ID
3. Update admin to manage survey questions (optional)

## Steps
- [x] Step 1: Create src/data/surveyQuestions.ts
- [x] Step 2: Update src/app/survey/[id]/page.tsx to use survey-specific questions
- [ ] Step 3: Test different survey IDs have unique questions

