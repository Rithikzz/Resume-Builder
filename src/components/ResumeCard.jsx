import { FilePenLineIcon, PencilIcon, TrashIcon } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const ResumeCard = ({ resume, index, colors, onEdit, onDelete }) => {
  const navigate = useNavigate()
  const baseColor = colors[index % colors.length]

  return (
    <button 
      onClick={() => navigate(`/app/builder/${resume._id}`)} 
      className='relative w-full sm:max-w-36 h-48 flex flex-col items-center justify-center rounded-lg gap-2 border group hover:shadow-lg transition-all duration-300 cursor-pointer' 
      style={{
        background: `linear-gradient(135deg, ${baseColor}10, ${baseColor}40)`, 
        borderColor: baseColor + '40'
      }}
    >
      <FilePenLineIcon className="size-7 group-hover:scale-105 transition-all " style={{ color: baseColor }}/>
      <p className='text-sm group-hover:scale-105 transition-all  px-2 text-center' style={{ color: baseColor }}>
        {resume.title}
      </p>
      <p className='absolute bottom-1 text-[11px] text-slate-400 group-hover:text-slate-500 transition-all duration-300 px-2 text-center' style={{ color: baseColor + '90' }}>
        Updated on {new Date(resume.updatedAt).toLocaleDateString()}
      </p>
      <div onClick={e => e.stopPropagation()} className='absolute top-1 right-1 group-hover:flex items-center hidden'>
        <TrashIcon onClick={() => onDelete(resume._id)} className="size-7 p-1.5 hover:bg-white/50 rounded text-slate-700 transition-colors"/>
        <PencilIcon onClick={() => onEdit(resume._id, resume.title)} className="size-7 p-1.5 hover:bg-white/50 rounded text-slate-700 transition-colors"/>
      </div>
    </button>
  )
}

export default ResumeCard