import React from 'react'

interface CardProps {
  title: string
  value: number
  subtext: string
  icon: React.ReactNode
  borderColor?: string
}

const Card: React.FC<CardProps> = ({ title, value, subtext, icon, borderColor = 'border-gray-200' }) => {
  return (
    <div className={`bg-white p-6 rounded-lg shadow-sm flex justify-between items-start border-l-4 ${borderColor} transition-transform duration-200 hover:scale-105`}>
      <div>
        <p className='text-sm font-medium text-gray-500'>{title}</p>
        <p className='text-3xl font-bold text-gray-800 mt-1'>{value}</p>
        <p className='text-xs text-blue-500 mt-2'>{subtext}</p>
      </div>
      <div className='bg-gray-100 p-2 rounded-md'>{icon}</div>
    </div>
  )
}

export default Card
