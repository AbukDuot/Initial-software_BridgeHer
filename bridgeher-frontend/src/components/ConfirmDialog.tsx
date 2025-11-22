import React from 'react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Confirm',
  cancelText = 'Cancel'
}) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 10000
    }} onClick={onCancel}>
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '30px',
        maxWidth: '400px',
        width: '90%',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
        border: '3px solid #4A148C'
      }} onClick={(e) => e.stopPropagation()}>
        <h3 style={{
          color: '#4A148C',
          marginBottom: '15px',
          fontSize: '22px',
          fontWeight: '600'
        }}>{title}</h3>
        <p style={{
          color: '#333',
          marginBottom: '25px',
          fontSize: '16px',
          lineHeight: '1.5'
        }}>{message}</p>
        <div style={{
          display: 'flex',
          gap: '10px',
          justifyContent: 'flex-end'
        }}>
          <button onClick={onCancel} style={{
            background: '#E0E0E0',
            color: '#333',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '15px',
            fontWeight: '500'
          }}>{cancelText}</button>
          <button onClick={onConfirm} style={{
            background: '#E53935',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '15px',
            fontWeight: '500'
          }}>{confirmText}</button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
