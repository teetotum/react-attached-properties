import React from 'react';

const shouldStop = (child, options) => (options.stopRecursion && child.type && options.stopRecursion === child.type);
const defaultOptions = {};
const recursiveMap = (children, callbackFn, options) => {
  const effectiveOptions = { ...defaultOptions, ...options };
  return React.Children.map(
    children,
    (child) => {
      if (React.isValidElement(child) && child.props.children && !shouldStop(child, effectiveOptions))
        child = React.cloneElement(child, {}, recursiveMap(child.props.children, callbackFn, options));
      return callbackFn(child);
    },
  );
};

const confinedBy = (component) => ({ recursiveMap: (children, callbackFn) => recursiveMap(children, callbackFn, { stopRecursion: component }) });

export  { confinedBy };
