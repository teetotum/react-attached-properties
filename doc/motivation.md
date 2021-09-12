# A Concise Pattern for Container-and-Content Elements in React

Imagine you have to develop a Grid component with React. And any arbitrary React component can be used as content for your Grid.
How do you specify which element goes into which grid cell?

A common approach is to provide wrapper elements for rows and columns; which often produces lamentably verbose and cluttered markup; and soon clarity goes out the window.

<figcaption>what we want to avoid: rampant verbosity</figcaption>

```jsx
<Grid>
  <Grid.Row>

    {/* cell top left */}
    <Grid.Column>
      <Red />
    </Grid.Column>

    {/* empty cell top center */}
    <Grid.Column />

    {/* cell top right */}
    <Grid.Column>
      <Green />
    </Grid.Column>

  </Grid.Row>
  <Grid.Row>

    {/* empty cell bottom left */}
    <Grid.Column />

    {/* cell bottom center */}
    <Grid.Column>
      <Blue />
    </Grid.Column>

    {/* cell bottom right */}
    <Grid.Column>
      <Pink />
    </Grid.Column>

  </Grid.Row>
</Grid>
```

Wouldn't it be nice if we could just tack the necessairy row/column information onto the content element? And get rid of all those wrapper elements?
Actually we can.
Since React allows us to add any properties we fancy to any element - regardless of whether those properties are ever used by the component's implementation or not - we can in principle just set `row` and `column` on the content directly.

<figcaption>what we seek: divine neatness</figcaption>

```jsx
<Grid>
  <Red   row={1} column={1} />
  <Green row={1} column={3} />
  <Blue  row={2} column={2} />
  <Pink  row={2} column={3} />
</Grid>
```

Two issues arise:
- property names could clash if we ever tried to place an element in our grid that has its own property of the name `row` or `column`
- in many projects either a linter or the TypeScript compiler would vehemently protest, and would rightfully state that neither `row` nor `column` are part of the component signature

Luckily we can solve all issues:
1. we can add a GUID to the property name to make it unique and thus prevent name clashes
2. we can provide a utility function so no one ever has to type out the GUID when setting the property
3. we can use the spread operator syntax to apply the tuple of property *name* and *value*
4. linters and the TypeScript compiler deem spread properties acceptable

Our revised markup would look like this:

```jsx
<Grid>
  <Red   {...Grid.row(1)} {...Grid.column(1)} />
  <Green {...Grid.row(1)} {...Grid.column(3)} />
  <Blue  {...Grid.row(2)} {...Grid.column(2)} />
  <Pink  {...Grid.row(2)} {...Grid.column(3)} />
</Grid>
```

A working implementation of this [Grid component is available on GitHub](https://github.com/teetotum/react-attached-properties/blob/master/examples/Grid.js).

With this idea in mind we can formulate a general *Attached Properties* pattern:
> Whenever a component...
> 1. has the role of a container
> 2. that accepts any arbitrary React elements as content
> 3. and needs additional information associated with content elements
> 
> ...the additional information can be implemented as Attached Properties (as an alternative to the introduction of dedicated wrapper components).

The pattern therefore has a clearly defined field where it is applicable. It is a useful alternative to wrapper components. It can greatly help in reducing cluttered markup, and help in producing readable code.

## Behold the Possibilities!

Obvious applications for the pattern are *dedicated layout components* - as is the `<Grid>` we have seen in the first paragraph.
We can picture more specialized layout components like a `<DockPanel>` or a `<React3DViewbox>` that would also benefit from the pattern. Or even a genric `<Modal>` component with *header*, *body*, and *footer* sections. How would they look?

```jsx
<DockPanel>
    <div {...DockPanel.top()} />
    <div {...DockPanel.left()} />
</DockPanel>
```

```jsx
<React3DViewbox>
    <div {...React3DViewbox.coordinates(56, 67, 78)} />
    <div {...React3DViewbox.coordinates(12, 23, 34)} />
    <div {...React3DViewbox.coordinates(100, 100, 0)} />
</React3DViewbox>
```

```jsx
<Modal>
    <h2 {...Modal.isHeader()}>
        We use cookies
    </h2>
    <p>
        etc.
    </p>
    <Button>
        View details
    </Button>
    <Button {...Modal.isFooter()}>
        Decline
    </Button>
    <Button {...Modal.isFooter()}>
        Accept
    </Button>
</Modal>
```

But its applicability is not confined to layout components; it can be used to selectively add behavior to deeply nested content elements, whilst preserving the parent-child structure of your content. You would be reluctant to place a wrapper around a flexbox child, but adding a property to it is fine.

<figcaption>this feels right:</figcaption>

```jsx
<DropdownButton>
    <p>
        It was a dark and stormy night...
    </p>
    <FancyBorder className="fancy-flexbox">
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

<figcaption>this feels wrong:</figcaption>

```jsx
<DropdownButton>
    <p>
        It was a dark and stormy night...
    </p>
    <FancyBorder className="fancy-flexbox">
        <Button>
            Open some flyout
        </Button>
        <DropdownButton.CloseOnClick>
            <Button>Option #Foo</Button>
        </DropdownButton.CloseOnClick>
        <DropdownButton.CloseOnClick>
            <Button>Option #Bar</Button>
        </DropdownButton.CloseOnClick>
        <Button>
            Show more...
        </Button>
    </FancyBorder>
</DropdownButton>
```

A working implementation of this [DropdownButton component is available on GitHub](https://github.com/teetotum/react-attached-properties/blob/master/examples/DropdownButton.js). (To be totally honest: the same `display: contents` [mechanism](https://developer.mozilla.org/en-US/docs/Web/CSS/display#box) that is used by the DropdownButton implementation applying the *Attached Property* pattern to preserve css layout integrity could also be used in an alternative implementation applying the *Wrapper* pattern that would also preserve css layout integrity. But it would still raise concerns with attentive developers wherever it would be used.)

## Implementation

The pattern can be implemented in any vanilla React project. A simple implementation of the Grid component from the first paragraph could look like this:

```jsx
import React from 'react';

const guid = 'bf1b5a20-ec50-4530-8a10-ae78bdc62e74';
const rowProp = `${guid}_row`;
const columnProp = `${guid}_column`;

const Grid = ({ children, rows = 2, columns = 2 }) => (
    <div className={`grid-${columns}-${rows}`}>
        {React.Children.map(children, (child) => {
            const row = (child.props && child.props[rowProp]) || 0;
            const column = (child.props && child.props[columnProp]) || 0;
            const placement = `cell-${column}-${row}`;
            return (<div className={placement}>{child}</div>);
        })}
    </div>
);

Grid.row = (x) => ({ [rowProp]: x });
Grid.column = (x) => ({ [columnProp]: x });

export { Grid };
```

There are however some pitfalls and ramifications: How can children be mapped recursively? How deep should the recursion go? What happens with attached properties that are propagated to the children of content elements?

Those questions are addressed in detail in the documentation of [react-attached-properties](https://github.com/teetotum/react-attached-properties), a tiny library that is intended to make using the *Attached Property* pattern even easier and to provide ready-made solutions to circumnavigate potential pitfalls.

## Does it Work with TypeScript?

Yes. You can either rely on the TypeScript type inference mechanism to pick up the property setters like `Grid.row = (x: number) => ({ [attachedRowID]: x });` so it won't protest at `<div {...Grid.row(3)} />` or you can declare the property setters for the container `interface IGrid { row(x: number): object; }`.
There are examples in the [TypeScript section of the documentation](https://github.com/teetotum/react-attached-properties#usage-with-typescript).
