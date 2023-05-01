import { Component, h, State, Element, Prop } from "@stencil/core";
import { AV_API_KEY } from '../../global/global'

@Component({
  tag: 'wj-stock-price',
  styleUrl: './stock-price.css',
  shadow: true
})

export class StockPrice {
  stockInput: HTMLInputElement;

  @State() fetchedPrice: number; 
  @State() stockUserInput: string;
  @State() stockInputValid = false;
  @State() error: string;
  @Prop() stockSymbol: string; // será acessada de fora

  @Element() el: HTMLElement; 
  
  onUserInput(event: Event) {
    this.stockUserInput = (event.target as HTMLInputElement).value;
    if (this.stockUserInput.trim() !== '') {
      this.stockInputValid = true;
    } else {
      this.stockInputValid = false;
    }
  }

  onFetchStockPrice(event: Event) { 
    const stockSymbol = this.stockInput.value;
    event.preventDefault(); 
    console.log('Submitted!')
    this.fetchStockPrice(stockSymbol);
  }

  componentDidLoad() { // Called once just after the component is fully loaded and the first render() occurs.
    if (this.stockSymbol) {
      this.fetchStockPrice(this.stockSymbol)
    }
  }

  fetchStockPrice(stockSymbol: string) { // entrará o valor no input
    fetch(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${stockSymbol}&apikey=${AV_API_KEY}`) // troque o demo pela Key e o IBM pela variável stockSymbol
    .then(res => {
      if (res.status !== 200) {
        throw new Error('Invalid!')
      }
      return res.json();
    })
    .then(parsedRes => { // resposta analisada disponível

      if (!parsedRes['Global Quote']['05. price']) {
        throw new Error('Invalid Symbol!')
      }
      this.error = null; // to clear it
      this.fetchedPrice = +parsedRes['Global Quote']['05. price'] 
    }) 
    .catch(erro => {    
      this.error = erro.message; // the erro object has a message property
    }) 
  }

  render() { 
    let dataContent = <p>Please, enter a symbol!</p>;
    if (this.error) {
      dataContent = <p>{this.error}</p>
    }
    if (this.fetchedPrice) {
      dataContent = <p>Price: ${this.fetchedPrice}</p>
    }

    return [
      <form onSubmit={this.onFetchStockPrice.bind(this)}> 
        <input 
        id="stock-symbol" 
        ref={el => this.stockInput = el} 
        value={this.stockUserInput}
        onInput={this.onUserInput.bind(this)}
        />
        <button type="submit" disabled={!this.stockInputValid}>Fetch</button>
      </form>,
      <div> 
        {dataContent}
      </div>
    ]
  }
}