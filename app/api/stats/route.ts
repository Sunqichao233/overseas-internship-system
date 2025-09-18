import { NextResponse } from 'next/server';
import { readdir, access } from 'fs/promises';
import path from 'path';

// 海外实习学生名单
const studentList = [
  '薛舒文', '黄玉婷', '周騫騫', '林雨晴', '王睿清',
  '朱家緯', '蔡姿穎', '茅懋', '陈曦', '徐若熒',
  '许如清', '徐淑潔', '朱沅珊', '洪佳逸', '孟楨璽',
  '金旭沢', '刘浩然', '陈紫彤', '唐韻茜', '王雨桐',
  '刘佳艳', '安书雯', '姚奕晨'
];

// 处理繁简体和异体字匹配
function normalizeAndMatch(submittedName: string, studentName: string): boolean {
  if (submittedName === studentName) return true;
  
  const mappings: Record<string, string[]> = {
    '周騫騫': ['周骞骞'],
    '蔡姿穎': ['蔡姿颖'],
    '唐韻茜': ['唐韵茜'],
    '孟楨璽': ['孟桢玺'],
    '金旭沢': ['金旭泽'],
    '徐若熒': ['徐若荧'],
    '徐淑潔': ['徐淑洁'],
    '朱家緯': ['朱家纬'],
    '刘浩然': ['劉浩然'],
    '刘佳艳': ['劉佳艳', '劉佳豔'],
    '陈曦': ['陳曦'],
    '陈紫彤': ['陳紫彤'],
    '许如清': ['許如清'],
    '安书雯': ['安書雯']
  };
  
  // 检查是否是某个学生的变体
  for (const [standard, variants] of Object.entries(mappings)) {
    if (standard === studentName && variants.includes(submittedName)) {
      return true;
    }
  }
  
  return false;
}

// 检查学生是否有批改结果文件
async function checkResultFile(studentName: string): Promise<{hasResult: boolean, fileName?: string}> {
  const resultsDir = path.join(process.cwd(), 'public', 'results');
  const possibleExtensions = ['.pdf', '.docx', '.doc', '.txt', '.zip', '.html'];
  
  for (const ext of possibleExtensions) {
    const fileName = `${studentName}_批改结果${ext}`;
    const filePath = path.join(resultsDir, fileName);
    
    try {
      await access(filePath);
      return { hasResult: true, fileName };
    } catch {
      // 文件不存在，继续检查下一个格式
    }
  }
  
  return { hasResult: false };
}

export async function GET() {
  try {
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    
    let files: string[] = [];
    try {
      files = await readdir(uploadsDir);
    } catch (error) {
      return NextResponse.json({
        success: false,
        message: 'uploads目录不存在'
      });
    }
    
    const uploadedFiles = files.filter(file => file !== '.gitkeep');
    
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
          invalidSubmissions: []
        }
      });
    }
    
    // 解析文件名，提取提交者信息
    const submissions = new Map<string, { files: string[], count: number }>();
    
    uploadedFiles.forEach(file => {
      const match = file.match(/^(.+?)_\d+\./);
      const name = match ? match[1] : file;
      
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
      for (const [submittedName, submission] of submissions.entries()) {
        if (normalizeAndMatch(submittedName, studentName)) {
          status = 'submitted';
          fileCount = submission.count;
          files = submission.files;
          break;
        }
      }
      
      // 检查是否有批改结果文件
      const resultInfo = await checkResultFile(studentName);
      
      return {
        name: studentName,
        status,
        fileCount,
        files,
        hasResult: resultInfo.hasResult,
        resultFileName: resultInfo.fileName
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
