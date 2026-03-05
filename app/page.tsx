'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function HomePage() {
  const [name, setName] = useState('')
  const [assignment, setAssignment] = useState('')
  const [assignments, setAssignments] = useState<string[]>([])
  const [assignmentsLoading, setAssignmentsLoading] = useState(true)
  const [file, setFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('')

  const isZipFile = (selectedFile: File) => selectedFile.name.toLowerCase().endsWith('.zip')

  const fetchAssignments = async () => {
    try {
      setAssignmentsLoading(true)
      const response = await fetch('/api/upload/assignments')
      const result = await response.json()

      if (result.success) {
        setAssignments(result.data || [])
      } else {
        setAssignments([])
        setMessage(result.message || '获取提交日期失败')
        setMessageType('error')
      }
    } catch (error) {
      setAssignments([])
      setMessage('获取提交日期失败，请刷新重试')
      setMessageType('error')
    } finally {
      setAssignmentsLoading(false)
    }
  }

  useEffect(() => {
    fetchAssignments()
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null
    if (!selectedFile) {
      setFile(null)
      return
    }

    if (!isZipFile(selectedFile)) {
      setFile(null)
      setMessage('仅支持上传 .zip 压缩包')
      setMessageType('error')
      e.target.value = ''
      return
    }

    setMessage('')
    setMessageType('')
    setFile(selectedFile)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name.trim()) {
      setMessage('请输入姓名')
      setMessageType('error')
      return
    }

    if (!assignment) {
      setMessage('请选择提交日期')
      setMessageType('error')
      return
    }

    if (!file) {
      setMessage('请选择要上传的 .zip 压缩包')
      setMessageType('error')
      return
    }

    if (!isZipFile(file)) {
      setMessage('仅支持上传 .zip 压缩包')
      setMessageType('error')
      return
    }

    setIsSubmitting(true)
    setMessage('')

    try {
      const formData = new FormData()
      formData.append('name', name.trim())
      formData.append('assignment', assignment)
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (result.success) {
        setMessage('提交成功！')
        setMessageType('success')
        // 清空表单
        setName('')
        setAssignment('')
        setFile(null)
        // 重置文件输入框
        const fileInput = document.getElementById('file-input') as HTMLInputElement
        if (fileInput) {
          fileInput.value = ''
        }
      } else {
        setMessage(result.message || '提交失败，请重试')
        setMessageType('error')
      }
    } catch (error) {
      console.error('提交错误:', error)
      setMessage('网络错误，请检查连接后重试')
      setMessageType('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                作业提交系统
              </h1>
              <p className="text-gray-600">
                请填写您的信息并上传作业文件
              </p>
            </div>
            <Link
              href="/stats"
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              统计
            </Link>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 姓名输入框 */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              姓名 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="请输入您的姓名"
              disabled={isSubmitting}
            />
          </div>

          {/* 文件上传 */}
          <div>
            <label htmlFor="assignment" className="block text-sm font-medium text-gray-700 mb-2">
              选择提交日期 <span className="text-red-500">*</span>
            </label>
            <select
              id="assignment"
              value={assignment}
              onChange={(e) => setAssignment(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isSubmitting || assignmentsLoading}
            >
              <option value="">
                {assignmentsLoading ? '正在加载提交日期...' : '请选择提交日期'}
              </option>
              {assignments.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
            {!assignmentsLoading && assignments.length === 0 && (
              <p className="mt-2 text-xs text-red-600">
                未检测到可选日期，请先在 public/uploads 下创建日期目录。
              </p>
            )}
          </div>

          {/* 文件上传 */}
          <div>
            <label htmlFor="file-input" className="block text-sm font-medium text-gray-700 mb-2">
              作业压缩包（.zip） <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="file"
                id="file-input"
                accept=".zip,application/zip"
                onChange={handleFileChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent file:mr-4 file:py-1 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                disabled={isSubmitting}
              />
            </div>
            {file && (
              <p className="mt-2 text-sm text-gray-600">
                已选择文件: {file.name}
              </p>
            )}
          </div>

          {/* 提交按钮 */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-2 px-4 rounded-md font-medium transition-colors ${
              isSubmitting
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
            } text-white`}
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                提交中...
              </div>
            ) : (
              '提交作业'
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

        {/* 使用说明 */}
        <div className="mt-8 p-4 bg-gray-50 rounded-md">
          <h3 className="text-sm font-medium text-gray-800 mb-2">使用说明：</h3>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• 请确保输入真实姓名</li>
            <li>• 先选择提交日期，再上传压缩包</li>
            <li>• 仅支持上传 .zip 格式的作业压缩包</li>
            <li>• 文件大小限制：10MB以内</li>
            <li>• 提交成功后文件将保存到对应日期目录下</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
