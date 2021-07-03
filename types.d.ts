declare module 'react-attached-properties' {
    interface IDescendantIterator {
      recursiveMap(children: any, callbackFn: (child: any) => any): any;
    }
    class AttachedProperty {
      constructor(name: string);
  
      toString(): string;
  
      from(element: any): any;
  
      createSetter(component: any, createAttachedValue?: (...values: any[]) => any): void;
  
      clear(): object;
    }
    function confinedBy(component: any): IDescendantIterator;
    export { AttachedProperty, confinedBy };
}
