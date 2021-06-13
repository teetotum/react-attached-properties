import React, { useState, useRef } from 'react';
import { AttachedProperty, confinedBy } from 'react-attached-properties';
import { useClickOutside } from './useClickOutside';
import './dropdownbutton.css';

const hasCloseOnClick = new AttachedProperty('closeOnClick');

const DropdownButton = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const closeDropdown = () => setIsOpen(false);
    const toggleDropdown = () => setIsOpen(!isOpen);

    const root = useRef();
    useClickOutside(root, closeDropdown);

    return (
        <div className="dropdown-button" ref={root}>
            <div className="toggle-button" onClick={toggleDropdown}/>
            { isOpen && (
                <div className="dropdown">
                    {confinedBy(DropDownButton).recursiveMap(children,
                        (child) => {
                            if (hasCloseOnClick.from(child))
                                return (
                                    <div onClick={closeDropdown} style={{display: 'contents'}}>
                                        {React.cloneElement(child, hasCloseOnClick.clear())}
                                    </div>
                                );
                            else
                                return child;
                        }
                    )}
                </div>
            )}
        </div>
    );
};

hasCloseOnClick.createSetter(DropdownButton, () => true);

export { DropdownButton };
