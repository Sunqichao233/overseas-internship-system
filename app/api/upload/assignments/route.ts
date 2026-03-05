import { NextResponse } from 'next/server';
import { readdir } from 'fs/promises';
import path from 'path';

export async function GET() {
  try {
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    const entries = await readdir(uploadsDir, { withFileTypes: true });
    const assignments = entries
      .filter((entry) => entry.isDirectory() && !entry.name.startsWith('.'))
      .map((entry) => entry.name)
      .sort((a, b) => a.localeCompare(b, 'zh-Hans-CN'));

    return NextResponse.json({
      success: true,
      data: assignments
    });
  } catch (error) {
    console.error('获取作业目录失败:', error);
    return NextResponse.json({
      success: false,
      message: '获取作业目录失败'
    }, { status: 500 });
  }
}
