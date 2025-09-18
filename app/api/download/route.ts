import { NextRequest, NextResponse } from 'next/server';
import { readFile, access } from 'fs/promises';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const studentName = searchParams.get('student');

    if (!studentName) {
      return NextResponse.json({
        success: false,
        message: '请提供学生姓名参数'
      }, { status: 400 });
    }

    const resultsDir = path.join(process.cwd(), 'public', 'results');
    
    // 支持多种文件格式的批改结果
    const possibleExtensions = ['.pdf', '.docx', '.doc', '.txt', '.zip', '.html'];
    let resultFile = null;
    let filePath = '';

    // 查找匹配的批改结果文件
    for (const ext of possibleExtensions) {
      const fileName = `${studentName}_批改结果${ext}`;
      const testPath = path.join(resultsDir, fileName);
      
      try {
        await access(testPath);
        resultFile = fileName;
        filePath = testPath;
        break;
      } catch {
        // 文件不存在，继续查找其他格式
      }
    }

    if (!resultFile) {
      return NextResponse.json({
        success: false,
        message: `未找到 ${studentName} 的批改结果文件`
      }, { status: 404 });
    }

    // 读取文件
    const fileBuffer = await readFile(filePath);
    
    // 获取文件扩展名来设置正确的Content-Type
    const fileExtension = path.extname(resultFile).toLowerCase();
    let contentType = 'application/octet-stream';
    
    switch (fileExtension) {
      case '.pdf':
        contentType = 'application/pdf';
        break;
      case '.docx':
        contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        break;
      case '.doc':
        contentType = 'application/msword';
        break;
      case '.txt':
        contentType = 'text/plain; charset=utf-8';
        break;
      case '.html':
        contentType = 'text/html; charset=utf-8';
        break;
      case '.zip':
        contentType = 'application/zip';
        break;
    }

    // 设置响应头
    const response = new NextResponse(fileBuffer);
    response.headers.set('Content-Type', contentType);
    response.headers.set('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(resultFile)}`);
    response.headers.set('Cache-Control', 'no-cache');
    
    return response;

  } catch (error) {
    console.error('下载批改结果错误:', error);
    return NextResponse.json({
      success: false,
      message: '下载文件时发生错误'
    }, { status: 500 });
  }
}
