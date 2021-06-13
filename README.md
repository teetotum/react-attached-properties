# react-attached-properties: A React Pattern

AttachedProperties is a pattern that can be applied to elements that are in a Container-/-Content relationship to attach information to nested elements that is needed and understood by the container; the pattern's core idea is that it directly associates the information with the nested element, in a readable and self-documenting way, and without the need to write excessive markup.

The pattern can help to reduce the need for wrapper components that would otherwise be necessairy to convey the information in a more conventional approach.

It is inspired by the mechanism of the same name that is available in all XAML-based user-interface technologies like WPF and Silverlight.
View the examples below to see how it looks in jsx code.

The `react-attached-properties` library provides utility functions for creating and retrieving attached properties, provides a mechanism to avoid property name clashes, and a mechanism to clear attached properties (which is needed lest some child component propagates those properties unwittingly to its own children); but this library is by no means a prerequisite for using the pattern: You can apply AttachedProperties in any vanilla React project with just a few lines of code without needing to add `react-attached-properties` to your dependencies. Using this library however allows you to reduce boiler-plate code, offers a uniform way to define and retrieve attached properties, and spares you the hassle to deal with obvious (and not-so-obvious) pitfalls.

# how it looks

Solved problem: provide row and column placement of elements in a Grid component
```
<Grid rows={3} columns={3}>
    <Red {...Grid.row(3)} {...Grid.column(2)} />
    <Blue {...Grid.row(1)} {...Grid.column(1)} />
    <Green {...Grid.row(2)} {...Grid.column(3)} />
</Grid>
```

Solved problem: selectively add dropdown closing behavior to content elements in a generic DropDown component
```
<DropDownButton>
    <p>
        It was a dark and stormy night...
    </p>
    <FancyBorder>
        <Button>
            Open some flyout
        </Button>
        <Button {...DropDownButton.closeOnClick()}>
            Option #Foo
        </Button>
        <Button {...DropDownButton.closeOnClick()}>
            Option #Bar
        </Button>
        <Button>
            Show more...
        </Button>
    </FancyBorder>
</DropDownButton>
```

Solved problem: earmark content elements to be placed in the header and footer areas of a Modal component, instead of in the body
```
<Modal>
    <h2 {...Modal.isHeader()}>
        You have unsaved changes
    </h2>
    <p>
        You are leaving the current view.
        Please decide if you want to save your changes now, discard them,
        or cancel the operation and stay on the current view.
    </p>
    <Button {...Modal.isFooter()}>
        Save changes and leave view.
    </Button>
    <Button {...Modal.isFooter()}>
        Discard changes and leave view.
    </Button>
    <Button {...Modal.isFooter()}>
        Cancel and stay on view
    </Button>
</Modal>
```

# implementation

- (1.) Import the `AttachedProperty` class at the top of your component.
- (2.) Declare and create a new attached property constant for each property you want to support.
- (3.) Add property setters to your component for each property you want to support.
```
// 1.
import { AttachedProperty } from 'react-attached-properties';
import React from 'react';

// 2.
const attachedRow = new AttachedProperty('row');
const attachedColumn = new AttachedProperty('column');

const MyGrid = (props) => {
    // ...
};

// 3.
attachedRow.createSetter(MyGrid);
attachedColumn.createSetter(MyGrid);

export { MyGrid };
```

- (4.) When your component is rendered: iterate over `children` (either shallow i.e. you inspect only the immediate `children`, or deep i.e. you inspect recursively `children` of `children`, depending on your use case, see examples for both variants).
- (5.) For each inspected child: retrieve each attached property value you want to support.
- (6.) Process each child according to the retrieved values; remember that strings can be among the children; they don't have properties and cannot be cloned. We can check for strings with `React.isValidElement`. If you have retrieved an attached property value you do not need to check for string because only valid react elements (i.e. not a string) can have properties.
- (7.) Clear any attached property value
```
<div className="my-grid">
{
    // 4.
    React.Children.map(children, (child) => {
        // 5.
        const row = attachedRow.from(child) || 0;
        const column = attachedColumn.from(child) || 0;

        // 6.
        const placement = `cell-${column}-${row}`;

        return (
            <div className={placement}>
            {
                // 6.
                React.isValidElement(child) ?
                    // 7.
                    React.cloneElement(child, {...attachedRow.clear(), ...attachedColumn.clear()}) : child
            }
            </div>
        );
    })
}
</div>
```

# notes on syntax

The spread operator syntax is well supported by jsx although it might be unfamiliar if you haven't seen it used before.
The rest of the pattern is just a plain old dot notation function call to a function that happens to be exposed on the component itself. The object that is returned has a property with a guaranteed unique property name.
With attached properties that don't require an input value you could therefore separate the function call from the property spread like this:
```
const isHeader = Modal.isHeader();
const isFooter = Modal.isFooter();

<h2 {...isHeader} />
<p>Lorem Ipsum</P>
<Button {...isFooter} />
<Button {...isFooter} />
<Button {...isFooter} />
```

## how to conditionally set an attached property

To conditionally set a property you can use the following syntax:
```
<Button {...placeButtonsInFooter ? Modal.isFooter() : null} />
```
