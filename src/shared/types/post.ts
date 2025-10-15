export type PostData = {
  postType: 'typeA' | 'typeB';
  initialState: Record<string, unknown>;
  metadata?: Record<string, unknown>;
};
