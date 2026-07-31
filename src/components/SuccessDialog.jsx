import AlertDialog from './AlertDialog.jsx'

/**
 * Kept as the name the success case is called by around the app; the dialog
 * itself lives in AlertDialog so every variant shares one shape.
 */
export default function SuccessDialog({ open, onClose, title = 'Success', message, okLabel = 'OK' }) {
  return (
    <AlertDialog
      open={open}
      variant="success"
      title={title}
      message={message}
      okLabel={okLabel}
      onClose={onClose}
    />
  )
}
