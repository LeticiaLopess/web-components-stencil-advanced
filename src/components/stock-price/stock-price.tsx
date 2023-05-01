import { Component, h, State, Element } from "@stencil/core";
import { AV_API_KEY } from '../../global/global'

@Component({
  tag: 'wj-stock-price',
  styleUrl: './stock-price.css',
  shadow: true
})

export class StockPrice {
  stockInput: HTMLInputElement;

  @State() fetchedPrice: number; // toda vez que eu mudar o estado o Stencil vai automaticamente recarregar o render e atualizar
  @State() stockUserInput: string;
  @State() stockInputValid = false;

  @Element() el: HTMLElement; // referencia o próprio web componente | usamos HTMLElement porque é baseado nele
  
  onUserInput(event: Event) {
    this.stockUserInput = (event.target as HTMLInputElement).value;
    if (this.stockUserInput.trim() !== '') {
      this.stockInputValid = true;
    } else {
      this.stockInputValid = false;
    }
  }

  onFetchStockPrice(event: Event) { // acionado sempre que o formulário é enviado
    // this.querySelector() - teremos um erro pois estariamos nos referindo à classe e a classe não possui um método de query selector como temos no Vanilla JS
    // const stockSymbol = (this.el.shadowRoot.querySelector('#stock-symbol') as HTMLInputElement).value // acessando o input -> Somente colocar .nodeValue ou envolver com o parênteses e colocar as HTMLInputElement para o stencil saber que é um elemento HTML, pois ele não reconhece // use shadowRoot, lembre-se que esse componente está com a shadowDom ativa
    const stockSymbol = this.stockInput.value;
    event.preventDefault(); // enviaria o formulário automaticamente como uma requisição para o servidor que esse app estará rodando, mas eu não quero isso. Quero enviar uma requisição para um servidor diferente mas eu não quero enviar uma requisição automatizada quando esse formulário é enviado para o mesmo servidor que o app está rodando porque não colherá nenhum resultado
    console.log('Submitted!')

    fetch(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${stockSymbol}&apikey=${AV_API_KEY}`) // troque o demo pela Key e o IBM pela variável stockSymbol
    .then(res => {
      return res.json(); // resposta como json
    })
    .then(parsedRes => { // resposta analisada disponível
      //console.log(parsedRes);
      this.fetchedPrice = +parsedRes['Global Quote']['05. price'] // acessando somente a variável 'price' que está dentro do objeto Global Quote
    }) 
    .catch(erro => { // A catch will catch any errors that occur    
      console.log(erro)

    }) 
  }

  render() { // div -> output
    // we want to listen to this form submit and fetch that input value here
    // that will be the first step because that will allow us to, as a next step, fetch our price
    // value é um atributo de HTMLElements
    return [
      <form onSubmit={this.onFetchStockPrice.bind(this)}> 
        <input 
        id="stock-symbol" 
        ref={el => this.stockInput = el} 
        value={this.stockUserInput}
        onInput={this.onUserInput.bind(this)} // para que o this dentro da função onUserInput se refira à classe e não para o elemento input
        />
        <button type="submit" disabled={!this.stockInputValid}>Fetch</button>
      </form>,
      <div> 
        <p>Price: ${this.fetchedPrice}</p>
      </div>
    ]
  }
}