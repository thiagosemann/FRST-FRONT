import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from 'src/app/shared/service/authentication';
import { MercadoPagoService } from 'src/app/shared/service/mercadoPago_service';
import { User } from 'src/app/shared/utilitarios/user';

@Component({
  selector: 'app-add-credit',
  templateUrl: './add-credit.component.html',
  styleUrls: ['./add-credit.component.css']
})
export class AddCreditComponent implements OnInit {
  totalCredits: number = 100;
  user!: User | null;
  products = [
    { credits: 10 },
    { credits: 20 },
    { credits: 30 },
    { credits: 40 }
  ];
  showInput: boolean = false;

  constructor(private authService: AuthenticationService, private mercadoPagoService: MercadoPagoService) {}

  ngOnInit(): void {
    this.user = this.authService.getUser();
  }

  criarPreferenciaMercadoPago(product :any): void {
    if (this.user && product.credits > 0) {
      const body = {
        additional_info: 'Compra de créditos para usar no sistema Foreasy.',
        auto_return: 'approved',
        back_urls: {
          failure: 'localhost:4200/addCredit',
          pending: 'localhost:4200/addCredit',
          success: 'localhost:4200/addCredit'
        },
        date_created: new Date().toISOString(),
        items: [
          {
            id: '001',
            title: 'Adicionar Crédito Foreasy',
            category_id: 'eletronicos',
            currency_id: 'BRL',
            description: 'Descrição do Produto 1',
            quantity: 1,
            unit_price: product.credits // Preço em centavos (R$20,00)
          },
        ],
        marketplace: 'NONE',
        metadata: {},
        operation_type: 'regular_payment',
        redirect_urls: {
          failure: 'localhost:4200/addCredit',
          pending: 'localhost:4200/addCredit',
          success: 'localhost:4200/addCredit'
        },
        total_amount: product.credits, // Convertendo para centavos
        site_id: 'MLB'
      };

      this.mercadoPagoService.criarPreferencia(body).subscribe(
        response => {
          // Lógica para lidar com a resposta do MercadoPago
          console.log('Link de redirecionamento do MercadoPago:', response.redirectUrl);
          window.location.href = response.redirectUrl;

        },
        error => {
          console.error('Erro ao criar preferência no MercadoPago:', error);
          // Trate o erro de acordo com a necessidade do seu aplicativo
        }
      );
    } else {
      console.error('Usuário não encontrado ou valor inválido selecionado.');
    }
  }
}
