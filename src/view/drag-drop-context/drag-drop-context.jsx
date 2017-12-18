// @flow
import React, { type Node } from 'react';
import PropTypes from 'prop-types';
import createStore from '../../state/create-store';
import fireHooks from '../../state/fire-hooks';
import createDimensionMarshal from '../../state/dimension-marshal/dimension-marshal';
import createStyleMarshal from '../style-marshal/style-marshal';
import type { StyleMarshal } from '../style-marshal/style-marshal-types';
import type {
  DimensionMarshal,
  Callbacks as DimensionMarshalCallbacks,
} from '../../state/dimension-marshal/dimension-marshal-types';
import type {
  Store,
  State,
  Hooks,
  DraggableDimension,
  DroppableDimension,
  DroppableId,
  Position,
} from '../../types';
import { storeKey, dimensionMarshalKey, styleContextKey } from '../context-keys';
import {
  clean,
  publishDraggableDimensions,
  publishDroppableDimensions,
  updateDroppableDimensionScroll,
} from '../../state/action-creators';

type Props = {|
  ...Hooks,
  children: ?Node,
|}

type Context = {
  [string]: Store
}

export default class DragDropContext extends React.Component<Props> {
  /* eslint-disable react/sort-comp */
  store: Store
  dimensionMarshal: DimensionMarshal
  styleMarshal: StyleMarshal
  unsubscribe: Function

  // Need to declare childContextTypes without flow
  // https://github.com/brigand/babel-plugin-flow-react-proptypes/issues/22
  static childContextTypes = {
    [storeKey]: PropTypes.shape({
      dispatch: PropTypes.func.isRequired,
      subscribe: PropTypes.func.isRequired,
      getState: PropTypes.func.isRequired,
    }).isRequired,
    [dimensionMarshalKey]: PropTypes.object.isRequired,
    [styleContextKey]: PropTypes.string.isRequired,
  }
  /* eslint-enable */

  getChildContext(): Context {
    return {
      [storeKey]: this.store,
      [dimensionMarshalKey]: this.dimensionMarshal,
      [styleContextKey]: this.styleMarshal.styleContext,
    };
  }

  componentWillMount() {
    this.store = createStore();

    // create the style marshal
    this.styleMarshal = createStyleMarshal();

    // create the dimension marshal
    const callbacks: DimensionMarshalCallbacks = {
      cancel: () => {
        this.store.dispatch(clean());
      },
      publishDraggables: (dimensions: DraggableDimension[]) => {
        this.store.dispatch(publishDraggableDimensions(dimensions));
      },
      publishDroppables: (dimensions: DroppableDimension[]) => {
        this.store.dispatch(publishDroppableDimensions(dimensions));
      },
      updateDroppableScroll: (id: DroppableId, offset: Position) => {
        this.store.dispatch(updateDroppableDimensionScroll(id, offset));
      },
    };
    this.dimensionMarshal = createDimensionMarshal(callbacks);

    let previous: State = this.store.getState();

    this.unsubscribe = this.store.subscribe(() => {
      const previousValue: State = previous;
      const current = this.store.getState();
      // setting previous now incase any of the
      // functions synchronously trigger more updates
      previous = current;

      // no lifecycle changes have occurred if phase has not changed
      if (current.phase === previousValue.phase) {
        return;
      }

      // Allowing dynamic hooks by re-capturing the hook functions
      const hooks: Hooks = {
        onDragStart: this.props.onDragStart,
        onDragEnd: this.props.onDragEnd,
      };
      fireHooks(hooks, current, previousValue);

      // Update the global styles
      this.styleMarshal.onPhaseChange(previousValue, current);

      // inform the dimension marshal about updates
      // this can trigger more actions synchronously so we are placing it last
      this.dimensionMarshal.onPhaseChange(current);
    });
  }

  componentWillUnmount() {
    this.unsubscribe();
    this.styleMarshal.unmount();
  }

  render() {
    return this.props.children;
  }
}
