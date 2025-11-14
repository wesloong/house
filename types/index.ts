export type ProblemType = 'room' | 'announcement'; // 房间问题 | 公告问题

export interface ProblemLog {
  id: string;
  type: ProblemType; // 问题类型
  roomNumber: string; // 房号（房间问题必填，公告问题为空）
  description: string; // 描述
  images: string[]; // 图片URL数组
  notes: string; // 备注
  createdAt: string; // 创建时间
}

