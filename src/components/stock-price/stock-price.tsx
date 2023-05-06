import { Component, h, State, Element, Prop, Watch, Listen } from "@stencil/core";
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
  @State() error: string; // se for tipo -> ':', se for atribuição de valor booleano -> '='
  @State() loading = false; // é tipo uma propriedade, variável; me ajuda a controlar se nós estaremos atualmente carregando ou não
  @Prop({mutable: true, reflect: true}) stockSymbol: string; // será acessada de fora

  // é boa prática colocar o watcher depois da Prop a qual ele se referirá
  @Watch('stockSymbol') // recebe como parâmetro o nome da propriedade que vai observar se haverá mudança
  stockSymbolChanged(newValue: string, oldValue: string) { // stencil nos dá esses parâmetros
    if (newValue !== oldValue) {
      this.stockUserInput = newValue; // ao mudar no inspecionar a mudança refletirá no input
      this.stockInputValid = true;
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

  @Listen('wjSymbolSelected', { target: 'body' }) // nome do evento que está em stock-finder o qual eu quero ouvir. Colocamos body para dizer ao stencil que devemos ouvir isso globalmente, pois estamos ouvindo um evento de outro componente o qual não vai identificar sem o body. E se outro evento bubbles up (borbulha) na DOM, caminha por todo corpo 
  onStockSymbolSelected(event: CustomEvent) { // como saber que isso é acionado toda vez que o stock symbol muda? Toda vez que selecionamos o stock symbol naquele outro componente? Nós fazemos isso adicionando um decorator especial, the @Listen (precisa importar do stencil)
    // O @Listen decorator espera que o evento to bubble up todo o caminho até o elemento host
    // pra outros eventos de clique, input e tal pode funcionar mas vai ser mais difícil de identificar o exato elemento em que está acontecendo
    console.log('stock symbol selected: ' + event.detail)
    if (event.detail && event.detail !== this.stockSymbol) { // The detail property returns details about an event. The detail property is read-only.
      this.stockSymbol = event.detail;
    }
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
    this.loading = true;
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
      this.loading = false; // because it's not loading anymore
    })
    .catch(erro => {
      this.error = erro.message; // the erro object has a message property
      this.fetchedPrice = null;
      this.loading = false; // because it's not loading anymore
    })
  }

  hostData() { // método que podemos adicionar a qualquer web component stencil
    return { // retornaremos um objeto com algum metadata sobre o elemento host
      class: this.error ? 'error' : ''  // poderia setar um estilo para erro // it's a class key and this allows you to add a class that will be set on your costum element [se você recarregar a página você vai ver que a classe estará disponível no componente]. Somente se eu tiver inserido um simbolo inválido eu terei a classe 'error' inserida, que poderá acompanhar um estilo padrão para erros
    }
  }

  render() {
    let dataContent = <p>Please, enter a symbol!</p>;
    if (this.error) {
      dataContent = <p>{this.error}</p>
    }
    if (this.fetchedPrice) {
      dataContent = <p>Price: ${this.fetchedPrice}</p>
    }
    if (this.loading) {
      dataContent = <wj-spinner />; // não é necessário importar pois será usado como um elemento normal do HTML (o que elementos customizados são, no final), sendo globalmente disponível
    }

    return [
      <form onSubmit={this.onFetchStockPrice.bind(this)}>
        <input
        id="stock-symbol"
        ref={el => this.stockInput = el}
        value={this.stockUserInput}
        onInput={this.onUserInput.bind(this)}
        />
        <button type="submit" disabled={!this.stockInputValid || this.loading}>Fetch</button> 
      </form>,
      <div>
        {dataContent}
      </div>
    ] // enquanto o stock input for inválido ou estiver em modo de carregamento, o botão ficará desabilitado.
  }
}