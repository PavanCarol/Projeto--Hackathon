import { Component } from '@angular/core';
import {
  FormBuilder,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { HttpRequestService } from '../../../../services/http-request.service';
import { DialogCreateNewVeterinarioComponent } from '../../../../dialog/dialog-create-new-veterinario/dialog-create-new-veterinario.component';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-dialog-new-veterinario',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatIconModule, MatButtonModule],
  templateUrl: './dialog-new-veterinario.component.html',
  styleUrl: './dialog-new-veterinario.component.scss',
})
export class DialogNewVeterinarioComponent {
  imageBase64: string = '';
  clinica = this.formBuilder.group({
    nome: ['', [Validators.required, Validators.minLength(2)]],
    date: ['', [Validators.required]],
    tempoAtuacao: ['', [Validators.required]],
    faculdade: ['', [Validators.required]],
    posGratuacao: [''],
    imagem: [''],
    imagemBase64: [''], // Adicione esta linha
  });
  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private httpService: HttpRequestService,
    private dialog: MatDialog
  ) {}
  ngOnInit(): void {}

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
        this.clinica.patchValue({ imagemBase64: this.imageBase64 });
      };
      reader.onerror = (error) => {
        console.error('Erro ao ler o arquivo:', error);
      };
      reader.readAsDataURL(file);
    } else {
      console.error('Nenhum arquivo foi selecionado.');
    }
  }

  cadastrarVeterinario() {
    if (this.clinica.valid) {
      const formData = this.clinica.value;
      console.table(formData);
      this.httpService.clinica(formData).subscribe(
        (response) => {
          if (response.sucesso) {
            console.log('foi');
            this.dialog.open(DialogCreateNewVeterinarioComponent);
          } else {
            console.log(response.mensagem);
          }
        },
        (error) => {
          console.error(error);
        }
      );
    }
  }
}
