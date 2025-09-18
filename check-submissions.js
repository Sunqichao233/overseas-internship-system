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

// 创建学生名字的变体映射（处理可能的字符差异）
const nameVariants = {
    '刘浩然': ['劉浩然'],
    '刘佳艳': ['劉佳艳', '劉佳豔'],
    '陈曦': ['陳曦'],
    '陈紫彤': ['陳紫彤'],
    '周騫騫': ['周骞骞'],
    '徐若熒': ['徐若荧'],
    '徐淑潔': ['徐淑洁'],
    '蔡姿穎': ['蔡姿颖'],
    '朱家緯': ['朱家纬'],
    '孟楨璽': ['孟祯玺'],
    '金旭沢': ['金旭泽'],
    '唐韻茜': ['唐韵茜'],
    '许如清': ['許如清'],
    '安书雯': ['安書雯']
};

// 获取所有可能的名字变体
function getAllNameVariants() {
    const allNames = new Set(studentList);
    
    // 添加所有变体
    for (const [original, variants] of Object.entries(nameVariants)) {
        variants.forEach(variant => allNames.add(variant));
    }
    
    return Array.from(allNames);
}

// 从文件名中提取姓名
function extractNameFromFilename(filename) {
    // 文件格式: {姓名}_{时间戳}.{扩展名}
    const match = filename.match(/^(.+?)_\d+\./);
    return match ? match[1] : filename;
}

// 检查姓名是否在名单中（考虑变体）
function isNameInList(name, nameList) {
    // 直接匹配
    if (nameList.includes(name)) {
        return true;
    }
    
    // 检查是否是某个名字的变体
    for (const [original, variants] of Object.entries(nameVariants)) {
        if (variants.includes(name) && nameList.includes(original)) {
            return true;
        }
        if (name === original && variants.some(variant => nameList.includes(variant))) {
            return true;
        }
    }
    
    return false;
}

// 主要统计函数
function checkSubmissions() {
    const uploadsDir = path.join(__dirname, 'public', 'uploads');
    
    console.log('🔍 正在检查作业提交情况...\n');
    console.log('📋 海外实习学生名单 (共23人):');
    studentList.forEach((name, index) => {
        console.log(`${(index + 1).toString().padStart(2, ' ')}. ${name}`);
    });
    console.log('\n' + '='.repeat(50) + '\n');
    
    try {
        // 检查uploads目录是否存在
        if (!fs.existsSync(uploadsDir)) {
            console.log('❌ uploads目录不存在');
            return;
        }
        
        // 读取uploads目录中的所有文件
        const files = fs.readdirSync(uploadsDir);
        const uploadedFiles = files.filter(file => file !== '.gitkeep');
        
        if (uploadedFiles.length === 0) {
            console.log('📁 uploads目录为空，暂无提交的作业');
            return;
        }
        
        console.log(`📁 发现 ${uploadedFiles.length} 个上传文件\n`);
        
        // 提取所有提交者姓名
        const submittedNames = new Set();
        const filesByName = {};
        
        uploadedFiles.forEach(file => {
            const name = extractNameFromFilename(file);
            submittedNames.add(name);
            
            if (!filesByName[name]) {
                filesByName[name] = [];
            }
            filesByName[name].push(file);
        });
        
        // 获取所有可能的合法姓名
        const allValidNames = getAllNameVariants();
        
        // 分类统计
        const validSubmissions = [];
        const invalidSubmissions = [];
        const notSubmitted = [];
        
        // 检查提交的姓名
        submittedNames.forEach(name => {
            if (isNameInList(name, allValidNames)) {
                validSubmissions.push(name);
            } else {
                invalidSubmissions.push(name);
            }
        });
        
        // 检查未提交的学生
        studentList.forEach(student => {
            let hasSubmitted = false;
            submittedNames.forEach(submittedName => {
                if (isNameInList(submittedName, [student]) || 
                    isNameInList(student, [submittedName])) {
                    hasSubmitted = true;
                }
            });
            
            if (!hasSubmitted) {
                notSubmitted.push(student);
            }
        });
        
        // 输出统计结果
        console.log('📊 统计结果:');
        console.log(`✅ 已提交作业: ${validSubmissions.length}人`);
        console.log(`❌ 未提交作业: ${notSubmitted.length}人`);
        console.log(`⚠️  不在名单中: ${invalidSubmissions.length}人`);
        console.log(`📄 总文件数: ${uploadedFiles.length}个\n`);
        
        // 详细信息
        if (validSubmissions.length > 0) {
            console.log('✅ 已提交作业的学生:');
            validSubmissions.forEach((name, index) => {
                const fileCount = filesByName[name].length;
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
                const fileCount = filesByName[name].length;
                console.log(`${(index + 1).toString().padStart(2, ' ')}. ${name} (${fileCount}个文件)`);
                filesByName[name].forEach(file => {
                    console.log(`     📄 ${file}`);
                });
            });
            console.log('');
        }
        
        // 提交率统计
        const submissionRate = ((validSubmissions.length / studentList.length) * 100).toFixed(1);
        console.log(`📈 作业提交率: ${submissionRate}% (${validSubmissions.length}/${studentList.length})`);
        
    } catch (error) {
        console.error('❌ 检查过程中发生错误:', error.message);
    }
}

// 如果直接运行此脚本
if (require.main === module) {
    checkSubmissions();
}

module.exports = { checkSubmissions };
