# react-attached-properties: A React Pattern

```jsx
<DockPanel>
    <div {...DockPanel.top()} />
    <div {...DockPanel.left()} />
</DockPanel>
```

AttachedProperties is a pattern that can be applied to elements that are in a Container-/-Content relationship to attach information to nested elements that is needed and understood by the container; the pattern's core idea is that it directly associates the information with the nested element, in a readable and self-documenting way, and without the need to write excessive markup.

The pattern can help to reduce the need for wrapper components that would otherwise be necessairy to convey the information in a more conventional approach.

It is inspired by the mechanism of the same name that is available in all XAML-based user-interface technologies like WPF and Silverlight.
View the examples below to see how it looks in jsx code.

The `react-attached-properties` library provides utility functions for creating and retrieving attached properties, provides a mechanism to avoid property name clashes, and a mechanism to clear attached properties (which is needed lest some child component propagates those properties unwittingly to its own children); but this library is by no means a prerequisite for using the pattern: You can apply AttachedProperties in any vanilla React project with just a few lines of code without needing to add `react-attached-properties` to your dependencies. Using this library however allows you to reduce boiler-plate code, offers a uniform way to define and retrieve attached properties, and spares you the hassle to deal with obvious (and not-so-obvious) pitfalls.

# What does it solve

The following examples show typical use cases for the pattern.

