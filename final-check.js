const fs = require('fs');
const path = require('path');

// 海外实习学生名单（标准名单）
const studentList = [
    '薛舒文', '黄玉婷', '周騫騫', '林雨晴', '王睿清',
    '朱家緯', '蔡姿穎', '茅懋', '陈曦', '徐若熒',
    '许如清', '徐淑潔', '朱沅珊', '洪佳逸', '孟楨璽',
    '金旭沢', '刘浩然', '陈紫彤', '唐韻茜', '王雨桐',
    '刘佳艳', '安书雯', '姚奕晨'
];

function checkSubmissions() {
    const uploadsDir = path.join(__dirname, 'public', 'uploads');
    
    console.log('📊 海外实习作业提交统计');
    console.log('========================');
    console.log(`📋 学生总数: ${studentList.length}人\n`);
    
    try {
        if (!fs.existsSync(uploadsDir)) {
            console.log('❌ uploads目录不存在');
            return;
        }
        
        const files = fs.readdirSync(uploadsDir);
        const uploadedFiles = files.filter(file => file !== '.gitkeep');
        
        console.log(`📁 上传文件总数: ${uploadedFiles.length}个\n`);
        
        if (uploadedFiles.length === 0) {
            console.log('📁 暂无作业提交');
            console.log(`❌ 未提交学生: ${studentList.length}人`);
            studentList.forEach((name, index) => {
                console.log(`${(index + 1).toString().padStart(2, ' ')}. ${name}`);
            });
            return;
        }
        
        // 提取所有提交者姓名（去重）
        const submittedNames = new Set();
        const fileDetails = [];
        
        uploadedFiles.forEach(file => {
            const match = file.match(/^(.+?)_\d+\./);
            const name = match ? match[1] : file;
            submittedNames.add(name);
            fileDetails.push({ name, file });
        });
        
        console.log(`👥 提交者总数: ${submittedNames.size}人\n`);
        
        // 分析提交情况
        const validSubmissions = [];
        const invalidSubmissions = [];
        const notSubmitted = [];
        
        // 检查每个提交者是否在名单中
        submittedNames.forEach(name => {
            // 直接匹配或处理常见的繁简体差异
            const isValid = studentList.some(student => {
                return student === name || 
                       // 处理常见的繁简体和异体字
                       (student === '周騫騫' && name === '周骞骞') ||
                       (student === '蔡姿穎' && name === '蔡姿颖') ||
                       (student === '唐韻茜' && name === '唐韵茜') ||
                       (student === '孟楨璽' && name === '孟桢玺') ||
                       (student === '金旭沢' && name === '金旭泽') ||
                       (student === '安书雯' && name === '安书雯');
            });
            
            if (isValid) {
                validSubmissions.push(name);
            } else {
                invalidSubmissions.push(name);
            }
        });
        
        // 检查未提交的学生
        studentList.forEach(student => {
            const hasSubmitted = Array.from(submittedNames).some(name => {
                return student === name || 
                       (student === '周騫騫' && name === '周骞骞') ||
                       (student === '蔡姿穎' && name === '蔡姿颖') ||
                       (student === '唐韻茜' && name === '唐韵茜') ||
                       (student === '孟楨璽' && name === '孟桢玺') ||
                       (student === '金旭沢' && name === '金旭泽') ||
                       (student === '安书雯' && name === '安书雯');
            });
            
            if (!hasSubmitted) {
                notSubmitted.push(student);
            }
        });
        
        // 输出统计结果
        console.log('📈 统计结果:');
        console.log(`✅ 已提交作业: ${validSubmissions.length}人`);
        console.log(`❌ 未提交作业: ${notSubmitted.length}人`);
        console.log(`⚠️  不在名单中: ${invalidSubmissions.length}人`);
        
        const submissionRate = ((validSubmissions.length / studentList.length) * 100).toFixed(1);
        console.log(`📊 提交率: ${submissionRate}%\n`);
        
        // 显示详细信息
        if (validSubmissions.length > 0) {
            console.log('✅ 已提交作业的学生:');
            validSubmissions.forEach((name, index) => {
                const fileCount = fileDetails.filter(f => f.name === name).length;
                console.log(`${(index + 1).toString().padStart(2, ' ')}. ${name} (${fileCount}个文件)`);
            });
            console.log('');
        }
        
        if (notSubmitted.length > 0) {
            console.log('❌ 未提交作业的学生:');
            notSubmitted.forEach((name, index) => {
                console.log(`${(index + 1).toString().padStart(2, ' ')}. ${name}`);
            });
            console.log('');
        }
        
        if (invalidSubmissions.length > 0) {
            console.log('⚠️  不在名单中的提交者:');
            invalidSubmissions.forEach((name, index) => {
                const files = fileDetails.filter(f => f.name === name);
                console.log(`${(index + 1).toString().padStart(2, ' ')}. ${name} (${files.length}个文件)`);
                files.forEach(f => {
                    console.log(`     📄 ${f.file}`);
                });
            });
        }
        
    } catch (error) {
        console.error('❌ 统计过程中发生错误:', error.message);
    }
}

checkSubmissions();
