import React from 'react';
import './Modal.css';

interface ModalProps {
    isOpen: boolean;
    onCancel: Function;
    onConfirm: Function;
}

function Modal({ isOpen, onCancel, onConfirm }: ModalProps) {
    if (!isOpen) return null;

    const handleOutsideClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target instanceof HTMLElement && e.target.dataset.testid === 'modal-overlay') {
            onCancel();
        }
    };

    return (
        <div className="modal-overlay" onClick={handleOutsideClick} data-testid="modal-overlay">
            <div className="modal-content" data-testid="modal-content">
                <p>Are you sure?</p>
                <br />
                <button onClick={() => onCancel()}>Cancel</button>
                {" "}
                <button onClick={() => onConfirm()}>Confirm</button>
            </div>
        </div>
    );
}

export default Modal;
