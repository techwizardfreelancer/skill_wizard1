import { QuestionModel, QuestionEntity } from '../models/QuestionEntity';

export class QuestionRepository {
  public async findById(questionId: string): Promise<QuestionEntity | null> {
    return QuestionModel.findOne({ questionId }).exec();
  }

  public async findVisibleTestCases(questionId: string) {
    const question = await this.findById(questionId);
    return question?.visibleTestCases || [];
  }

  public async findHiddenTestCases(questionId: string) {
    const question = await this.findById(questionId);
    return question?.hiddenTestCases || [];
  }
}
