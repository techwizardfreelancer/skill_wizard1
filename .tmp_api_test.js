(async () => {
  try {
    const base = 'http://127.0.0.1:5000';
    const loginRes = await fetch(base + '/api/auth/google-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken: 'dev-student' }),
    });
    const login = await loginRes.json();
    console.log('LOGIN', JSON.stringify(login, null, 2));
    if (!login.token) {
      console.error('No token from login');
      return;
    }
    const token = login.token;

    const assessmentsRes = await fetch(base + '/api/student/assessments', {
      headers: { Authorization: 'Bearer ' + token },
    });
    const assessments = await assessmentsRes.json();
    console.log('ASSESSMENTS', JSON.stringify(assessments, null, 2));
    const assessmentId = assessments.assessments?.[0]?._id || assessments[0]?._id;
    console.log('ASSESSMENT_ID', assessmentId);
    if (!assessmentId) {
      console.error('No assessment ID found');
      return;
    }

    const qsRes = await fetch(base + '/api/assessments/' + assessmentId + '/questions', {
      headers: { Authorization: 'Bearer ' + token },
    });
    const qs = await qsRes.json();
    console.log('QUESTIONS', JSON.stringify(qs, null, 2));
    const questionId = qs.questions?.[0]?._id;
    console.log('QUESTION_ID', questionId);
    if (!questionId) {
      console.error('No question ID found');
      return;
    }

    const runRes = await fetch(base + '/api/assessments/run-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
      body: JSON.stringify({ code: 'a,b=map(int,input().split());print(a+b)', language: 'python', questionId }),
    });
    const runJson = await runRes.json();
    console.log('RUN', JSON.stringify(runJson, null, 2));
  } catch (err) {
    console.error('ERROR', err);
  }
})();