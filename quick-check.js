const fs = require('fs');
const path = require('path');

// 海外实习学生名单
const studentList = [
    '薛舒文', '黄玉婷', '周騫騫', '林雨晴', '王睿清',
    '朱家緯', '蔡姿穎', '茅懋', '陈曦', '徐若熒',
    '许如清', '徐淑潔', '朱沅珊', '洪佳逸', '孟楨璽',
    '金旭沢', '刘浩然', '陈紫彤', '唐韻茜', '王雨桐',
    '刘佳艳', '安书雯', '姚奕晨'
];

// 简化的名字匹配（处理繁简体差异）
function normalizeNames(names) {
    return names.map(name => {
        return name
            .replace(/劉/g, '刘')
            .replace(/陳/g, '陈')
            .replace(/騫/g, '骞')
            .replace(/熒/g, '荧')
            .replace(/潔/g, '洁')
            .replace(/穎/g, '颖')
            .replace(/緯/g, '纬')
            .replace(/楨璽/g, '祯玺')
            .replace(/沢/g, '泽')
            .replace(/韻/g, '韵')
            .replace(/許/g, '许')
            .replace(/書/g, '书');
    });
}

function quickCheck() {
    const uploadsDir = path.join(__dirname, 'public', 'uploads');
    
    console.log('📊 快速统计结果');
    console.log('==================');
    
    try {
        if (!fs.existsSync(uploadsDir)) {
            console.log('❌ uploads目录不存在');
            return;
        }
        
        const files = fs.readdirSync(uploadsDir);
        const uploadedFiles = files.filter(file => file !== '.gitkeep');
        
        if (uploadedFiles.length === 0) {
            console.log('📁 暂无作业提交');
            return;
        }
        
        // 提取姓名
        const submittedNames = uploadedFiles.map(file => {
            const match = file.match(/^(.+?)_\d+\./);
            return match ? match[1] : file;
        });
        
        // 标准化名字
        const normalizedSubmitted = normalizeNames(submittedNames);
        const normalizedStudentList = normalizeNames(studentList);
        
        // 统计
        const validSubmissions = [];
        const invalidSubmissions = [];
        const notSubmitted = [];
        
        // 检查有效提交
        normalizedSubmitted.forEach((name, index) => {
            if (normalizedStudentList.includes(name)) {
                const originalName = submittedNames[index];
                if (!validSubmissions.includes(originalName)) {
                    validSubmissions.push(originalName);
                }
            } else {
                const originalName = submittedNames[index];
                if (!invalidSubmissions.includes(originalName)) {
                    invalidSubmissions.push(originalName);
                }
            }
        });
        
        // 检查未提交
        normalizedStudentList.forEach((normalizedName, index) => {
            if (!normalizedSubmitted.includes(normalizedName)) {
                notSubmitted.push(studentList[index]);
            }
        });
        
        // 输出结果
        console.log(`📄 总文件数: ${uploadedFiles.length}`);
        console.log(`✅ 已提交: ${validSubmissions.length}人`);
        console.log(`❌ 未提交: ${notSubmitted.length}人`);
        console.log(`⚠️  不在名单: ${invalidSubmissions.length}人`);
        
        const submissionRate = ((validSubmissions.length / studentList.length) * 100).toFixed(1);
        console.log(`📈 提交率: ${submissionRate}%`);
        
        if (notSubmitted.length > 0) {
            console.log('\n❌ 未提交作业的学生:');
            notSubmitted.forEach(name => console.log(`   • ${name}`));
        }
        
        if (invalidSubmissions.length > 0) {
            console.log('\n⚠️  不在名单中的提交者:');
            invalidSubmissions.forEach(name => console.log(`   • ${name}`));
        }
        
    } catch (error) {
        console.error('❌ 检查失败:', error.message);
    }
}

quickCheck();
