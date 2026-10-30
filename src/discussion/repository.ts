import seed from '../data/assessment.json';
import { MAX_COMMENT_LENGTH } from './types';
import type { Comment, CreateCommentInput, DiscussionData } from './types';

export type Scenario = 'normal' | 'loading' | 'initial-error' | 'load-error' | 'submit-error' | 'empty-records';
type Operation = 'initial' | 'load' | 'submit';
export function createRepository({ development = false, delay = 900, scenario = 'normal' as Scenario } = {}) {
  const data = JSON.parse(JSON.stringify(seed)) as DiscussionData;
  const opened = new Set<string>();
  const pending = new Map<string, Promise<void>>();
  let failed = false;
  let sequence = 0;
  async function request(operation: Operation) {
    const duration = development ? (scenario === 'loading' ? 4000 : Math.max(0, Math.min(Number.isFinite(delay) ? delay : 900, 4000))) : 0;
    if (duration) await new Promise(resolve => setTimeout(resolve, duration));
    if (development && !failed && scenario === `${operation}-error`) {
      failed = true;
      throw new Error('DEMO_REQUEST_FAILED');
    }
  }
  return {
    async loadInitialData(): Promise<DiscussionData> {
      await request('initial');
      return { ...data, records: development && scenario === 'empty-records' ? [] : data.records, comments: [...data.comments] };
    },
    async loadRecord(recordId: string) {
      if (!data.records.some(r => r.id === recordId)) throw new Error('UNAVAILABLE');
      if (opened.has(recordId)) return;
      let task = pending.get(recordId);
      if (!task) {
        task = request('load').then(() => { opened.add(recordId); }).finally(() => { pending.delete(recordId); });
        pending.set(recordId, task);
      }
      await task;
    },
    async createComment(input: CreateCommentInput): Promise<Comment> {
      const body = input.body.trim();
      if (!body) throw new Error('EMPTY_COMMENT');
      if (body.length > MAX_COMMENT_LENGTH) throw new Error('COMMENT_TOO_LONG');
      if (!data.records.some(r => r.id === input.recordId)) throw new Error('UNAVAILABLE');
      if (input.authorId !== data.currentUser.id) throw new Error('INVALID_AUTHOR');
      if (input.language !== 'en' && input.language !== 'ar') throw new Error('INVALID_LOCALE');
      if (input.parentId !== null && !data.comments.some(c => c.id === input.parentId && c.recordId === input.recordId && c.parentId === null)) throw new Error('INVALID_REPLY_TARGET');
      await request('submit');
      const comment: Comment = { ...input, body, id: `mobile-${Date.now()}-${++sequence}`, createdAt: new Date().toISOString(), updatedAt: null };
      data.comments.push(comment);
      return { ...comment };
    },
  };
}
