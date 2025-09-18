import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;
    const name: string = data.get('name') as string;

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

    // 获取文件扩展名
    const fileExtension = path.extname(file.name);
    const timestamp = Date.now();
    const sanitizedName = name.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_');
    const fileName = `${sanitizedName}_${timestamp}${fileExtension}`;

    // 创建上传目录
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (error) {
      // 目录可能已存在，忽略错误
    }

    // 将文件转换为Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 写入文件
    const filePath = path.join(uploadDir, fileName);
    await writeFile(filePath, buffer);

    return NextResponse.json({
      message: '文件上传成功！',
      success: true,
      name: name,
      file: fileName,
      uploadPath: `/uploads/${fileName}`
    });

  } catch (error) {
    console.error('文件上传错误:', error);
    return NextResponse.json({ 
      message: '文件上传失败，请重试',
      success: false 
    }, { status: 500 });
  }
}
