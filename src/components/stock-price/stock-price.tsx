import { Component, h, State, Element, Prop, Watch } from "@stencil/core";
import { AV_API_KEY } from '../../global/global'

@Component({
  tag: 'wj-stock-price',
  styleUrl: './stock-price.css',
  shadow: true
})

export class StockPrice {
  stockInput: HTMLInputElement;
  // initialStockSymbol: string;
  @Element() el: HTMLElement;
  @State() fetchedPrice: number;
  @State() stockUserInput: string;
  @State() stockInputValid = false;
  @State() error: string;

  @Prop({mutable: true, reflect: true}) stockSymbol: string; // será acessada de fora

  // é boa prática colocar o watcher depois da Prop a qual ele se referirá
  @Watch('stockSymbol') // recebe como parâmetro o nome da propriedade que vai observar se haverá mudança
  stockSymbolChanged(newValue: string, oldValue: string) { // stencil nos dá esses parâmetros
    if (newValue !== oldValue) {
      this.stockUserInput = newValue; // ao mudar no inspecionar a mudança refletirá no input
      this.fetchStockPrice(newValue)
    }
  }

  onUserInput(event: Event) {
    this.stockUserInput = (event.target as HTMLInputElement).value;
    if (this.stockUserInput.trim() !== '') {
      this.stockInputValid = true;
    } else {
      this.stockInputValid = false;
    }
  }

  onFetchStockPrice(event: Event) {
    this.stockSymbol = this.stockInput.value;
    event.preventDefault();
    console.log('Submitted!')
    this.fetchStockPrice(this.stockSymbol);
  }

  componentWillLoad() { // executará antes que o componente estiver prestes a carregar, executa antes de popular com a DOM
    console.log('componentWillLoad');
    console.log(this.stockSymbol);
  }

  componentWillUpdate() { // vai rodar exatamente antes do componente re-renderizar porque alguma propriedade ou estado mudou
    console.log('componentWillUpdate');
  }

  componentDidUpdate() {
    console.log('componentDidUpdate');
    // if (this.stockSymbol !== this.initialStockSymbol) { // teremos duas requests: 1) quando meu atributo resultou em um novo valor para stock symbol, é chamado sempre que uma prop muda
    //   this.initialStockSymbol = this.stockSymbol // para atualizar nosso stock symbol quando carregarmos a página e não obter duas requisições
    //   this.fetchStockPrice(this.stockSymbol);
    // }
  }

  disconnectedCallback() {
    console.log('componentDidUnload')
  }

  componentDidLoad() { // Called once just after the component is fully loaded and the first render() occurs.
    console.log('componentDidLoad');
    if (this.stockSymbol) {
      // this.initialStockSymbol = this.stockSymbol
      this.stockUserInput = this.stockSymbol;
      this.stockInputValid = true;
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