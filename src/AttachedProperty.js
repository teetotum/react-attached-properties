import React from 'react';
import { v4 as uuidv4 } from 'uuid';

const UNSET_VALUE = { toString: () => 'UNSET_VALUE' };

class AttachedProperty {

    constructor(name) {
        if (!name) throw new Error('You must privide a property name.');

        this.name = name;
        this.id = uuidv4();
        this.propertyID = `attachedproperty_${this.id}_${this.name.toLowerCase()}`;
    }

    toString() {
        return this.propertyID;
    }

    createSetter(component, createAttachedValue = _ => _) {
        component[this.name] = (...values) => ({ [this.propertyID]: createAttachedValue(...values) });
    }

    from(element) {
        if (!React.isValidElement(element)) return undefined;

        const propValue = element.props[this.propertyID];
        if (propValue === UNSET_VALUE) return undefined;

        return propValue;
    }

    clear() {
        return { [this.propertyID]: UNSET_VALUE };
    }

}

export { AttachedProperty };
