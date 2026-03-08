import { NextRequest, NextResponse } from 'next/server';
import { readdir, stat } from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';

// 海外实习学生名单
const studentList = [
  '徐伟杰', '袁文轩', '凌祺轩', '吴炫颉', '陈一炫',
  '袁宇泽', '王浩棱', '董正焱', '钱琪譞', '孙怡雪',
  '马一允', '黄诗珏', '蒋文涛', '王嘉康', '杨泉浩',
  '张威', '张骆道', '汪彦隽', '王家豪', '武守浩',
  '汤震阳', '罗劲楠'
];

// 处理繁简体和异体字匹配
function normalizeAndMatch(submittedName: string, studentName: string): boolean {
  return submittedName === studentName;
}

async function collectUploadFiles(dir: string, prefix = ''): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    if (entry.name === '.gitkeep') {
      continue;
    }

    const entryPath = path.join(dir, entry.name);
    const relativePath = prefix ? path.join(prefix, entry.name) : entry.name;

    if (entry.isDirectory()) {
      const nestedFiles = await collectUploadFiles(entryPath, relativePath);
      files.push(...nestedFiles);
    } else {
      files.push(relativePath);
    }
  }

  return files;
}

export async function GET(request: NextRequest) {
  try {
    const uploadsRoot = path.join(process.cwd(), 'public', 'uploads');
    const assignmentParam = (request.nextUrl.searchParams.get('assignment') || '').trim();
    const assignment = assignmentParam && assignmentParam !== '__all__'
      ? assignmentParam.replace(/[\\/]/g, '')
      : '';
    const targetDir = assignment ? path.join(uploadsRoot, assignment) : uploadsRoot;

    if (assignment) {
      if (!assignment || assignment.includes('..')) {
        return NextResponse.json({
          success: false,
          message: '作业目录参数不合法'
        }, { status: 400 });
      }

      try {
        const targetStat = await stat(targetDir);
        if (!targetStat.isDirectory()) {
          return NextResponse.json({
            success: false,
            message: '所选作业目录不存在'
          }, { status: 400 });
        }
      } catch {
        return NextResponse.json({
          success: false,
          message: '所选作业目录不存在'
        }, { status: 400 });
      }
    }
    
    let files: string[] = [];
    try {
      files = await collectUploadFiles(targetDir);
    } catch (error) {
      return NextResponse.json({
        success: false,
        message: 'uploads目录不存在'
      });
    }
    
    const uploadedFiles = files;
    
    if (uploadedFiles.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          totalStudents: studentList.length,
          totalFiles: 0,
          submittedCount: 0,
          notSubmittedCount: studentList.length,
          invalidCount: 0,
          submissionRate: 0,
          students: studentList.map(name => ({
            name,
            status: 'not_submitted',
            fileCount: 0,
            files: []
          })),
          invalidSubmissions: [],
          selectedAssignment: assignment || '__all__'
        }
      });
    }
    
    // 解析文件名，提取提交者信息
    const submissions = new Map<string, { files: string[], count: number }>();
    
    uploadedFiles.forEach(file => {
      const baseFileName = path.basename(file);
      const match = baseFileName.match(/^(.+?)_\d+\./);
      const name = match ? match[1] : baseFileName;
      
      if (!submissions.has(name)) {
        submissions.set(name, { files: [], count: 0 });
      }
      
      const submission = submissions.get(name)!;
      submission.files.push(file);
      submission.count += 1;
    });
    
    // 分析每个学生的提交状态
    const studentStats = await Promise.all(studentList.map(async (studentName) => {
      let status = 'not_submitted';
      let fileCount = 0;
      let files: string[] = [];
      
      // 检查是否有匹配的提交
      for (const [submittedName, submission] of Array.from(submissions.entries())) {
        if (normalizeAndMatch(submittedName, studentName)) {
          status = 'submitted';
          fileCount = submission.count;
          files = submission.files;
          break;
        }
      }
      
      return {
        name: studentName,
        status,
        fileCount,
        files
      };
    }));
    
    // 找出不在名单中的提交者
    const invalidSubmissions: Array<{name: string, fileCount: number, files: string[]}> = [];
    
    submissions.forEach((submission, submittedName) => {
      const isValid = studentList.some(studentName => 
        normalizeAndMatch(submittedName, studentName)
      );
      
      if (!isValid) {
        invalidSubmissions.push({
          name: submittedName,
          fileCount: submission.count,
          files: submission.files
        });
      }
    });
    
    // 统计数据
    const submittedCount = studentStats.filter(s => s.status === 'submitted').length;
    const notSubmittedCount = studentStats.filter(s => s.status === 'not_submitted').length;
    const submissionRate = Math.round((submittedCount / studentList.length) * 100 * 10) / 10;
    
    return NextResponse.json({
      success: true,
      data: {
        totalStudents: studentList.length,
        totalFiles: uploadedFiles.length,
        submittedCount,
        notSubmittedCount,
        invalidCount: invalidSubmissions.length,
        submissionRate,
        students: studentStats,
        invalidSubmissions,
        selectedAssignment: assignment || '__all__',
        lastUpdated: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('统计数据获取错误:', error);
    return NextResponse.json({
      success: false,
      message: '获取统计数据失败'
    }, { status: 500 });
  }
}
