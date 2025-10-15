import { useState } from 'react';
import { fetchAPI } from '../utils/api';
import { UserActionRequest, UserActionResponse } from '../../../shared/types/api';

interface UserActionDialogProps {
  action: 'create-post' | 'create-comment';
  onClose: () => void;
  onSuccess: (id: string) => void;
}

export const UserActionDialog = ({ action, onClose, onSuccess }: UserActionDialogProps) => {
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    text: '',
    postId: '',
    subredditName: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consent) {
      setError('You must consent to create content on your behalf');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const endpoint =
        action === 'create-post' ? '/api/create-user-post' : '/api/create-user-comment';

      const requestData: UserActionRequest = {
        action,
        consent,
        data:
          action === 'create-post'
            ? {
                title: formData.title,
                content: formData.content,
                subredditName: formData.subredditName,
              }
            : {
                postId: formData.postId,
                text: formData.text,
              },
      };

      const response = await fetchAPI<UserActionResponse>(endpoint, {
        method: 'POST',
        body: JSON.stringify(requestData),
      });

      if (response.success && response.id) {
        onSuccess(response.id);
        onClose();
      } else {
        setError(response.error || 'Failed to create content');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <h2 className="text-xl font-bold mb-4">
          {action === 'create-post' ? 'Create Post' : 'Create Comment'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {action === 'create-post' ? (
            <>
              <div>
                <label className="block text-sm font-medium mb-1">Subreddit</label>
                <input
                  type="text"
                  value={formData.subredditName}
                  onChange={(e) => setFormData({ ...formData, subredditName: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                  placeholder="subreddit name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                  placeholder="Post title"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Content</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                  placeholder="Post content"
                  rows={4}
                  required
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium mb-1">Post ID</label>
                <input
                  type="text"
                  value={formData.postId}
                  onChange={(e) => setFormData({ ...formData, postId: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                  placeholder="t3_xxxxx"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Comment Text</label>
                <textarea
                  value={formData.text}
                  onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                  placeholder="Your comment"
                  rows={4}
                  required
                />
              </div>
            </>
          )}

          <div className="flex items-start gap-2">
            <input
              type="checkbox"
              id="consent"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-1"
            />
            <label htmlFor="consent" className="text-sm text-gray-600">
              I consent to this app creating {action === 'create-post' ? 'a post' : 'a comment'} on
              my behalf using my Reddit account.
            </label>
          </div>

          {error && <div className="text-red-600 text-sm">{error}</div>}

          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded hover:bg-gray-50"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              disabled={loading || !consent}
            >
              {loading ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
