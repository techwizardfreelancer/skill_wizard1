(async () => {
  try {
    const base = 'http://127.0.0.1:5000';
    const loginRes = await fetch(base + '/api/auth/google-login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ idToken: 'dev-student' }),
    });
    const login = await loginRes.json();
    console.log('LOGIN', login);
    if (!login.token) return process.exit(1);
    const token = login.token;

    const assessmentsRes = await fetch(base + '/api/student/assessments', {
      headers: { Authorization: 'Bearer ' + token },
    });
    const assessments = await assessmentsRes.json();
    console.log('ASSESSMENTS', assessments);
    const assessmentId = (assessments.assessments && assessments.assessments[0] && assessments.assessments[0]._id) || (assessments[0] && assessments[0]._id);
    console.log('ASSESSMENT_ID', assessmentId);
    if (!assessmentId) return process.exit(1);

    const qsRes = await fetch(base + '/api/assessments/' + assessmentId + '/questions', {
      headers: { Authorization: 'Bearer ' + token },
    });
    const qs = await qsRes.json();
    console.log('QUESTIONS', qs);
    const questionId = qs.questions && qs.questions[0] && qs.questions[0]._id;
    console.log('QUESTION_ID', questionId);
    if (!questionId) return process.exit(1);

    const runRes = await fetch(base + '/api/assessments/run-code', {
      method: 'POST',
      headers: { 'content-type': 'application/json', Authorization: 'Bearer ' + token },
      body: JSON.stringify({ code: 's=input().strip();print(s[::-1])', language: 'python', questionId }),
    });
    const runJson = await runRes.json();
    console.log('RUN', runJson);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();