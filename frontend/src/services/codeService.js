import api from './api';

export async function runCodeSubmission({ code, language, assessmentId, questionId, compileOnly = false }) {
  const response = await api.post('/assessments/run-code', {
    code,
    language,
    assessmentId,
    questionId,
    compileOnly,
  });

  return response.data;
}

export async function submitCodeAnswer({ assessmentId, questionId, code, language }) {
  const response = await api.post(`/assessments/${assessmentId}/submit`, {
    questionId,
    code,
    language,
  });

  return response.data;
}

export async function getCurrentSubmission(assessmentId) {
  const response = await api.get(`/assessments/${assessmentId}/submission`);
  return response.data;
}

export default {
  runCodeSubmission,
  submitCodeAnswer,
  getCurrentSubmission,
};
