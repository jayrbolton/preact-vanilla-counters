import {h, render, Component} from 'preact';

// Reusable, stateless counter component
class Counter extends Component {

  // Create a new counter state
  static createState(start = 0) {
    return {count: start};
  }

  // Increment the counter
  increment () {
    if (!this.props.handleUpdate) return;
    // Increment the counter state
    this.props.handleUpdate(state => {
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
    if (!this.props.handleUpdate) return;
    // Add a new counter to the Map
    this.props.handleUpdate(state => {
      const { counters } = state;
      counters.set(genId(), Counter.createState(0));
      return Object.assign(state, { counters });
    })
  }

  removeCounter(id) {
    if (!this.props.handleUpdate) return;
    // Remove a counter given an ID
    this.props.handleUpdate(state => {
      const { counters } = state;
      counters.delete(id);
      const totalCount = getTotal(counters);
      return {counters, totalCount};
    })
  }

  updateCounter(id, update) {
    if (!this.props.handleUpdate) return;
    // Update a single counter's state
    this.props.handleUpdate(state => {
      const { counters } = state;
      counters.set(id, update(counters.get(id)));
      const totalCount = getTotal(counters);
      return { counters, totalCount }
    });
  }

  render() {
    const { counters, totalCount } = this.props;
    return (
      <div>
        <p>Total count is {totalCount}</p>
        <button onClick={() => this.addCounter()}>Add counter</button>
        {
          Array.from(counters).map(([id, counter]) => {
            return (
              <div>
                <Counter count={counter.count} handleUpdate={(up) => this.updateCounter(id, up)} />
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
  updateCounterList(handleUpdate) {
    // Update our state based on any state updates from the counterList
    this.setState(Object.assign(this.state, handleUpdate(this.state)));
  }
  render() {
    return (
      <CounterList {...this.state} handleUpdate={this.updateCounterList} />
    );
  }
};

// generate uid
const genId = () => String(window.performance.now());

// get total count
const getTotal = counters => Array.from(counters).reduce((sum, [id, c]) => sum + c.count, 0);

render(<Page />, document.body)
