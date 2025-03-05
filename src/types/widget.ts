export interface Widget {
  id: string;
  type: 'metrics' | 'projects' | 'referrals' | 'wiki' | 'ai-assistant' | 'partners';
  title: string;
  layout: {
    i: string;
    x: number;
    y: number;
    w: number;
    h: number;
    minW?: number;
    maxW?: number;
    minH?: number;
    maxH?: number;
  };
}