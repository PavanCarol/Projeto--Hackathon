import { AsyncPipe, CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { HttpRequestService } from '../../services/http-request.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DialogConfirmacaoExcluirCategoriaComponent } from '../dialog-confirmacao-excluir-categoria/dialog-confirmacao-excluir-categoria.component';

@Component({
  selector: 'app-dialog-detalhes',
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
    MatAutocompleteModule,
    AsyncPipe,
  ],
  templateUrl: './dialog-detalhes.component.html',
  styleUrl: './dialog-detalhes.component.scss',
})
export class DialogDetalhesComponent {
  constructor(
    public dialogRef: MatDialogRef<DialogDetalhesComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private httpRequestService: HttpRequestService,
    private snackBar: MatSnackBar,
    public dialog: MatDialog
  ) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    // ID da categoria que está sendo editada
    const categoriaId = this.data.categoria.cra6a_custoid;

    // Chame o serviço para atualizar a categoria
    this.httpRequestService
      .updateCategoria(categoriaId, this.data.categoria)
      .subscribe(
        (response) => {
          console.log('Categoria atualizada com sucesso:', response);
          this.dialogRef.close(this.data.categoria); // Envia os valores de volta ao componente pai
          this.snackBar.open('Item Atualizado com sucesso', 'Fechar', {
            duration: 2000,
          });
          window.location.reload();
        },
        (error) => {
          console.error('Erro ao atualizar categoria:', error);
          // Aqui você pode mostrar uma mensagem de erro ao usuário
        }
      );
  }

  onDelete(): void {
    const categoriaId = this.data.categoria.cra6a_custoid; // O ID da categoria a ser excluída

    const dialogRef = this.dialog.open(
      DialogConfirmacaoExcluirCategoriaComponent
    );

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.httpRequestService.deleteCategoria(categoriaId).subscribe(
          (response) => {
            console.log('Categoria deletada com sucesso:', response);
            this.dialogRef.close({ deleted: true }); // Fecha o diálogo e indica que a categoria foi deletada
            this.snackBar.open('Item deletado com sucesso', 'Fechar', {
              duration: 2000,
            });
            window.location.reload();
          },
          (error) => {
            console.error('Erro ao deletar categoria:', error);
            // Aqui você pode mostrar uma mensagem de erro ao usuário
          }
        );
      }
    });
  }
}
