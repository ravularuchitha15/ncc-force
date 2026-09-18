import Modal from './Modal';
import { AlertTriangle } from 'lucide-react';

export default function ConfirmDialog({ isOpen, onClose, onConfirm, title = 'Confirm Action', message, confirmLabel = 'Confirm', variant = 'danger' }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm"
      footer={
        <div className="flex gap-3">
          <button onClick={onClose} className="btn-outline-navy btn-sm">Cancel</button>
          <button
            onClick={() => { onConfirm(); onClose(); }}
            className={variant === 'danger' ? 'btn-danger btn-sm' : 'btn-primary btn-sm'}
          >
            {confirmLabel}
          </button>
        </div>
      }
    >
      <div className="flex items-start gap-4">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${variant === 'danger' ? 'bg-red-100' : 'bg-primary-50'}`}>
          <AlertTriangle size={20} className={variant === 'danger' ? 'text-red-600' : 'text-primary'} />
        </div>
        <p className="text-sm text-gray-600 leading-relaxed mt-1.5">{message}</p>
      </div>
    </Modal>
  );
}
