import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import type { ProblemLog, ProblemType } from '@/types';

const DATA_DIR = path.join(process.cwd(), 'data');
const LOG_FILE = path.join(DATA_DIR, 'problems.json');

// 确保数据目录存在
async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch (error) {
    console.error('创建数据目录失败:', error);
  }
}

// 读取所有问题
async function readProblems(): Promise<ProblemLog[]> {
  await ensureDataDir();
  try {
    const data = await fs.readFile(LOG_FILE, 'utf-8');
    const problems = JSON.parse(data);
    // 兼容旧数据：如果没有type字段，默认为'room'
    return problems.map((p: any) => ({
      ...p,
      type: p.type || 'room',
    }));
  } catch (error) {
    return [];
  }
}

// 保存所有问题
async function saveProblems(problems: ProblemLog[]) {
  await ensureDataDir();
  await fs.writeFile(LOG_FILE, JSON.stringify(problems, null, 2), 'utf-8');
}

// GET - 查询问题列表
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type') || '';
    const roomNumber = searchParams.get('roomNumber') || '';
    const startDate = searchParams.get('startDate') || '';
    const endDate = searchParams.get('endDate') || '';

    let problems = await readProblems();

    // 筛选
    if (type) {
      problems = problems.filter(p => p.type === type);
    }

    if (roomNumber) {
      problems = problems.filter(p => 
        p.roomNumber && p.roomNumber.toLowerCase().includes(roomNumber.toLowerCase())
      );
    }

    if (startDate) {
      problems = problems.filter(p => p.createdAt >= startDate);
    }

    if (endDate) {
      problems = problems.filter(p => p.createdAt <= endDate + 'T23:59:59');
    }

    // 按创建时间倒序
    problems.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return NextResponse.json({ success: true, data: problems });
  } catch (error) {
    console.error('查询问题失败:', error);
    return NextResponse.json(
      { success: false, message: '查询失败' },
      { status: 500 }
    );
  }
}

// POST - 添加新问题
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, roomNumber, description, images, notes } = body;

    if (!type || (type !== 'room' && type !== 'announcement')) {
      return NextResponse.json(
        { success: false, message: '问题类型无效' },
        { status: 400 }
      );
    }

    if (!description) {
      return NextResponse.json(
        { success: false, message: '问题描述不能为空' },
        { status: 400 }
      );
    }

    // 房间问题需要房号，公共问题不需要
    if (type === 'room' && !roomNumber) {
      return NextResponse.json(
        { success: false, message: '房间问题需要填写房号' },
        { status: 400 }
      );
    }

    const newProblem: ProblemLog = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      type: type as ProblemType,
      roomNumber: type === 'room' ? roomNumber : '',
      description,
      images: images || [],
      notes: notes || '',
      createdAt: new Date().toISOString(),
    };

    const problems = await readProblems();
    problems.push(newProblem);
    await saveProblems(problems);

    return NextResponse.json({ success: true, data: newProblem });
  } catch (error) {
    console.error('保存问题失败:', error);
    return NextResponse.json(
      { success: false, message: '保存失败' },
      { status: 500 }
    );
  }
}

