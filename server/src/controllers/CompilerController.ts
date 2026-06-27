import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { SubmissionService } from '../services/SubmissionService';
import { getSocketServer } from '../sockets/socketServer';

const submissionService = new SubmissionService();

export class CompilerController {
  public static async run(req: Request, res: Response): Promise<Response> {
    const submissionId = uuidv4();
    const { language, questionId, code, testCases } = req.body;

    const submission = {
      id: submissionId,
      language,
      questionId,
      code,
      testCases: Array.isArray(testCases) ? testCases : [],
    };

    const result = await submissionService.processRun(submission);
    return res.json({ submissionId, ...result });
  }

  public static async submit(req: Request, res: Response): Promise<Response> {
    const submissionId = uuidv4();
    const { language, questionId, code } = req.body;

    const submission = {
      id: submissionId,
      language,
      questionId,
      code,
      testCases: [],
    };

    const result = await submissionService.enqueueSubmission(submission);
    const io = getSocketServer();
    if (io) {
      io.emit('submission-created', {
        submissionId,
        questionId,
        language,
        status: 'pending',
      });
    }

    return res.status(202).json({ submissionId, status: result.status, message: result.message });
  }

  public static async status(req: Request, res: Response): Promise<Response> {
    const { id } = req.params;
    const submission = await submissionService.getSubmissionById(id);
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found.' });
    }
    return res.status(200).json({ submissionId: id, status: submission.status, score: submission.score });
  }

  public static async result(req: Request, res: Response): Promise<Response> {
    const { id } = req.params;
    const submission = await submissionService.getSubmissionById(id);
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found.' });
    }
    return res.status(200).json({ submission });
  }
}
