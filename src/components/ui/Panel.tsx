import { ReactNode } from 'react'

interface PanelProps {
  children: ReactNode
  className?: string
  title?: string
  titleRight?: ReactNode
}

export function Panel({ children, className = '', title, titleRight }: PanelProps) {
  return (
    <div className={`glass-panel ${className}`}>
      {(title || titleRight) && (
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-nexus-border">
          {title && (
            <h3 className="text-nexus-textMuted text-xs uppercase tracking-widest font-medium">
              {title}
            </h3>
          )}
          {titleRight}
        </div>
      )}
      <div className={title ? 'p-5' : 'p-5'}>{children}</div>
    </div>
  )
}