- Solved problem: provide row and column placement of elements in a [Grid](https://github.com/teetotum/react-attached-properties/blob/master/examples/Grid.js) component
    ```jsx
    <Grid rows={3} columns={3}>
        <Red {...Grid.row(3)} {...Grid.column(2)} />
        <Blue {...Grid.row(1)} {...Grid.column(1)} />
        <Green {...Grid.row(2)} {...Grid.column(3)} />
    </Grid>
    ```

- Solved problem: selectively add dropdown closing behavior to content elements in a generic [DropdownButton](https://github.com/teetotum/react-attached-properties/blob/master/examples/DropdownButton.js) component
    ```jsx
    <DropdownButton>
        <p>
            It was a dark and stormy night...
        </p>
        <FancyBorder>
            <Button>
                Open some flyout
            </Button>
            <Button {...DropdownButton.closeOnClick()}>
                Option #Foo
            </Button>
            <Button {...DropdownButton.closeOnClick()}>
                Option #Bar
            </Button>
            <Button>
                Show more...
            </Button>
        </FancyBorder>
    </DropdownButton>
    ```

- Solved problem: earmark content elements to be placed in the header and footer areas of a [Modal](https://github.com/teetotum/react-attached-properties/blob/master/examples/Modal.js) component, instead of in the body
    ```jsx
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
            Save changes and leave view
        </Button>
        <Button {...Modal.isFooter()}>
            Discard changes and leave view
        </Button>
        <Button {...Modal.isFooter()}>
            Cancel and stay on view
        </Button>
    </Modal>
    ```

# implementation

- (1.) Import the `AttachedProperty` class at the top of your component.
- (2.) Declare and create a new attached property constant for each property you want to support.
- (3.) Add [property setters](#property-setters) to your component for each property you want to support.
```jsx
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

- (4.) When your component is rendered: iterate over `children` (either [shallow](#shallow) i.e. you inspect only the immediate `children`, or [deep](#deep) i.e. you inspect recursively `children` of `children`, depending on your use case, see [examples](https://github.com/teetotum/react-attached-properties/tree/master/examples) for both variants).
- (5.) For each inspected child: retrieve each attached property value you want to support.
- (6.) Process each child according to the retrieved values; remember that strings can be among the children; they don't have properties and cannot be cloned. We can check for strings with `React.isValidElement`. If you have successfully retrieved any attached property value other than `undefined` you do not need to check for string because only valid react elements (i.e. not a string) can have properties.
- (7.) [Clear](#clear) any attached property value
```jsx
<div className="my-grid">
{
    // 4.
    React.Children.map(children, (child) => {
        // 5.
        const row = attachedRow.from(child) || 0;
        const column = attachedColumn.from(child) || 0;

        // 6. a)
        const placement = `cell-${column}-${row}`;

        return (
            <div className={placement}>
            {
                // 6. b)
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

## property setters

You can specify how many arguments your setter expects and how those arguments are turned into your attached property value. The default setter expects exactly one argument and this single argument becomes the property value.

Here the default setter is used:
```jsx
const attachedRow = new AttachedProperty('row');
attachedRow.createSetter(MyGrid);
<div {...MyGrid.row(3)} />
```

`createSetter` has the following signature:
```js
createSetter(component, createAttachedValue = _ => _)
```
- `component` is your container component that supports your attached property
- `createAttachedValue` defines how the provided arguments are turned into the attached property value; it is optional; the identity function is used as the default: it expects one argument which is returned unchanged.

- If your attached property is a boolean flag that mimics [boolean HTML attributes](https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#boolean-attributes) ("The presence of a boolean attribute on an element represents the true value, and the absence of the attribute represents the false value.") you could use the following setter:
    ```jsx
    const hasCloseOnClick = new AttachedProperty('closeOnClick');
    hasCloseOnClick.createSetter(DropdownButton, () => true);
    <div {...DropdownButton.closeOnClick()} />
    ```

- Here is an example with three arguments:
    ```jsx
    const attachedCoordinates = new AttachedProperty('coordinates');
    attachedCoordinates.createSetter(React3DViewbox, (x, y, z) => ({ x, y, z }));
    <div {...React3DViewbox.coordinates(56, 67, 78)} />
    ```

## shallow

For a shallow inspection of your component's children you need to use the [React children API](https://reactjs.org/docs/react-api.html#reactchildren). A typical use case for this is when your container component is a layout component, like a Grid, a DockPanel, or a React3DViewbox.

## deep

For a deep inspection of your component's children you need to use `confinedBy` and `recursiveMap` of this library.
With `confinedBy` the recursion will not descend into the children of a nested container of the same type. An example may help to show why this is necessairy:
```jsx
<DropdownButton>
    <p>
        ...some content...
        <div>
            ...more content...
        </div>
        <Button {...DropdownButton.closeOnClick()}/>
        <DropdownButton>
            <div>
                nested dropdown button
            </div>
            <Button {...DropdownButton.closeOnClick()}/>
        </DropdownButton>
    </p>
</DropdownButton>
```
In this example the inner nested `<Button>` shall only close the nested dropdown, it is therefore necessairy that the outer DropdownButton does not descend into the nested DropdownButton, to support this container-in-container scenario.

`recursiveMap` visits recursively children of children. It can inspect all the jsx elements that are provided to the container component via the children prop, i.e. all the nested elements that are placed between the opening tag and the closing tag when the container is used in a render function. To further illustrate this point, view the following example:
```jsx
const Foo = () => (<input />);
<MyContainer>
    <div>
        <Foo />
    </div>
    <Bar>
        <span />
    </Bar>
</MyContainer>
```
In this example `recursiveMap` can inspect exactly four elements:
- the `<div>`
- the nested `<Foo>`
- the `<Bar>`
- the nested `<span>`

but it cannot inspect the `<input>` that will only be produced by the render function of `Foo`.

You need to call `confinedBy` to be able to use `recursiveMap`:
```jsx
import { confinedBy } from 'react-attached-properties';

const MyDropdown = () => (
    <div className="dropdown">
        {confinedBy(MyDropdown).recursiveMap(children, (child) => { /* ... */ })}
    </div>
);
```

`recursiveMap` has the following signature:
```js
recursiveMap(children, callbackFn)
```
- `children`: the children prop of your container
- `callbackFn`: a function that receives the inspected child element, from which you are supposed to retrieve any attached property, and either return the child element unchanged or return the result of `React.cloneElement`: If the inspected element has no attached properties you can return the very same child instance unchanged, but if the inspected element has any attached properties it is highly recommended to [clear](#clear) those properties which can only be done via `React.cloneElement`.

## clear

Once you have retrieved the attached property value it is recommended to clear it. Clearing really only overwrites the current value with a special `UNSET_VALUE`; retrieving an attached property via `attachedProp.from(child)` will check for `UNSET_VALUE` and will treat it exactly as if no value for the attached property was set.
Clearing the value guards against unintended consequences if the attached property is propagated. The following example illustrates this point: The `Highlighter` component can wrap any child with a colored border; but the implementation neglects to clear the attached property values.
```jsx
import React from 'react';
import { AttachedProperty, confinedBy } from 'react-attached-properties';

const attachedHighlight = new AttachedProperty('highlight');

const Highlighter = ({ children }) => (
    <div className="highlighter">
        {confinedBy(Highlighter).recursiveMap(children,
            (child) => {
                const highlight = attachedHighlight.from(child);
                const border = highlight ? `4px solid ${highlight}` : false;
                return border ? <div style={{ border }}>{child}</div> : child;
            }
        )}
    </div>
);

attachedHighlight.createSetter(Highlighter);

const ValidatedInput = ({errorMessage, ...inputProps}) => (
    <Highlighter>
        <input {...inputProps} />
        { errorMessage && (
            <span {...Highlighter.highlight('red')}>{errorMessage}</span>
        )}
    </Highlighter>
);

export { Highlighter, ValidatedInput };
```

In the following example this causes a subtle bug: there will be two blue borders; one around the `<ValidatedInput>` as intended; and one around the inner nested `<input>` of ValidatedInput, which is unintended.
```jsx
<Highlighter>
    <h2>Please enter all required information (marked in blue)</h2>
    <ValidatedInput {...Highlighter.highlight('blue')} />
</Highlighter>
```

Calling `attachedProp.clear()` returns an object with the unique attached property key and the `UNSET_VALUE` as its value; use this object to replace the former value while calling `React.cloneElement`:
- clearing only one attached property value:
    ```js
    React.cloneElement(child, attachedProp.clear())
    ```
- clearing multiple attached property values:
    ```js
    React.cloneElement(child, { ...attachedRow.clear(), ...attachedColumn.clear() })
    ```

# a word about rest properties

The example that shows why [clearing](#clear) attached values is recommended uses a [rest property](https://github.com/tc39/proposal-object-rest-spread/blob/master/Rest.md). Be aware that any attached property that was attached to your component will end up in a rest property. This can cause two different potential problems:

- As shown in the aforementioned example, if an uncleared attached value is spread onto an element that is placed within a container that recognizes the attached property it will unintentionally trigger the container's behavior. The solution to this is to always clear attached values in the container. If you should find yourself in the situation that you need to use a container that neglects to clear its properties yet you have no way to fix this bug in the container code, you can remove the attached property from the rest prop:
    ```jsx
    const ValidatedInput = ({errorMessage, ...inputProps}) => {
        delete inputProps[Object.keys(Highlighter.highlight())[0]];
        return (
            <Highlighter>
                <input {...inputProps} />
                { errorMessage && (
                    <span {...Highlighter.highlight('red')}>{errorMessage}</span>
                )}
            </Highlighter>
        );
    };
    ```
    Do not add this preemptively. This should only be used as a last resort and a bug ticket should be raised to inform the container's author.

- Even if the attached value was cleared, it is still present in the rest property object, with the value `UNSET_VALUE`. Since the order in which properties are applied to an element is important, with later properties overriding earlier properties with the same key, you should apply attached properties always after spread rest properties.
    <figcaption>The right order to apply rest properties and attached properties to the same element</figcaption>
    ```jsx
    const Something = ({foo, bar, ...rest}) => (
        <Highlighter>
            <div {...rest} {...Highlighter.highlight('green')} />
        </Highlighter>
    );
    ```
    <figcaption>The wrong order to apply rest properties and attached properties to the same element</figcaption>
    ```jsx
    const Something = ({foo, bar, ...rest}) => (
        <Highlighter>
            <div {...Highlighter.highlight('green')} {...rest} />
        </Highlighter>
    );
    ```

# notes on syntax

The spread operator syntax is well supported by jsx although it might be unfamiliar if you haven't seen it used before.
The rest of the pattern is just a plain old dot notation function call to a function that happens to be exposed on the component itself. The object that is returned has a property with a guaranteed unique property name.
With attached properties that don't require an input value you could therefore separate the function call from the property spread like this:

```jsx
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
```jsx
<Button {...placeButtonsInFooter ? Modal.isFooter() : null} />
```

# usage with TypeScript

You can use the AttachedProperties pattern with TypeScript. You either need to declare the property setters as additional members of your container component, or you rely on the type inference capabilities of the TypeScript compiler. View the following two examples to see both approaches.

## declaring property setters

The following example shows how the `DropdownButton` from the [examples](https://github.com/teetotum/react-attached-properties/tree/master/examples) can be enriched with type declarations for the property setters:
```jsx
import React, { useState, useRef } from 'react';
import type { FunctionComponent, HTMLAttributes } from 'react';
import { AttachedProperty, confinedBy } from 'react-attached-properties';
import { useClickOutside } from './useClickOutside';

interface DropdownButtonProps extends HTMLAttributes<Element> {
    // declare all the regular props for the component here;
    // all intrinsic props (children, className, tabIndex, aria-* attributes, data-* attributes, etc.)
    // are already supported by extending HTMLAttributes; so there is no need to declare them here.
}

interface IDropdownButton extends FunctionComponent<DropdownButtonProps> {
    // declare all property setters for your attached properties here
    closeOnClick(): object;
}

const hasCloseOnClick = new AttachedProperty('closeOnClick');

const DropdownButton = (({ children, className, tabIndex }: DropdownButtonProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const closeDropdown = () => setIsOpen(false);
    const toggleDropdown = () => setIsOpen(!isOpen);
    const root = useRef<HTMLDivElement>(null);
    useClickOutside(root, closeDropdown);

    return (
        <div className={`dropdown-button ${className}`} ref={root} tabIndex={tabIndex}>
            <div className="toggle-button" onClick={toggleDropdown} />
            { isOpen && (
                <div className="dropdown">
                    {confinedBy(DropdownButton).recursiveMap(children,
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
}) as IDropdownButton;

hasCloseOnClick.createSetter(DropdownButton, () => true);

export { DropdownButton };
```

## relying on type inference

The following example shows how the `Grid` from the [examples](https://github.com/teetotum/react-attached-properties/tree/master/examples) must implement the property setters in order for them to be picked up by the type inference mechanism of TypeScript:
```jsx
import React, { useCallback } from 'react';
import type { HTMLAttributes } from 'react';
import { AttachedProperty } from 'react-attached-properties';

interface GridProps extends HTMLAttributes<Element> {
    rows?: number;
    columns?: number;
}

const attachedRow = new AttachedProperty('row');
const attachedColumn = new AttachedProperty('column');

const rowDefinition = '100px ';
const colDefinition = '100px ';

const Grid = ({ children, rows = 2, columns = 2 }: GridProps) => {
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
                        {React.cloneElement(child, {...attachedRow.clear(), ...attachedColumn.clear()})}
                      </div>
                    );
                else return child;
            })
          }
        </div>
    );
};

Grid.row = (value: number) => ({ [attachedRow.toString()]: value });
Grid.column = (value: number) => ({ [attachedColumn.toString()]: value });

export { Grid };
```
