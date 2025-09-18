import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'JavaScript作业提交系统',
  description: '简单易用的作业文件上传系统',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {children}
      </body>
    </html>
  )
}
