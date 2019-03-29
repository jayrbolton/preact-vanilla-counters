import {h, render, Component} from 'preact';

// Reusable, stateless counter component
class Counter extends Component {

  // Create a new counter state
  static createState(start = 0) {
    return {count: start};
  }

  // Increment the counter
  increment () {
    if (!('updater' in this.props)) return;
    // Increment the counter state
    this.props.updater(state => {
      state.count += 1;
      return state;
    });
  }

  render() {
    return (
      <div>
        <p>Count is {this.props.count}</p>
        <button onClick={() => this.increment()}>Increment</button>
      </div>
    );
  }
}

// Reusable, stateless list of counters
class CounterList extends Component {
  static createState() {
    return {counters: new Map(), totalCount: 0};
  }

  addCounter() {
    if (!('updater' in this.props)) return;
    // Add a new counter to the Map
    this.props.updater(state => {
      const { counters } = state;
      counters.set(genId(), Counter.createState(0));
      return Object.assign(state, { counters });
    })
  }

  removeCounter(id) {
    if (!('updater' in this.props)) return;
    // Remove a counter given an ID
    this.props.updater(state => {
      const { counters } = state;
      counters.delete(id);
      const totalCount = getTotal(counters);
      return {counters, totalCount};
    })
  }

  updateCounter(id, update) {
    if (!('updater' in this.props)) return;
    // Update a single counter's state
    this.props.updater(state => {
      const { counters } = state;
      counters.set(id, update(counters.get(id)));
      const totalCount = getTotal(counters);
      return { counters, totalCount }
    });
  }

  render() {
    console.log('props', this.props);
    const { counters, totalCount } = this.props;
    console.log('counters', counters, Array.from(counters));
    return (
      <div>
        <p>Total count is {totalCount}</p>
        <button onClick={() => this.addCounter()}>Add counter</button>
        {
          Array.from(counters).map(([id, counter]) => {
            return (
              <div>
                <Counter count={counter.count} updater={(up) => this.updateCounter(id, up)} />
                <button onClick={() => this.removeCounter(id)}>Remove counter</button>
              </div>
            );
          })
        }
      </div>
    );
  }
};

// Top level page wrapper
class Page extends Component {
  constructor() {
    super();
    this.state = CounterList.createState();
    this.updateCounterList = this.updateCounterList.bind(this);
  }
  updateCounterList(updater) {
    // Update our state based on any state updates from the counterList
    this.setState(Object.assign(this.state, updater(this.state)));
  }
  render() {
    return (
      <CounterList {...this.state} updater={this.updateCounterList} />
    );
  }
};

// generate uid
const genId = () => String(window.performance.now());

// get total count
const getTotal = counters => Array.from(counters).reduce((sum, [id, c]) => sum + c.count, 0);

render(<Page />, document.body)
