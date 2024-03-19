import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthenticationService } from 'src/app/shared/service/authentication';
import { MercadoPagoService } from 'src/app/shared/service/mercadoPago_service';
import { UserService } from 'src/app/shared/service/user_service';
import { User } from 'src/app/shared/utilitarios/user';

@Component({
  selector: 'app-add-credit',
  templateUrl: './add-credit.component.html',
  styleUrls: ['./add-credit.component.css']
})
export class AddCreditComponent implements OnInit {
  totalCredits: number = 100;
  user!: User | null;
  selectedValue: number = 0;
  products = [
    { credits: 10 },
    { credits: 20 },
    { credits: 30 },
    { credits: 40 }
  ];
  showInput: boolean = false;
  status: string = '';

  constructor(private route: ActivatedRoute,
              private authService: AuthenticationService, 
              private mercadoPagoService: MercadoPagoService, 
              private userService: UserService) {}

  ngOnInit(): void {
    const userAux = this.authService.getUser();
    if(userAux){
      this.getUser(userAux.id)
    }
    this.route.params.subscribe(params => {
      this.status = params['status'] || 'default';
      // Aqui você pode tomar ações com base no status recebido
      console.log(this.status)
    });
  }

  getUser(id:number){
    this.userService.getUser(id).subscribe(
      (updatedUser: User) => {
        // Atualiza os dados do usuário no localStorage
        if (updatedUser) {
          this.user = updatedUser;
        } else {
          console.error('Usuário não encontrado.');
        }
      },
      (error) => {
        console.error('Erro ao buscar usuário:', error);
      }
    );
  }

  criarPreferenciaMercadoPago(product :any): void {
    if (this.user && product.credits > 0) {
      const body = {
        additional_info: 'Compra de créditos para usar no sistema Foreasy.',
        auto_return: 'approved',
        back_urls: {
          failure: 'https://www.frst.com.br/addCredit/failure',
          pending: 'https://www.frst.com.br/addCredit/pending',
          success: 'https://www.frst.com.br/addCredit/success'
        },
        date_created: new Date().toISOString(),
        items: [
          {
            id: '001',
            title: 'Adicionar Crédito Foreasy',
            category_id: 'eletronicos',
            currency_id: 'BRL',
            description: 'Crédito de 10 fichas no sistema da foreasy.',
            quantity: 1,
            unit_price: product.credits // Preço em centavos (R$20,00)
          },
        ],
        marketplace: 'NONE',
        metadata: {
          user_email: this.user.email, // Adicione o e-mail único do usuário
          user_id: this.user.id // Adicione o ID único do usuário
          },
        operation_type: 'regular_payment',
        redirect_urls: {
          failure: 'https://www.frst.com.br/addCredit/failure',
          pending: 'https://www.frst.com.br/addCredit/pending',
          success: 'https://www.frst.com.br/addCredit/success'
        }, 
        total_amount: product.credits, // Convertendo para centavos
        site_id: 'MLB',
        user_id: this.user.id
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
