import { Component, h } from "@stencil/core";

@Component({
  tag: 'wj-stock-price',
  styleUrl: './stock-price.css',
  shadow: true
})

export class StockPrice {
  render() { // div -> output
    // we want to listen to this form submit and fetch that input value here
    // that will be the first step because that will allow us to, as a next step, fetch our price
    return [
      <form>
        <input id="stock-symbol" />
        <button type="submit">Fetch</button>
      </form>,
      <div> 
        <p>Price: {0}</p>
      </div>
    ]
  }
}