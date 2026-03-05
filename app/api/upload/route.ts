import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir, access, stat } from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;
    const name: string = data.get('name') as string;
    const assignment: string = data.get('assignment') as string;

    if (!file) {
      return NextResponse.json({ 
        message: '未选择文件',
        success: false 
      }, { status: 400 });
    }

    if (!name || name.trim() === '') {
      return NextResponse.json({ 
        message: '请输入姓名',
        success: false 
      }, { status: 400 });
    }

    if (!assignment || assignment.trim() === '') {
      return NextResponse.json({
        message: '请选择作业目录',
        success: false
      }, { status: 400 });
    }

    // 获取文件扩展名
    const fileExtension = path.extname(file.name).toLowerCase();
    if (fileExtension !== '.zip') {
      return NextResponse.json({
        message: '仅支持上传 .zip 压缩包',
        success: false
      }, { status: 400 });
    }

    const timestamp = Date.now();
    const sanitizedName = name.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_');
    const sanitizedAssignment = assignment.trim().replace(/[\\/]/g, '');
    if (!sanitizedAssignment || sanitizedAssignment.includes('..')) {
      return NextResponse.json({
        message: '作业目录不合法',
        success: false
      }, { status: 400 });
    }

    const fileName = `${sanitizedName}_${timestamp}${fileExtension}`;

    // 创建上传目录
    const uploadRoot = path.join(process.cwd(), 'public', 'uploads');
    const uploadDir = path.join(uploadRoot, sanitizedAssignment);
    try {
      await access(uploadDir);
      const directoryInfo = await stat(uploadDir);
      if (!directoryInfo.isDirectory()) {
        return NextResponse.json({
          message: '所选作业目录不存在',
          success: false
        }, { status: 400 });
      }
    } catch {
      return NextResponse.json({
        message: '所选作业目录不存在',
        success: false
      }, { status: 400 });
    }

    // 将文件转换为Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 写入文件
    const filePath = path.join(uploadDir, fileName);
    await mkdir(uploadDir, { recursive: true });
    await writeFile(filePath, buffer);

    return NextResponse.json({
      message: '文件上传成功！',
      success: true,
      name: name,
      assignment: sanitizedAssignment,
      file: fileName,
      uploadPath: `/uploads/${sanitizedAssignment}/${fileName}`
    });

  } catch (error) {
    console.error('文件上传错误:', error);
    return NextResponse.json({ 
      message: '文件上传失败，请重试',
      success: false 
    }, { status: 500 });
  }
}
