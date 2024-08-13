import { AsyncPipe, CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { HttpRequestService } from '../../services/http-request.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-dialof-adicionar-estoque',
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
  templateUrl: './dialof-adicionar-estoque.component.html',
  styleUrl: './dialof-adicionar-estoque.component.scss'
})
export class DialofAdicionarEstoqueComponent {
  estoqueForm: FormGroup;
  categorias: any[] = [];
  categoriatipo:string[]= [
    'Remédios',
    'Brinquedos',
    'Ração',
    'Ossinhos e Petiscos',
    'Higiene e Cosméticos',
    'Roupas e Acessórios',
    'Caminhas e Outros',
    'Coleira Guias e Peitorais',

  ];
  imageBase64: string = '';
  constructor(
    private fb: FormBuilder,
    private estoqueService: HttpRequestService,
    private snackBar: MatSnackBar
  ) {
    this.estoqueForm = this.fb.group({
      nomeItem: [''],
      categoria: [''],
      valor: [''],
      quantidade: [''],
      imagem: [''],
    imagemBase64: ['']
    });
  }

  ngOnInit(): void {
    this.loadCategoriasEstoque();
  }

  loadCategoriasEstoque(): void {
  
  }
  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];

      // Verifica o tamanho do arquivo (exemplo: 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        alert('O arquivo é muito grande. O tamanho máximo permitido é 5MB.');
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        this.imageBase64 = reader.result as string;
        console.log('Base64 da imagem:', this.imageBase64); // Log para verificar o conteúdo da imagem
        this.estoqueForm.patchValue({ imagemBase64: this.imageBase64 });
      };
      reader.onerror = (error) => {
        console.error('Erro ao ler o arquivo:', error);
      };
      reader.readAsDataURL(file);
    } else {
      console.error('Nenhum arquivo foi selecionado.');
    }
  }
  cadastrar(): void {
    if (this.estoqueForm.valid) {
      this.estoqueService.estoque(this.estoqueForm.value).subscribe(
        (response) => {
          console.log('Estoque cadastrado com sucesso', response);
          this.snackBar.open('Registro criado com sucesso.', 'Fechar', {
            duration: 2000,
          });
          window.location.reload();
        },
        (error) => {
          console.error('Erro ao cadastrar estoque', error);
        }
      );
    }
  }
}