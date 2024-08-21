import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router } from '@angular/router';
import { HttpRequestService } from '../../services/http-request.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { AsyncPipe, CommonModule } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { startWith, map } from 'rxjs/operators';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { Observable } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-dialog-create-banho',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    AsyncPipe,
    MatAutocompleteModule,
  ],
  templateUrl: './dialog-create-banho.component.html',
  styleUrl: './dialog-create-banho.component.scss',
})
export class DialogCreateBanhoComponent implements OnInit {
  // FormControls separados para cada campo
  registerTipoBanho = new FormControl('');
  // registerPorte = new FormControl('');
  // registerPelagem = new FormControl('');
  valor = new FormControl('');

  // Dados estáticos para as opções
  tipoBanho: string[] = [
    'Banho',
    'Banho e Tosa na máquina',
    'Banho e Tosa na tesoura',
    'Banho e Tosa higiênica',
    'Banho e Tosa completa',
  ];
  // pelagem: string[] = ['Médio', 'Curto', 'Longo'];
  // porte: string[] = ['Mini', 'Pegueno', 'Médio', 'Grande'];

  // Observable para armazenar as opções filtradas
  filteredTipoBanho!: Observable<string[]>;
  filteredPorte!: Observable<string[]>;
  filteredPelagem!: Observable<string[]>;

  constructor(
    private formBuilder: FormBuilder,
    private httpService: HttpRequestService,
    public dialogRef: MatDialogRef<DialogCreateBanhoComponent>,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    // Configuração de filtragem para o primeiro autocomplete
    this.filteredTipoBanho = this.registerTipoBanho.valueChanges.pipe(
      startWith(''),
      map((value) => this._filterTipoBanho(value || ''))
    );

    // // Configuração de filtragem para o segundo autocomplete
    // this.filteredPorte = this.registerPorte.valueChanges.pipe(
    //   startWith(''),
    //   map((value) => this._filterPorte(value || ''))
    // );
    // this.filteredPelagem = this.registerPelagem.valueChanges.pipe(
    //   startWith(''),
    //   map((value) => this._filterPelagem(value || ''))
    // );
  }

  // Função de filtragem para o primeiro campo
  private _filterTipoBanho(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.tipoBanho.filter((tipoBanho) =>
      tipoBanho.toLowerCase().includes(filterValue)
    );
  }

  // Função de filtragem para o segundo campo
  // private _filterPorte(value: string): string[] {
  //   const filterValue = value.toLowerCase();
  //   return this.porte.filter((porte) =>
  //     porte.toLowerCase().includes(filterValue)
  //   );
  // }
  // private _filterPelagem(value: string): string[] {
  //   const filterValue = value.toLowerCase();
  //   return this.pelagem.filter((pelagem) =>
  //     pelagem.toLowerCase().includes(filterValue)
  //   );
  // }
  cadastrar():void {
    if (
      this.registerTipoBanho.valid &&
      // this.registerPorte.valid &&
      // this.registerPelagem.valid &&
      this.valor.valid
    ) {
      // Coletar os valores do formulário
      const formData = {
        tipoBanho: this.registerTipoBanho.value,
        // porte: this.registerPorte.value,
        // pelagem: this.registerPelagem.value,
        valor: this.valor.value,
      };

      // Chamar o serviço para enviar os dados
      this.httpService.categoriaBanho(formData).subscribe(
        (response) => {
            console.log('Registro criado com sucesso.');
            this.snackBar.open('Registro criado com sucesso.', 'Fechar', {
              duration: 50000,
            });
            window.location.reload();
        },
        (error) => {
          console.error('Erro ao criar registro:', error);
        }
      );
    } else {
      console.error('Por favor, preencha todos os campos corretamente.');
      this.snackBar.open(
        'Erro ao registrar, tente novamente.',
        'Fechar',
        {
          duration: 50000,
        }
      );
    }
  }
}
