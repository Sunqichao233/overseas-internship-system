'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

// 海外实习学生名单
const studentList = [
  '薛舒文', '黄玉婷', '周騫騫', '林雨晴', '王睿清',
  '朱家緯', '蔡姿穎', '茅懋', '陈曦', '徐若熒',
  '许如清', '徐淑潔', '朱沅珊', '洪佳逸', '孟楨璽',
  '金旭沢', '刘浩然', '陈紫彤', '唐韻茜', '王雨桐',
  '刘佳艳', '安书雯', '姚奕晨'
];

interface UploadResult {
  studentName: string
  fileName: string
  uploadTime: string
}

export default function AdminPage() {
  const [selectedStudent, setSelectedStudent] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('')
  const [uploadHistory, setUploadHistory] = useState<UploadResult[]>([])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null
    setFile(selectedFile)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedStudent) {
      setMessage('请选择学生')
      setMessageType('error')
      return
    }

    if (!file) {
      setMessage('请选择要上传的批改结果文件')
      setMessageType('error')
      return
    }

    setIsUploading(true)
    setMessage('')

    try {
      const formData = new FormData()
      formData.append('studentName', selectedStudent)
      formData.append('file', file)

      const response = await fetch('/api/upload-result', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (result.success) {
        setMessage('批改结果上传成功！')
        setMessageType('success')
        
        // 添加到上传历史
        const newUpload: UploadResult = {
          studentName: selectedStudent,
          fileName: result.fileName,
          uploadTime: new Date().toLocaleString('zh-CN')
        }
        setUploadHistory(prev => [newUpload, ...prev])
        
        // 清空表单
        setSelectedStudent('')
        setFile(null)
        // 重置文件输入框
        const fileInput = document.getElementById('file-input') as HTMLInputElement
        if (fileInput) {
          fileInput.value = ''
        }
      } else {
        setMessage(result.message || '上传失败，请重试')
        setMessageType('error')
      }
    } catch (error) {
      console.error('上传错误:', error)
      setMessage('网络错误，请检查连接后重试')
      setMessageType('error')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* 页面头部 */}
        <div className="bg-white rounded-lg shadow-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-800">批改结果管理</h1>
            <div className="flex gap-3">
              <Link
                href="/stats"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
              >
                查看统计
              </Link>
              <Link
                href="/"
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md transition-colors"
              >
                返回首页
              </Link>
            </div>
          </div>
          <p className="text-gray-600">
            在这里上传学生作业的批改结果，学生可以在统计页面下载他们的批改结果。
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 上传表单 */}
          <div className="bg-white rounded-lg shadow-xl p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">上传批改结果</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* 学生选择 */}
              <div>
                <label htmlFor="student" className="block text-sm font-medium text-gray-700 mb-2">
                  选择学生 <span className="text-red-500">*</span>
                </label>
                <select
                  id="student"
                  value={selectedStudent}
                  onChange={(e) => setSelectedStudent(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  disabled={isUploading}
                >
                  <option value="">请选择学生...</option>
                  {studentList.map(student => (
                    <option key={student} value={student}>{student}</option>
                  ))}
                </select>
              </div>

              {/* 文件上传 */}
              <div>
                <label htmlFor="file-input" className="block text-sm font-medium text-gray-700 mb-2">
                  批改结果文件 <span className="text-red-500">*</span>
                </label>
                <input
                  type="file"
                  id="file-input"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.txt,.html,.zip"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent file:mr-4 file:py-1 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                  disabled={isUploading}
                />
                {file && (
                  <p className="mt-2 text-sm text-gray-600">
                    已选择文件: {file.name}
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  支持格式: PDF, Word文档, 文本文件, HTML, ZIP压缩包
                </p>
              </div>

              {/* 提交按钮 */}
              <button
                type="submit"
                disabled={isUploading}
                className={`w-full py-2 px-4 rounded-md font-medium transition-colors ${
                  isUploading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2'
                } text-white`}
              >
                {isUploading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    上传中...
                  </div>
                ) : (
                  '上传批改结果'
                )}
              </button>
            </form>

            {/* 消息提示 */}
            {message && (
              <div className={`mt-4 p-3 rounded-md ${
                messageType === 'success' 
                  ? 'bg-green-50 border border-green-200 text-green-800' 
                  : 'bg-red-50 border border-red-200 text-red-800'
              }`}>
                <div className="flex items-center">
                  {messageType === 'success' ? (
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  )}
                  <span className="text-sm font-medium">{message}</span>
                </div>
              </div>
            )}
          </div>

          {/* 上传历史 */}
          <div className="bg-white rounded-lg shadow-xl p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">最近上传记录</h2>
            
            {uploadHistory.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p>暂无上传记录</p>
              </div>
            ) : (
              <div className="space-y-3">
                {uploadHistory.map((record, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">{record.studentName}</h3>
                        <p className="text-sm text-gray-600">{record.fileName}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">{record.uploadTime}</p>
                        <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                          已上传
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 使用说明 */}
        <div className="mt-6 bg-white rounded-lg shadow-xl p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">使用说明</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <h4 className="font-medium text-gray-800 mb-2">文件命名规则：</h4>
              <ul className="space-y-1">
                <li>• 系统会自动命名为：{`{学生姓名}_批改结果.{扩展名}`}</li>
                <li>• 如果已存在同名文件，会被覆盖</li>
                <li>• 建议使用PDF格式以确保格式兼容性</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-800 mb-2">学生下载方式：</h4>
              <ul className="space-y-1">
                <li>• 学生在统计页面可以看到下载按钮</li>
                <li>• 只有上传了批改结果的学生才能下载</li>
                <li>• 下载文件名会保持原始格式</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
