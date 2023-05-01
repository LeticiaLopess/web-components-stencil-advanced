import { Component, h } from "@stencil/core";

@Component({
  tag: 'wj-stock-price',
  styleUrl: './stock-price.css',
  shadow: true
})

export class StockPrice {
  onFetchStockPrice(event: Event) { // acionado sempre que o formulário é enviado
    event.preventDefault(); // enviaria o formulário automaticamente como uma requisição para o servidor que esse app estará rodando, mas eu não quero isso. Quero enviar uma requisição para um servidor diferente mas eu não quero enviar uma requisição automatizada quando esse formulário é enviado para o mesmo servidor que o app está rodando porque não colherá nenhum resultado
    console.log('Submitted!')
  }

  render() { // div -> output
    // we want to listen to this form submit and fetch that input value here
    // that will be the first step because that will allow us to, as a next step, fetch our price

    return [
      <form onSubmit={this.onFetchStockPrice}>
        <input id="stock-symbol" />
        <button type="submit">Fetch</button>
      </form>,
      <div> 
        <p>Price: {0}</p>
      </div>
    ]

  }
}