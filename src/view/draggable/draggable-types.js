// @flow
import type { Node } from 'react';
import type {
  DraggableId,
  DraggableDimension,
  Position,
  Direction,
  ZIndex,
} from '../../types';
import {
  lift,
  move,
  moveByWindowScroll,
  moveForward,
  moveBackward,
  crossAxisMoveForward,
  crossAxisMoveBackward,
  drop,
  cancel,
  dropAnimationFinished,
} from '../../state/action-creators';
import type {
  Provided as DragHandleProvided,
} from '../drag-handle/drag-handle-types';

export type DraggingStyle = {|
  // Allow scrolling of the element behind the dragging element
  pointerEvents: 'none',

  // `position: fixed` is used to ensure that the element is always positioned
  // in the correct position and ignores the surrounding position:relative parents
  position: 'fixed',

  // When we do `position: fixed` the element looses its normal dimensions,
  // especially if using flexbox. We set the width and height manually to
  // ensure the element has the same dimensions as before it started dragging
  width: number,
  height: number,

  // The width and height values take into account whether the original element
  // used `box-sizing: content-box` or `box-sizing: border-box`
  // Because we are setting the width and height directly we want to ensure that
  // these are the actual values applied
  boxSizing: 'border-box',

  // We initially position the element in the same *visual spot* as when it started.
  // This means that these values *exclude* the original margins so that element remains
  // in the same visual position - even though now it has no margins
  top: number,
  left: number,

  // We clear any top or left margins on the element to ensure it does not push
  // the element positioned with the top/left position (which is margin aware).
  // We also clear the margin right / bottom. This has no positioning impact,
  // but it is cleanest to just remove all the margins rather than only the top and left.
  margin: 0,

  // TEMP
  transition: 'none',

  // Move the element in response to a user dragging
  transform: ?string,

  // When dragging or dropping we control the z-index to ensure that
  // the layering is correct
  zIndex: ZIndex,
|}

export type NotDraggingStyle = {|
  transform: ?string,
  // null: use the global animation style
  // none: skip animation (used in certain displacement situations)
  transition: null | 'none',
|}

export type DraggableStyle = DraggingStyle | NotDraggingStyle;

export type ZIndexOptions = {|
  dragging: number,
  dropAnimating: number,
|}

type DraggableProps = {|
  style: ?DraggableStyle,
  'data-react-beautiful-dnd-draggable': string,
|}

export type Provided = {|
  innerRef: (? HTMLElement) => void,
  draggableProps: DraggableProps,
  dragHandleProps: ?DragHandleProvided,
  placeholder: ?Node,
|}

export type StateSnapshot = {|
  isDragging: boolean,
|}

export type DispatchProps = {|
  lift: typeof lift,
  move: typeof move,
  moveByWindowScroll: typeof moveByWindowScroll,
  moveForward: typeof moveForward,
  moveBackward: typeof moveBackward,
  crossAxisMoveForward: typeof crossAxisMoveForward,
  crossAxisMoveBackward: typeof crossAxisMoveBackward,
  drop: typeof drop,
  cancel: typeof cancel,
  dropAnimationFinished: typeof dropAnimationFinished,
|}

export type MapProps = {|
  isDragging: boolean,
  // whether or not a drag movement should be animated
  // used for dropping and keyboard dragging
  shouldAnimateDragMovement: boolean,
  // when an item is being displaced by a dragging item,
  // we need to know if that movement should be animated
  shouldAnimateDisplacement: boolean,
  // only provided when dragging
  // can be null if not over a droppable
  direction: ?Direction,
  isDropAnimating: boolean,
  offset: Position,
  dimension: ?DraggableDimension,
|}

export type OwnProps = {|
  draggableId: DraggableId,
  children: (Provided, StateSnapshot) => ?Node,
  index: number,
  isDragDisabled: boolean,
  disableInteractiveElementBlocking: boolean,
|}

export type DefaultProps = {|
  isDragDisabled: boolean,
  disableInteractiveElementBlocking: boolean
|}

export type Props = {|
  ...MapProps,
  ...DispatchProps,
  ...OwnProps
|}

// Having issues getting the correct reselect type
export type Selector = Function;
