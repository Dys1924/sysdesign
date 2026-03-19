import { IconAlertTriangle, IconLoader2 } from '@tabler/icons-react'
import { useState } from 'react'

interface ConfirmModalProps {
  open: boolean
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  isDestructive?: boolean
  onClose: () => void
  onConfirm: () => void
}

export default function ConfirmModal({
  open,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDestructive = false,
  onClose,
  onConfirm,
}: ConfirmModalProps) {
  const [loading, setLoading] = useState(false)

  if (!open) return null

  const handleConfirm = async () => {
    setLoading(true)
    await onConfirm()
    setLoading(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-background/60 backdrop-blur-sm animate-in fade-in duration-300" 
        onClick={onClose}
      />
      
      {/* Modal Card */}
      <div className="relative w-full max-w-sm bg-card border border-border rounded-2xl shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 p-6 flex flex-col gap-6">
        <div className="flex items-start gap-4">
          <div className={`w-10 h-10 rounded-full flex shrink-0 items-center justify-center ${isDestructive ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'}`}>
            <IconAlertTriangle size={20} stroke={2} />
          </div>
          <div className="flex flex-col gap-1">
            <h3 className="text-lg font-bold text-foreground tracking-tight">{title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="h-9 px-4 text-sm font-semibold text-foreground hover:bg-muted rounded-lg transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className={`h-9 px-5 text-sm font-bold text-white rounded-lg transition-all shadow-sm flex items-center gap-2 ${
              isDestructive ? 'bg-destructive hover:bg-destructive/90 shadow-destructive/20' : 'bg-primary hover:bg-primary/90 shadow-primary/20'
            }`}
          >
            {loading && <IconLoader2 size={14} className="animate-spin" />}
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
