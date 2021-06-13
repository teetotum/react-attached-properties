import React from 'react';
import { AttachedProperty } from 'react-attached-properties';
import './modal.css';

const markedForHeader = new AttachedProperty('isHeader');
const markedForFooter = new AttachedProperty('isFooter');

const Modal = ({ children }) => {
    const headerContent = [];
    const footerContent = [];
    const bodyContent = [];
    React.Children.forEach(children, (child) => {
        if (markedForHeader.from(child))
            headerContent.push(React.cloneElement(child, { ...markedForHeader.clear(), ...markedForFooter.clear() }));
        else if (markedForFooter.from(child))
            footerContent.push(React.cloneElement(child, { ...markedForHeader.clear(), ...markedForFooter.clear() }));
        else
            bodyContent.push(child);
    });
    return (
        <div className="modal">
            <div className="header">{headerContent}</div>
            <div className="body">{bodyContent}</div>
            <div className="footer">{footerContent}</div>
        </div>
    );
};

markedForHeader.createSetter(Modal, () => true);
markedForFooter.createSetter(Modal, () => true);

export { Modal };
