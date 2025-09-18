import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;
    const studentName: string = data.get('studentName') as string;

    if (!file) {
      return NextResponse.json({ 
        message: '未选择文件',
        success: false 
      }, { status: 400 });
    }

    if (!studentName || studentName.trim() === '') {
      return NextResponse.json({ 
        message: '请选择学生',
        success: false 
      }, { status: 400 });
    }

    // 获取文件扩展名
    const fileExtension = path.extname(file.name);
    const fileName = `${studentName.trim()}_批改结果${fileExtension}`;

    // 创建results目录
    const resultsDir = path.join(process.cwd(), 'public', 'results');
    try {
      await mkdir(resultsDir, { recursive: true });
    } catch (error) {
      // 目录可能已存在，忽略错误
    }

    // 将文件转换为Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 写入文件
    const filePath = path.join(resultsDir, fileName);
    await writeFile(filePath, buffer);

    return NextResponse.json({
      message: '批改结果上传成功！',
      success: true,
      studentName: studentName,
      fileName: fileName,
      filePath: `/results/${fileName}`
    });

  } catch (error) {
    console.error('批改结果上传错误:', error);
    return NextResponse.json({ 
      message: '上传失败，请重试',
      success: false 
    }, { status: 500 });
  }
}
