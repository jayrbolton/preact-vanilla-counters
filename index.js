import {h, render, Component} from 'preact';

// Reusable, stateless counter component
class Counter extends Component {

  // Create a new counter state
  static createState(start = 0) {
    return {count: start};
  }

  // Increment the counter
  increment () {
    const count = this.props.count + 1;
    this.props.update({ count })
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
    const { counters } = this.props;
    counters.set(genId(), Counter.createState(0));
    this.props.update(Object.assign(this.props, { counters }));
  }

  removeCounter(id) {
    const { counters } = this.props;
    counters.delete(id);
    const totalCount = getTotal(counters);
    this.props.update({counters, totalCount});
  }

  updateCounter(id, newCounter) {
    const { counters } = this.props;
    counters.set(id, newCounter);
    const totalCount = getTotal(counters);
    this.props.update({counters, totalCount})
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
                <Counter count={counter.count} update={state => this.updateCounter(id, state)} />
                { /*<Counter count={counter.count} handleUpdate={(up) => this.updateCounter(id, up)} />*/}
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
    this.state = {
      counterList: CounterList.createState()
    };
  }
  updateCounterList(newCounterList) {
    // Update our state based on any state updates from the counterList
    this.setState({
      counterList: newCounterList
    })
  }
  render() {
    const { counterList } = this.state;
    return (
      <CounterList {...counterList} update={state => this.updateCounterList(state)} />
    );
  }
};

// generate uid
const genId = () => String(window.performance.now());

// get total count
const getTotal = counters => Array.from(counters).reduce((sum, [id, c]) => sum + c.count, 0);

render(<Page />, document.body)
