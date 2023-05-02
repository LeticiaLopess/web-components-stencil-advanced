import { Component, h, State, Event, EventEmitter } from "@stencil/core"
import { AV_API_KEY } from '../../global/global'

@Component ({
  tag: 'wj-stock-finder',
  styleUrl: './stock-finder.css',
  shadow: true
})

export class StockFinder {
  stockNameInput: HTMLInputElement;

  @State() searchResults: {symbol: string, name: string}[] = []; // os resultados de pesquisa é uma lista de objetos onde cada objeto tem um símbolo o qual é uma string e um nome o qual é uma string também

  @Event({bubbles: true, composed: true}) wjSymbolSelected: EventEmitter<string>; // EventEmitter é um tipo genérico que significa que podemos passar informações extras com esse tipo de definição onde diremos ao typescript qual tipo de dado vai eventualmente ser emitido com esse EventEmitter e fazemos isso com o <>

  onFindStocks(event: Event) {
    event.preventDefault();
    const stockName = this.stockNameInput.value;
    fetch(`https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${stockName}&apikey=${AV_API_KEY}`)
    .then(res => res.json())
    .then(parsedRes => {
      this.searchResults = parsedRes['bestMatches'].map(match => { // os resultados estão dentro do objeto 'bestMatches', então sempre dê um console.log para se certificar
        return {name: match['2. name'], symbol: match['1. symbol']}
      })
    }).catch(err => {
      console.log(err)
    })
  }

  onSelectSymbol(symbol: string) {
    this.wjSymbolSelected.emit(symbol)
  }

  render() {
    return [
    <form onSubmit={this.onFindStocks.bind(this)}>
      <input
      id="stock-symbol"
      ref={el => this.stockNameInput = el}
      />
      <button type="submit">Find</button>
    </form>,
    <ul>
      {this.searchResults.map(result => <li onClick={this.onSelectSymbol.bind(this, result.symbol)}><strong>{result.symbol}</strong> - {result.name}</li>)} 
    </ul>
    // map percorre o array e retorna um outro array com a mesma quantidade de elementos
  ];

  }
}