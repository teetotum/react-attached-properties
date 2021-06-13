import React, { useCallback } from 'react';
import { AttachedProperty } from 'react-attached-properties';
import './grid.css';

const attachedRow = new AttachedProperty('row');
const attachedColumn = new AttachedProperty('column');

const rowDefinition = '100px ';
const colDefinition = '100px ';

const Grid = ({ children, rows = 2, columns = 2 }) => {
    const gridRef = useCallback(
        (element) => {
            if (element) {
                element.style.setProperty('--rows', rowDefinition.repeat(rows));
                element.style.setProperty('--columns', colDefinition.repeat(columns));
            }
        }, [rows, columns]
    );

    return (
        <div className="grid" ref={gridRef}>
            {
                React.Children.map(children, (child) => {
                    if (React.isValidElement(child))
                        return (
                            <div className="cell" ref={
                                (element) => {
                                    if (element) {
                                        element.style.setProperty('--row', attachedRow.from(child) );
                                        element.style.setProperty('--column', attachedColumn.from(child) );
                                    }
                                }
                            }>
                                {React.cloneElement(child, { ...attachedRow.clear(), ...attachedColumn.clear() })}
                            </div>
                        );
                    else return child;
                })
            }
        </div>
    );
};

attachedRow.createSetter(Grid);
attachedColumn.createSetter(Grid);

export { Grid };
