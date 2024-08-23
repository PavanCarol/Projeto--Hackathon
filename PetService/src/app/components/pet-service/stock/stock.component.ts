import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { DialofAdicionarEstoqueComponent } from '../../../dialog/dialof-adicionar-estoque/dialof-adicionar-estoque.component';
import { MatDialog } from '@angular/material/dialog';
import { HttpRequestService } from '../../../services/http-request.service';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormsModule } from '@angular/forms';
import { ConfirmacaoAntesComponent } from '../../../dialog/confirmacao-antes/confirmacao-antes.component';

// Definir interfaces fora da classe para evitar erros de decoradores
export interface EstoqueItem {
  cra6a_estoqueid: string;
  cra6a_categoria: number;
  cra6a_nomeitem: string;
  cra6a_valor: number;
  cra6a_quantidade: number;
  cra6a_imagem: string;
  quantidadeAlterada?: boolean;
}

interface CategoriaAgrupada {
  nome: string;
  itens: EstoqueItem[];
  isVisible: boolean; // Adicione esta linha
}

@Component({
  selector: 'app-stock',
  standalone: true,
  imports: [
    MatIconModule,
    CommonModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    FormsModule,
  ],
  templateUrl: './stock.component.html',
  styleUrl: './stock.component.scss',
})
export class StockComponent implements OnInit {
  // Definição das propriedades existentes
  isEditVisible: boolean = false;
  isAnimating: boolean = false;
  selectedItem: EstoqueItem | null = null; // Item selecionado para edição

  displayedColumns: string[] = [
    'cra6a_nomeitem',
    'cra6a_valor',
    'cra6a_quantidade',
    'actions',
  ];

  constructor(
    public dialog: MatDialog,
    private estoqueService: HttpRequestService,
    private snackBar: MatSnackBar
  ) {}

  showEdit(item: EstoqueItem): void {
    console.log('Item selecionado para edição:', item); // Adicione este log
    this.selectedItem = item;
    this.isEditVisible = true;
    this.isAnimating = true;
    document.querySelector('.edit')?.classList.add('show');
  }

  hideEdit(): void {
    this.isAnimating = false;
    setTimeout(() => {
      this.isEditVisible = false;
      this.selectedItem = null;
      document.querySelector('.edit')?.classList.remove('show');
    }, 500);
  }

  estoqueItens: EstoqueItem[] = [];
  categoriasAgrupadas: CategoriaAgrupada[] = [];

  ngOnInit(): void {
    this.loadEstoqueItens();
  }

  loadEstoqueItens(): void {
    this.estoqueService.getEstoqueItens().subscribe(
      (data: EstoqueItem[]) => {
        this.estoqueItens = data;
        this.agruparPorCategoria();
      },
      (error) => {
        console.error('Erro ao carregar itens do estoque', error);
      }
    );
  }

  // Método para alternar a visibilidade das categorias
  toggleCategoria(categoriaSelecionada: CategoriaAgrupada): void {
    this.categoriasAgrupadas.forEach((categoria) => {
      if (categoria === categoriaSelecionada) {
        categoria.isVisible = !categoria.isVisible;
      } else {
        categoria.isVisible = false;
      }
    });
  }

  agruparPorCategoria(): void {
    const categoriasMap: { [key: number]: string } = {
      0: 'Remédios',
      1: 'Brinquedos',
      2: 'Ração',
      3: 'Ossinhos e Petiscos',
      4: 'Higiene e Cosméticos',
      5: 'Roupas e Acessórios',
      6: 'Caminhas e Outros',
      7: 'Coleira Guias e Peitorais',
    };

    this.categoriasAgrupadas = this.estoqueItens.reduce(
      (acc: CategoriaAgrupada[], item: EstoqueItem) => {
        const categoriaNome =
          categoriasMap[item.cra6a_categoria] || 'Desconhecida';
        let categoria = acc.find((cat) => cat.nome === categoriaNome);
        if (!categoria) {
          categoria = { nome: categoriaNome, itens: [], isVisible: false };
          acc.push(categoria);
        }
        categoria.itens.push(item);
        return acc;
      },
      []
    );
  }

  aumentarQuantidade(item: any): void {
    item.cra6a_quantidade++;
    item.quantidadeAlterada = true; // Marca que a quantidade foi alterada
  }

  diminuirQuantidade(item: any): void {
    if (item.cra6a_quantidade > 0) {
      item.cra6a_quantidade--;
      item.quantidadeAlterada = true; // Marca que a quantidade foi alterada
    }
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
        const base64Image = reader.result as string;
        console.log('Base64 da imagem:', base64Image); // Log para verificar o conteúdo da imagem

        if (this.selectedItem) {
          // Atualiza o campo cra6a_imagem do selectedItem com o novo base64
          this.selectedItem.cra6a_imagem = base64Image.split(',')[1];
        }
      };
      reader.onerror = (error) => {
        console.error('Erro ao ler o arquivo:', error);
      };
      reader.readAsDataURL(file);
    } else {
      console.error('Nenhum arquivo foi selecionado.');
    }
  }

  salvarQuantidade(item: any): void {
    this.estoqueService.updateEstoqueItem(item).subscribe(
      (response) => {
        item.quantidadeAlterada = false; // Desmarca a alteração após salvar
        console.log('Quantidade atualizada com sucesso', response);
        this.snackBar.open('Alteração concluída com sucesso.', 'Fechar', {
          duration: 2000,
        });
        window.location.reload();
      },
      (error) => {
        console.error('Erro ao atualizar quantidade', error);
      }
    );
  }
  salvarAlteracao(item: EstoqueItem): void {
    this.estoqueService.updateAlteracao(item).subscribe(
      (response) => {
        console.log('Item atualizado com sucesso', response);
        this.snackBar.open('Alteração concluída com sucesso.', 'Fechar', {
          duration: 2000,
        });
        this.hideEdit(); // Fecha o editor após salvar
        this.loadEstoqueItens(); // Atualiza a lista de itens no estoque
      },
      (error) => {
        console.error('Erro ao atualizar o item', error);
      }
    );
  }

  excluirItem(item: any): void {
    if (!item || !item.cra6a_estoqueid) {
      console.error('Item inválido ou ID ausente:', item);
      return;
    }

    const dialogRef = this.dialog.open(ConfirmacaoAntesComponent);

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.estoqueService.deleteEstoqueItem(item).subscribe(
          (response) => {
            this.snackBar.open('Item excluído com sucesso.', 'Fechar', {
              duration: 2000,
            });
            this.loadEstoqueItens(); // Atualiza a lista de itens após a exclusão
            this.hideEdit(); // Fecha o editor após a exclusão
          },
          (error) => {
            console.error('Erro ao excluir item', error);
          }
        );
      }
    });
  }

  openDialog(
    enterAnimationDuration: string,
    exitAnimationDuration: string
  ): void {
    this.dialog.open(DialofAdicionarEstoqueComponent, {
      enterAnimationDuration,
      exitAnimationDuration,
    });
  }
}
